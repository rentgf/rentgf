'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CheckCircle2, Mail, MessageCircle, ShieldCheck } from 'lucide-react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('General inquiry')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // In production, wire this to an email service
    setSent(true)
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <Link href="/" className="text-lg font-semibold text-[#173f35]">rent<span className="text-[#d17b58]">gf</span></Link>
      <h1 className="mt-10 text-4xl font-semibold tracking-[-0.04em] text-[#173f35]">Contact us</h1>
      <p className="mt-3 text-sm leading-6 text-[#68756e]">Have a question, concern, or feedback? We are here to help.</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Mail, label: 'General', email: 'hello@rentgf.com' },
          { icon: ShieldCheck, label: 'Safety', email: 'safety@rentgf.com' },
          { icon: MessageCircle, label: 'Support', email: 'support@rentgf.com' },
        ].map(({ icon: Icon, label, email }) => (
          <a key={email} href={`mailto:${email}`} className="flex flex-col items-center gap-2 rounded-2xl border border-[#e9e2d9] bg-white p-5 text-center hover:bg-[#f5f8f3]">
            <Icon className="size-5 text-[#4e8068]" />
            <span className="text-sm font-semibold">{label}</span>
            <span className="text-xs text-[#68756e]">{email}</span>
          </a>
        ))}
      </div>

      <div className="mt-10 rounded-[24px] border border-[#e9e2d9] bg-white p-6">
        {sent ? (
          <div className="py-4 text-center">
            <CheckCircle2 className="mx-auto size-9 text-[#4e8068]" />
            <p className="mt-4 font-semibold text-[#173f35]">Message received!</p>
            <p className="mt-2 text-sm text-[#68756e]">We will get back to you within 24 hours.</p>
            <button onClick={() => { setName(''); setEmail(''); setMessage(''); setSent(false) }} className="mt-5 inline-flex rounded-full bg-[#173f35] px-5 py-2.5 text-sm font-semibold text-white">
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Your name
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Rahul Sharma"
                  className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-3 outline-none focus:ring-2 focus:ring-[#bdd2c7]" />
              </label>
              <label className="text-sm font-medium">
                Email
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                  className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-3 outline-none focus:ring-2 focus:ring-[#bdd2c7]" />
              </label>
            </div>
            <label className="text-sm font-medium">
              Subject
              <select value={subject} onChange={(e) => setSubject(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-3 outline-none focus:ring-2 focus:ring-[#bdd2c7]">
                <option>General inquiry</option>
                <option>Booking issue</option>
                <option>Safety concern</option>
                <option>Companion verification</option>
                <option>Payment issue</option>
                <option>Report a user</option>
                <option>Account deletion</option>
                <option>Other</option>
              </select>
            </label>
            <label className="text-sm font-medium">
              Message
              <textarea required value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or question in detail..."
                className="mt-2 min-h-32 w-full resize-none rounded-xl border border-[#e5e1da] px-3 py-3 outline-none focus:ring-2 focus:ring-[#bdd2c7]" />
            </label>
            <button type="submit" className="rounded-xl bg-[#173f35] px-4 py-3 font-semibold text-white">
              Send message
            </button>
          </form>
        )}
      </div>

      <div className="mt-16 flex gap-6 text-sm text-[#68756e]">
        <Link href="/privacy-policy" className="hover:text-[#173f35]">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-[#173f35]">Terms of Service</Link>
        <Link href="/" className="hover:text-[#173f35]">Home</Link>
      </div>
    </main>
  )
}
