'use client'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, Ban, MessageCircle, Send, ShieldCheck } from 'lucide-react'
import { MobileShell } from '@/components/mobile-shell'
import { createClient } from '@/lib/supabase/client'

type Message = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean | null
  created_at: string | null
}

type CompanionInfo = {
  companion_profile_id: string
  display_name: string | null
  profile_photo_url: string | null
  city: string | null
}

type Conversation = {
  id: string
  companion_profile_id: string
  customer_profile_id: string
  last_message_at: string | null
}

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const companionProfileId = searchParams.get('companion')
  const [profileId, setProfileId] = useState<string | null>(null)
  const [companion, setCompanion] = useState<CompanionInfo | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [sendError, setSendError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load current user
  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirectTo=/messages'); return }
      setProfileId(user.id)
    }
    loadUser()
  }, [router])

  // Load or create conversation if companionProfileId is given
  const loadConversation = useCallback(async () => {
    if (!profileId || !companionProfileId) return
    const supabase = createClient()
    const { data: cp } = await supabase
      .from('companion_profiles')
      .select('id, profile_id, city, profiles!inner(display_name, profile_photo_url)')
      .eq('id', companionProfileId)
      .single()
    if (cp) {
      const profiles = cp.profiles as unknown as { display_name: string | null; profile_photo_url: string | null }
      setCompanion({ companion_profile_id: cp.id, display_name: profiles.display_name, profile_photo_url: profiles.profile_photo_url, city: cp.city })
      // Stop here if the user blocked this companion.
      const { data: block } = await supabase.from('blocks').select('id').eq('blocker_id', profileId).eq('blocked_id', cp.profile_id).maybeSingle()
      if (block) { setBlocked(true); setLoading(false); return }
    }
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('customer_profile_id', profileId)
      .eq('companion_profile_id', companionProfileId)
      .maybeSingle()
    let convId = existing?.id
    if (!convId) {
      // Messaging unlocks only after a booking exists.
      const { data: booking } = await supabase
        .from('bookings')
        .select('id')
        .eq('customer_profile_id', profileId)
        .eq('companion_profile_id', companionProfileId)
        .limit(1)
        .maybeSingle()
      if (!booking) { setLoading(false); return }
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({ customer_profile_id: profileId, companion_profile_id: companionProfileId })
        .select('id').single()
      convId = newConv?.id
    }
    if (convId) {
      setConversationId(convId)
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true })
        .limit(200)
      setMessages(msgs ?? [])
    }
    setLoading(false)
  }, [profileId, companionProfileId])

  // Load all conversations if no specific companion
  const loadAllConversations = useCallback(async () => {
    if (!profileId || companionProfileId) return
    const supabase = createClient()
    // conversations.companion_profile_id references companion_profiles.id, not profiles.id.
    const [{ data: cp }, { data: blocks }] = await Promise.all([
      supabase.from('companion_profiles').select('id').eq('profile_id', profileId).maybeSingle(),
      supabase.from('blocks').select('blocked_id').eq('blocker_id', profileId),
    ])
    const filter = cp
      ? `customer_profile_id.eq.${profileId},companion_profile_id.eq.${cp.id}`
      : `customer_profile_id.eq.${profileId}`
    const { data } = await supabase
      .from('conversations')
      .select('id, companion_profile_id, customer_profile_id, last_message_at, companion_profiles!inner(profile_id)')
      .or(filter)
      .order('last_message_at', { ascending: false })
    const blockedIds = new Set((blocks ?? []).map((b) => b.blocked_id))
    const visible = (data ?? []).filter((c) => {
      const other = (c.companion_profiles as unknown as { profile_id: string }).profile_id
      return !blockedIds.has(other) && !blockedIds.has(c.customer_profile_id)
    })
    setConversations(visible.map(({ id, companion_profile_id, customer_profile_id, last_message_at }) => ({ id, companion_profile_id, customer_profile_id, last_message_at })))
    setLoading(false)
  }, [profileId, companionProfileId])

  useEffect(() => {
    if (companionProfileId) loadConversation()
    else loadAllConversations()
  }, [companionProfileId, loadConversation, loadAllConversations])

  // Real-time messages subscription
  useEffect(() => {
    if (!conversationId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanMessage = draft.trim()
    if (!cleanMessage || !conversationId || !profileId) return
    setSending(true)
    setSendError('')
    const supabase = createClient()
    const { error } = await supabase.from('messages').insert({ conversation_id: conversationId, sender_id: profileId, content: cleanMessage })
    if (error) {
      // The database rejects messages between blocked users.
      setSendError(error.message.includes('blocked') ? 'You can no longer message in this conversation.' : 'Message not sent. Please try again.')
    } else {
      setDraft('')
      await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId)
    }
    setSending(false)
  }

  if (!companionProfileId) {
    return (
      <MobileShell title="Your messages">
        <main className="mx-auto max-w-xl px-4 py-6">
          {loading ? (
            <p className="text-center text-sm text-[#738078]">Loading…</p>
          ) : conversations.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#edf4ed]">
                <MessageCircle className="size-7 text-[#4e8068]" />
              </div>
              <h1 className="mt-5 text-2xl font-semibold tracking-[-.05em]">No messages yet</h1>
              <p className="mt-2 text-sm leading-6 text-[#68756e]">Book a companion to start a conversation.</p>
              <Link href="/discover" className="mt-6 inline-flex rounded-full bg-[#173f35] px-5 py-3 text-sm font-semibold text-white">Discover companions</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {conversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/messages?companion=${conv.companion_profile_id}`}
                  className="flex items-center gap-3 rounded-2xl border border-[#e9e2d9] bg-white p-4 hover:bg-[#f5f8f3]"
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-[#dce9dd] text-[#173f35]">
                    <MessageCircle className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[#173f35]">Conversation</p>
                    <p className="truncate text-xs text-[#738078]">
                      {conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString() : 'No messages yet'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </MobileShell>
    )
  }

  if (loading) return <MobileShell title="Messages" showBack><div className="p-8 text-center text-sm text-[#738078]">Loading…</div></MobileShell>

  if (blocked) {
    return (
      <MobileShell title="Messages" showBack>
        <main className="mx-auto max-w-xl px-4 py-12 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#fff3ed]">
            <Ban className="size-7 text-[#a04f39]" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-[-.05em]">You blocked this companion</h1>
          <p className="mt-3 text-sm leading-6 text-[#68756e]">Messages are turned off. Contact support if you blocked them by mistake.</p>
          <Link href="/discover" className="mt-7 inline-flex rounded-full bg-[#173f35] px-5 py-3 text-sm font-semibold text-white">Back to discover</Link>
        </main>
      </MobileShell>
    )
  }

  if (!conversationId && companion) {
    return (
      <MobileShell title="Messages locked" showBack>
        <main className="mx-auto max-w-xl px-4 py-12 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#fff8ed]">
            <MessageCircle className="size-7 text-[#c36d4d]" />
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-[-.05em]">Book before messaging</h1>
          <p className="mt-3 text-sm leading-6 text-[#68756e]">Messaging opens after you create a booking with this companion.</p>
          <Link href={`/booking/${companionProfileId}`} className="mt-7 inline-flex rounded-full bg-[#173f35] px-5 py-3 text-sm font-semibold text-white">Book now</Link>
        </main>
      </MobileShell>
    )
  }

  return (
    <MobileShell title={`Chat with ${companion?.display_name ?? 'companion'}`} showBack>
      <main className="mx-auto flex min-h-[calc(100vh-150px)] max-w-xl flex-col px-4 pb-6 pt-5">
        {companion && (
          <Link href={`/companions/${companionProfileId}`} className="mb-4 inline-flex items-center gap-2 text-sm text-[#68756e]">
            <ArrowLeft className="size-4" /> Back to profile
          </Link>
        )}
        {companion && (
          <section className="rounded-[24px] border border-[#e9e2d9] bg-white p-4">
            <div className="flex items-center gap-3">
              {companion.profile_photo_url ? (
                <img src={companion.profile_photo_url} alt="" className="size-12 rounded-full object-cover" />
              ) : (
                <div className="flex size-12 items-center justify-center rounded-full bg-[#dce9dd] text-[#173f35] font-semibold">
                  {companion.display_name?.[0] ?? '?'}
                </div>
              )}
              <div>
                <h1 className="flex items-center gap-1 text-lg font-semibold">{companion.display_name}<ShieldCheck className="size-4 text-[#4e8c70]" /></h1>
                <p className="text-xs text-[#718079]">{companion.city ?? ''} · Verified companion</p>
              </div>
            </div>
            <p className="mt-4 rounded-2xl bg-[#f5f8f3] px-4 py-3 text-sm leading-6 text-[#4f6259]">Keep messages respectful and limited to lawful, non-sexual social activities.</p>
          </section>
        )}
        <div className="mt-5 flex-1 overflow-y-auto rounded-[24px] border border-[#e9e2d9] bg-white p-4">
          {messages.length === 0 ? (
            <p className="mt-8 text-center text-sm text-[#718079]">Say hello and share what kind of outing you have in mind.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.map((message) => (
                <p
                  key={message.id}
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.sender_id === profileId
                      ? 'ml-auto rounded-br-md bg-[#173f35] text-white'
                      : 'mr-auto rounded-bl-md bg-[#f0f4ef] text-[#173f35]'
                  }`}
                >
                  {message.content}
                </p>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
        {sendError && <p className="mt-3 rounded-xl bg-[#fff3ed] px-4 py-3 text-sm text-[#a04f39]">{sendError}</p>}
        <form onSubmit={sendMessage} className="mt-4 flex items-center gap-2">
          <label htmlFor="message-draft" className="sr-only">Write a message</label>
          <input
            id="message-draft"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write a message..."
            className="min-w-0 flex-1 rounded-full border border-[#dce5dd] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#bdd2c7]"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            aria-label="Send message"
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#173f35] text-white disabled:opacity-60"
          >
            <Send className="size-4" />
          </button>
        </form>
      </main>
    </MobileShell>
  )
}
