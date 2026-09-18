'use client'

import Link from 'next/link'
import { use, useState } from 'react'
import { CalendarDays, CheckCircle2, Clock3, CreditCard, ShieldCheck } from 'lucide-react'
import { companions, platformSettings } from '@/lib/domain/rentgf'
import { BookingFooter, MobileShell } from '@/components/mobile-shell'
import { grantBookingAccess } from '@/lib/booking-access'
import { addPreviewNotification, savePreviewBooking } from '@/lib/preview-data'

type BookingStep = 'details' | 'review' | 'payment'

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const person = companions.find((item) => item.id === id)
  const [step, setStep] = useState<BookingStep>('details')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('6:00 PM')
  const [duration, setDuration] = useState('60 minutes')
  const [activity, setActivity] = useState(person?.categories[0]?.name ?? 'Coffee & conversation')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [paymentComplete, setPaymentComplete] = useState(false)

  if (!person) return <MobileShell title="Booking"><main className="mx-auto max-w-xl px-4 py-12"><h1 className="text-2xl font-semibold">This companion is not available</h1><Link href="/discover" className="mt-6 inline-flex rounded-full bg-[#173f35] px-5 py-3 text-sm font-semibold text-white">Back to discover</Link></main></MobileShell>

  const amount = person.startingPrice
  const isPaymentConnected = false
  const isPreviewPayment = process.env.NODE_ENV !== 'production'
  function continueToReview() {
    if (!date) { setError('Choose a date to continue.'); return }
    setError('')
    setStep('review')
  }

  function continueToPayment() {
    setError('')
    setStep('payment')
  }

  return <MobileShell title={`Book with ${person.displayName}`} showBack>
    <main className="mx-auto max-w-xl px-4 pb-36 pt-6">
      <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.12em] text-[#9aa59f]"><span className={step === 'details' ? 'text-[#173f35]' : ''}>1 Details</span><span>•</span><span className={step === 'review' ? 'text-[#173f35]' : ''}>2 Review</span><span>•</span><span className={step === 'payment' ? 'text-[#173f35]' : ''}>3 Payment</span></div>
      {step === 'details' && <section className="rounded-[24px] border border-[#e9e2d9] bg-white p-5"><p className="text-sm leading-6 text-[#68756e]">Choose a public, comfortable plan. You will see the full price before payment.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="rounded-2xl border border-[#e9e2d9] p-4 text-sm font-medium">Date<input aria-label="Booking date" type="text" inputMode="numeric" placeholder="YYYY-MM-DD" value={date} onChange={(event) => { setDate(event.target.value); setError('') }} className="mt-3 w-full rounded-xl border border-[#e9e2d9] bg-[#fbfaf7] p-3" /><span className="mt-2 block text-xs font-normal text-[#7c8982]">Choose a future date.</span></label><label className="rounded-2xl border border-[#e9e2d9] p-4 text-sm font-medium">Time<select aria-label="Booking time" value={time} onChange={(event) => setTime(event.target.value)} className="mt-3 w-full rounded-xl border border-[#e9e2d9] bg-[#fbfaf7] p-3"><option>6:00 PM</option><option>7:30 PM</option><option>9:00 PM</option></select></label><label className="rounded-2xl border border-[#e9e2d9] p-4 text-sm font-medium">Duration<select aria-label="Booking duration" value={duration} onChange={(event) => setDuration(event.target.value)} className="mt-3 w-full rounded-xl border border-[#e9e2d9] bg-[#fbfaf7] p-3"><option>60 minutes</option><option>90 minutes</option><option>120 minutes</option></select></label><label className="rounded-2xl border border-[#e9e2d9] p-4 text-sm font-medium">Activity<select aria-label="Booking activity" value={activity} onChange={(event) => setActivity(event.target.value)} className="mt-3 w-full rounded-xl border border-[#e9e2d9] bg-[#fbfaf7] p-3">{person.categories.map((category) => <option key={category.id}>{category.name}</option>)}</select></label></div>{error && <p className="mt-4 rounded-xl bg-[#fff3ed] px-4 py-3 text-sm text-[#a04f39]" role="alert">{error}</p>}<label className="mt-4 block rounded-2xl border border-[#e9e2d9] p-4 text-sm font-medium">Message <span className="font-normal text-[#8a968f]">(optional)<textarea value={note} onChange={(event) => setNote(event.target.value)} className="mt-3 min-h-24 w-full resize-none rounded-xl border border-[#e9e2d9] bg-[#fbfaf7] p-3" placeholder="Share anything useful about your plan." /></span></label>{error && <p className="mt-4 rounded-xl bg-[#fff2ed] px-4 py-3 text-sm text-[#9e5038]" role="alert">{error}</p>}<div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#f5f8f3] p-4 text-sm"><Clock3 className="size-5 shrink-0 text-[#4e8068]" /><span>Starting at ₹{amount.toLocaleString('en-IN')} for {duration.toLowerCase()}.</span></div></section>}
      {step === 'review' && <section className="rounded-[24px] border border-[#e9e2d9] bg-white p-5"><h2 className="text-xl font-semibold">Review your booking</h2><div className="mt-5 grid gap-3 text-sm"><div className="flex justify-between gap-4"><span className="text-[#738078]">Companion</span><span className="font-semibold">{person.displayName}</span></div><div className="flex justify-between gap-4"><span className="text-[#738078]">Date and time</span><span className="font-semibold">{date} · {time}</span></div><div className="flex justify-between gap-4"><span className="text-[#738078]">Plan</span><span className="font-semibold text-right">{activity} · {duration}</span></div><div className="border-t border-[#eee9e2] pt-4"><div className="flex justify-between text-base font-semibold"><span>Total</span><span>₹{amount.toLocaleString('en-IN')}</span></div></div></div><p className="mt-5 flex gap-2 rounded-2xl bg-[#f5f8f3] p-4 text-sm leading-6 text-[#52665a]"><ShieldCheck className="size-5 shrink-0 text-[#4e8068]" />Lawful, non-sexual social companionship only. Meet in public and keep plans respectful.</p></section>}
      {step === 'payment' && !paymentComplete && <section className="rounded-[24px] border border-[#e9e2d9] bg-white p-5"><div className="flex items-start gap-3"><CreditCard className="mt-1 size-6 text-[#c36d4d]" /><div><h2 className="text-xl font-semibold">Secure payment</h2><p className="mt-2 text-sm leading-6 text-[#68756e]">Your payment provider will open here when the connection is configured.</p></div></div><div className="mt-5 rounded-2xl bg-[#fff8ed] p-4 text-sm leading-6 text-[#745b35]">{isPreviewPayment ? 'Preview test mode is on. This does not charge money or create a real booking.' : 'Payment is not connected yet. We will never mark a booking as paid until the provider confirms it.'}</div>{isPreviewPayment ? <button type="button" onClick={() => { const bookingId = `preview-${Date.now()}`; grantBookingAccess(person.id); savePreviewBooking({ id: bookingId, companionId: person.id, companionName: person.displayName, date, time, duration, activity, amount, status: 'confirmed', createdAt: new Date().toISOString() }); addPreviewNotification('Booking confirmed', `Your preview booking with ${person.displayName} is confirmed.`); setPaymentComplete(true) }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#173f35] px-5 py-3 text-sm font-semibold text-white"><CheckCircle2 className="size-4" />Complete preview payment · ₹{amount.toLocaleString('en-IN')}</button> : <button type="button" disabled={!isPaymentConnected} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#173f35] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"><CreditCard className="size-4" />Pay ₹{amount.toLocaleString('en-IN')}</button>}</section>}
      {step === 'payment' && paymentComplete && <section className="rounded-[24px] border border-[#cfe2d3] bg-[#f4faf4] p-5"><CheckCircle2 className="size-9 text-[#4e8068]" /><h2 className="mt-4 text-xl font-semibold">Preview booking confirmed</h2><p className="mt-2 text-sm leading-6 text-[#52665a]">This is a test booking only. No money was charged. A real booking will be created after payment services are connected.</p><Link href="/profile" className="mt-5 inline-flex rounded-full bg-[#173f35] px-5 py-3 text-sm font-semibold text-white">View my profile</Link></section>}
      {step === 'details' && <BookingFooter price={`₹${amount.toLocaleString('en-IN')}`} onContinue={continueToReview} />}
      {step === 'review' && <BookingFooter price={`₹${amount.toLocaleString('en-IN')}`} label="Continue to payment" onContinue={continueToPayment} />}
      {step === 'payment' && <div className="mt-6 flex items-center gap-2 text-sm text-[#738078]"><CalendarDays className="size-4" />Booking is only created after verified payment.</div>}
    </main>
  </MobileShell>
}
