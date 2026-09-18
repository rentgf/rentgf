'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { ArrowLeft, MessageCircle, Send, ShieldCheck } from 'lucide-react'
import { MobileShell } from '@/components/mobile-shell'
import { companions } from '@/lib/domain/rentgf'
import { hasBookingAccess } from '@/lib/booking-access'

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const companionId = searchParams.get('companion')
  const companion = companions.find((item) => item.id === companionId)
  const [messages, setMessages] = useState<string[]>([])
  const [draft, setDraft] = useState('')

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanMessage = draft.trim()
    if (!cleanMessage) return
    setMessages((current) => [...current, cleanMessage])
    setDraft('')
  }

  if (companion && !hasBookingAccess(companion.id)) {
    return <MobileShell title="Messages locked" showBack><main className="mx-auto max-w-xl px-4 py-12 text-center"><div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#fff8ed]"><MessageCircle className="size-7 text-[#c36d4d]" /></div><h1 className="mt-5 text-3xl font-semibold tracking-[-.05em]">Book before messaging</h1><p className="mt-3 text-sm leading-6 text-[#68756e]">Messaging opens after you complete a booking with this companion.</p><Link href={`/booking/${companion.id}`} className="mt-7 inline-flex rounded-full bg-[#173f35] px-5 py-3 text-sm font-semibold text-white">Book now</Link></main></MobileShell>
  }

  if (!companion) {
    return <MobileShell title="Your messages" showBack><main className="mx-auto max-w-xl px-4 py-12 text-center"><div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#edf4ed]"><MessageCircle className="size-7 text-[#4e8068]" /></div><h1 className="mt-5 text-3xl font-semibold tracking-[-.05em]">Your messages</h1><p className="mt-3 text-sm leading-6 text-[#68756e]">Open a companion profile to start a conversation.</p><Link href="/discover" className="mt-7 inline-flex rounded-full bg-[#173f35] px-5 py-3 text-sm font-semibold text-white">Discover companions</Link></main></MobileShell>
  }

  return <MobileShell title={`Chat with ${companion.displayName}`} showBack><main className="mx-auto flex min-h-[calc(100vh-150px)] max-w-xl flex-col px-4 pb-6 pt-5"><Link href={`/companions/${companion.id}`} className="mb-4 inline-flex items-center gap-2 text-sm text-[#68756e]"><ArrowLeft className="size-4" /> Back to profile</Link><section className="rounded-[24px] border border-[#e9e2d9] bg-white p-4"><div className="flex items-center gap-3"><img src={companion.photoUrl} alt="" className="size-12 rounded-full object-cover" /><div><h1 className="flex items-center gap-1 text-lg font-semibold">{companion.displayName}<ShieldCheck className="size-4 text-[#4e8c70]" /></h1><p className="text-xs text-[#718079]">{companion.city.name} · Verified companion</p></div></div><p className="mt-4 rounded-2xl bg-[#f5f8f3] px-4 py-3 text-sm leading-6 text-[#4f6259]">Keep messages respectful and limited to lawful, non-sexual social activities.</p></section><div className="mt-5 flex-1 rounded-[24px] border border-[#e9e2d9] bg-white p-4"><p className="text-center text-xs text-[#89958d]">Start the conversation</p>{messages.length === 0 ? <p className="mt-8 text-center text-sm text-[#718079]">Say hello and share what kind of outing you have in mind.</p> : <div className="mt-5 flex flex-col gap-3">{messages.map((message, index) => <p key={`${message}-${index}`} className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[#173f35] px-4 py-3 text-sm leading-6 text-white">{message}</p>)}</div>}</div><form onSubmit={sendMessage} className="mt-4 flex items-center gap-2"><label htmlFor="message-draft" className="sr-only">Write a message</label><input id="message-draft" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message..." className="min-w-0 flex-1 rounded-full border border-[#dce5dd] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#bdd2c7]" /><button type="submit" aria-label="Send message" className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#173f35] text-white"><Send className="size-4" /></button></form></main></MobileShell>
}
