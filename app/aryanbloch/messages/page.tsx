'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Inbox, Mail } from 'lucide-react'

type ContactMessage = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: 'new' | 'replied'
  created_at: string
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/aryanbloch/messages', { cache: 'no-store' })
      .then(async (res) => {
        const json = (await res.json()) as { messages?: ContactMessage[]; error?: string }
        if (!res.ok) setError(json.error ?? 'Could not load messages')
        setMessages(json.messages ?? [])
      })
      .catch(() => setError('Could not load messages'))
      .finally(() => setLoading(false))
  }, [])

  async function setStatus(messageId: string, status: 'new' | 'replied') {
    const res = await fetch('/api/aryanbloch/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, status }),
    })
    if (!res.ok) { setError('Could not update message'); return }
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, status } : m)))
  }

  const newCount = messages.filter((m) => m.status === 'new').length

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-[#173f35]">Messages</h1>
      <p className="mt-1 text-sm text-[#68756e]">
        Contact form messages from visitors. {newCount > 0 ? `${newCount} waiting for a reply.` : ''}
      </p>

      {error && <p className="mt-4 rounded-xl bg-[#fff3ed] px-4 py-3 text-sm text-[#a04f39]">{error}</p>}

      <div className="mt-5">
        {loading ? (
          <p className="text-sm text-[#68756e]">Loading…</p>
        ) : messages.length === 0 ? (
          <div className="rounded-2xl border border-[#e9e2d9] bg-white p-8 text-center">
            <Inbox className="mx-auto size-8 text-[#4e8068]" />
            <p className="mt-3 font-semibold">No messages yet</p>
            <p className="mt-1 text-sm text-[#68756e]">Messages sent from the Contact page will show up here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`rounded-2xl border bg-white p-4 ${m.status === 'replied' ? 'border-[#cfe2d3]' : 'border-[#f0d9ca]'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{m.name} <span className="font-normal text-[#738078]">· {m.subject}</span></p>
                    <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`} className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-medium text-[#c36d4d]">
                      <Mail className="size-3.5" /> {m.email}
                    </a>
                    <p className="mt-3 whitespace-pre-wrap break-words text-sm text-[#52645b]">{m.message}</p>
                    <p className="mt-3 text-xs text-[#9aa49d]">{new Date(m.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`} className="rounded-full bg-[#173f35] px-3 py-1.5 text-xs font-semibold text-white">Reply</a>
                    {m.status === 'new' ? (
                      <button type="button" onClick={() => setStatus(m.id, 'replied')} className="cursor-pointer rounded-full bg-[#edf4ed] px-3 py-1.5 text-xs font-semibold text-[#4e8068]">Mark replied</button>
                    ) : (
                      <button type="button" onClick={() => setStatus(m.id, 'new')} className="flex cursor-pointer items-center gap-1 rounded-full bg-[#edf4ed] px-3 py-1.5 text-xs font-semibold text-[#4e8068]">
                        <CheckCircle2 className="size-3.5" /> Replied
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
