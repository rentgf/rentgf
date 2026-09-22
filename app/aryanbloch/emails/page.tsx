'use client'

import { useState } from 'react'
import { CheckCircle2, Mail, Send } from 'lucide-react'
import {
  otpTemplate,
  welcomeTemplate,
  bookingConfirmedTemplate,
  bookingCancelledTemplate,
  companionApprovedTemplate,
  companionRejectedTemplate,
  paymentReceiptTemplate,
  bookingRequestTemplate,
  bookingReminderTemplate,
} from '@/lib/email/templates'

type TemplateKey =
  | 'otp'
  | 'welcome'
  | 'booking-request'
  | 'booking-confirmed'
  | 'booking-cancelled'
  | 'payment-receipt'
  | 'companion-approved'
  | 'companion-rejected'
  | 'booking-reminder'

const TEMPLATES: { key: TemplateKey; label: string; description: string }[] = [
  { key: 'otp', label: 'OTP Verification', description: 'Sent on signup to verify email address' },
  { key: 'welcome', label: 'Welcome', description: 'Sent after successful OTP verification' },
  { key: 'booking-request', label: 'Booking Request', description: 'Sent to companion when customer books' },
  { key: 'booking-confirmed', label: 'Booking Confirmed', description: 'Sent to customer when companion accepts' },
  { key: 'booking-cancelled', label: 'Booking Cancelled', description: 'Sent to both parties on cancellation' },
  { key: 'payment-receipt', label: 'Payment Receipt', description: 'Sent to customer after payment' },
  { key: 'companion-approved', label: 'Companion Approved', description: 'Sent when admin approves companion' },
  { key: 'companion-rejected', label: 'Companion Rejected', description: 'Sent when admin rejects companion' },
  { key: 'booking-reminder', label: 'Booking Reminder', description: 'Sent 24h before booking' },
]

function getPreview(key: TemplateKey): string {
  const now = new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  switch (key) {
    case 'otp': return otpTemplate('Priya', '847291')
    case 'welcome': return welcomeTemplate('Priya')
    case 'booking-request': return bookingRequestTemplate('Aanya', 'Rahul', now, 2, 1998, 'booking-demo-id')
    case 'booking-confirmed': return bookingConfirmedTemplate('Rahul', 'Aanya', now, 2, 1998, 'booking-demo-id')
    case 'booking-cancelled': return bookingCancelledTemplate('Rahul', 'Aanya', now, true, 'booking-demo-id')
    case 'payment-receipt': return paymentReceiptTemplate('Rahul', 'Aanya', now, 1998, 'order_demo123', 'booking-demo-id')
    case 'companion-approved': return companionApprovedTemplate('Aanya')
    case 'companion-rejected': return companionRejectedTemplate('Aanya', 'Profile photos do not meet our quality guidelines.')
    case 'booking-reminder': return bookingReminderTemplate('Rahul', 'Aanya', now, 'booking-demo-id')
  }
}

export default function AdminEmailsPage() {
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>('otp')
  const [senderEmail, setSenderEmail] = useState(process.env.NEXT_PUBLIC_EMAIL_FROM ?? 'no-reply@rentgf.site')
  const [editingSender, setEditingSender] = useState(false)
  const [newSender, setNewSender] = useState('')
  const [senderSaved, setSenderSaved] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function saveSender() {
    if (!newSender) return
    setSenderEmail(newSender)
    setEditingSender(false)
    setSenderSaved(true)
    setTimeout(() => setSenderSaved(false), 3000)
  }

  async function sendTestEmail() {
    if (!testEmail) return
    setSending(true)
    setSent(false)
    await fetch('/api/email/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: testEmail, template: activeTemplate }),
    })
    setSending(false)
    setSent(true)
    setTimeout(() => setSent(false), 4000)
  }

  const preview = getPreview(activeTemplate)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-[#173f35]">Email</h1>
      <p className="mt-1 text-sm text-[#68756e]">Preview templates, manage sender email, and send test emails.</p>

      <div className="mt-6 rounded-2xl border border-[#e9e2d9] bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-[#edf4ed]">
              <Mail className="size-4 text-[#4e8068]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#173f35]">Sender email</p>
              {editingSender ? (
                <input
                  type="email"
                  autoFocus
                  value={newSender}
                  onChange={(e) => setNewSender(e.target.value)}
                  placeholder={senderEmail}
                  className="mt-1 rounded-lg border border-[#e5e1da] px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#bdd2c7]"
                />
              ) : (
                <p className="text-sm text-[#68756e] font-mono">{senderEmail}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {senderSaved && <CheckCircle2 className="size-4 text-[#4e8068]" />}
            {editingSender ? (
              <>
                <button type="button" onClick={() => setEditingSender(false)} className="rounded-lg border border-[#e9e2d9] px-3 py-1.5 text-xs font-semibold text-[#68756e]">Cancel</button>
                <button type="button" onClick={saveSender} className="rounded-lg bg-[#173f35] px-3 py-1.5 text-xs font-semibold text-white">Save</button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => { setNewSender(senderEmail); setEditingSender(true) }}
                className="rounded-lg border border-[#e9e2d9] px-3 py-1.5 text-xs font-semibold text-[#52645b]"
              >
                Change
              </button>
            )}
          </div>
        </div>
        <p className="mt-3 text-xs text-[#9aa49d]">
          ⚠️ This must match a verified sender in your Resend account. Update <code className="font-mono">EMAIL_FROM</code> environment variable to persist changes across deployments.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-2xl border border-[#e9e2d9] bg-white overflow-hidden">
          <p className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#9aa49d] border-b border-[#f0ebe4]">Templates ({TEMPLATES.length})</p>
          <div className="divide-y divide-[#f5f1ec]">
            {TEMPLATES.map(({ key, label, description }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTemplate(key)}
                className={`w-full px-4 py-3 text-left transition-colors ${
                  activeTemplate === key ? 'bg-[#f0f4ef]' : 'hover:bg-[#faf8f5]'
                }`}
              >
                <p className={`text-sm font-semibold ${activeTemplate === key ? 'text-[#173f35]' : 'text-[#52645b]'}`}>{label}</p>
                <p className="mt-0.5 text-xs text-[#9aa49d]">{description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-[#e9e2d9] bg-white p-4">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Send test to: you@example.com"
              className="flex-1 rounded-xl border border-[#e5e1da] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#bdd2c7]"
            />
            <button
              type="button"
              disabled={sending || !testEmail}
              onClick={sendTestEmail}
              className="flex items-center gap-2 rounded-xl bg-[#173f35] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Send className="size-3.5" />
              {sending ? 'Sending…' : sent ? 'Sent!' : 'Send test'}
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e9e2d9] bg-white">
            <div className="flex items-center justify-between border-b border-[#f0ebe4] px-4 py-3">
              <p className="text-sm font-semibold text-[#173f35]">
                {TEMPLATES.find((t) => t.key === activeTemplate)?.label} preview
              </p>
              <span className="rounded-full bg-[#f0f4ef] px-2.5 py-1 text-xs font-medium text-[#4e8068]">HTML</span>
            </div>
            <iframe
              srcDoc={preview}
              title={`Preview: ${activeTemplate}`}
              className="w-full"
              style={{ height: '600px', border: 'none' }}
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
