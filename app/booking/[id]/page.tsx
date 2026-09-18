'use client'

import Link from 'next/link'
import { use, useEffect, useState } from 'react'
import { CalendarDays, CheckCircle2, Clock3, CreditCard, ShieldCheck } from 'lucide-react'
import { BookingFooter, MobileShell } from '@/components/mobile-shell'
import { createClient } from '@/lib/supabase/client'

type BookingStep = 'details' | 'review' | 'payment'

type CompanionInfo = {
  id: string
  display_name: string | null
  bio: string | null
  profile_photo_url: string | null
  city: string | null
  starting_price: number | null
  categories: string[] | null
}

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [companion, setCompanion] = useState<CompanionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<BookingStep>('details')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('6:00 PM')
  const [duration, setDuration] = useState(1)
  const [activity, setActivity] = useState('')
  const [location, setLocation] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('companion_profiles')
        .select('id, bio, city, starting_price, categories, profiles!inner(display_name, profile_photo_url)')
        .eq('id', id)
        .single()
      if (data) {
        const profiles = data.profiles as unknown as { display_name: string | null; profile_photo_url: string | null }
        setCompanion({
          id: data.id,
          bio: data.bio,
          city: data.city,
          starting_price: data.starting_price,
          categories: data.categories,
          display_name: profiles.display_name,
          profile_photo_url: profiles.profile_photo_url,
        })
        setActivity(data.categories?.[0] ?? '')
      }
      setLoading(false)
    }
    load()
  }, [id])

  async function submitBooking() {
    setSubmitting(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('You must be logged in to book.'); setSubmitting(false); return }

    const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single()
    if (!profile) { setError('Profile not found. Please complete registration.'); setSubmitting(false); return }

    if (!date) { setError('Please choose a date.'); setSubmitting(false); return }
    if (!location) { setError('Please enter a meeting location.'); setSubmitting(false); return }

    const amount = (companion?.starting_price ?? 999) * duration
    const platformFee = Math.round(amount * 0.15)

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        customer_profile_id: profile.id,
        companion_profile_id: id,
        status: 'pending',
        scheduled_date: date,
        scheduled_time: time,
        duration_hours: duration,
        location,
        notes: note || null,
        total_amount: amount,
        currency: 'INR',
        platform_fee: platformFee,
        companion_earnings: amount - platformFee,
      })
      .select('id')
      .single()

    if (bookingError) {
      setError(bookingError.message)
      setSubmitting(false)
      return
    }

    // Create notification
    await supabase.from('notifications').insert({
      profile_id: profile.id,
      type: 'booking_created',
      title: 'Booking request sent',
      body: `Your booking request with ${companion?.display_name ?? 'the companion'} has been sent.`,
    })

    setBookingId(booking.id)
    setSubmitting(false)
  }

  if (loading) return <MobileShell title="Booking"><div className="p-8 text-center text-sm text-[#738078]">Loading…</div></MobileShell>
  if (!companion) return <MobileShell title="Booking"><main className="mx-auto max-w-xl px-4 py-12"><h1 className="text-2xl font-semibold">This companion is not available</h1><Link href="/discover" className="mt-6 inline-flex rounded-full bg-[#173f35] px-5 py-3 text-sm font-semibold text-white">Back to discover</Link></main></MobileShell>

  const amount = (companion.starting_price ?? 999) * duration

  if (bookingId) {
    return (
      <MobileShell title="Booking confirmed" showBack>
        <main className="mx-auto max-w-xl px-4 py-12">
          <div className="rounded-[24px] border border-[#cfe2d3] bg-[#f4faf4] p-6">
            <CheckCircle2 className="size-9 text-[#4e8068]" />
            <h2 className="mt-4 text-xl font-semibold">Booking request sent!</h2>
            <p className="mt-2 text-sm leading-6 text-[#52665a]">Your booking with {companion.display_name} has been submitted and is pending their acceptance. You will be notified once they respond.</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[#738078]">Date</span><span className="font-medium">{date}</span></div>
              <div className="flex justify-between"><span className="text-[#738078]">Time</span><span className="font-medium">{time}</span></div>
              <div className="flex justify-between"><span className="text-[#738078]">Duration</span><span className="font-medium">{duration}h</span></div>
              <div className="flex justify-between"><span className="text-[#738078]">Total</span><span className="font-semibold">₹{amount.toLocaleString('en-IN')}</span></div>
            </div>
            <Link href="/dashboard" className="mt-6 inline-flex rounded-full bg-[#173f35] px-5 py-3 text-sm font-semibold text-white">View my bookings</Link>
          </div>
        </main>
      </MobileShell>
    )
  }

  return (
    <MobileShell title={`Book with ${companion.display_name}`} showBack>
      <main className="mx-auto max-w-xl px-4 pb-36 pt-6">
        <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.12em] text-[#9aa59f]">
          <span className={step === 'details' ? 'text-[#173f35]' : ''}>1 Details</span>
          <span>•</span>
          <span className={step === 'review' ? 'text-[#173f35]' : ''}>2 Review</span>
          <span>•</span>
          <span className={step === 'payment' ? 'text-[#173f35]' : ''}>3 Confirm</span>
        </div>

        {step === 'details' && (
          <section className="rounded-[24px] border border-[#e9e2d9] bg-white p-5">
            <p className="text-sm leading-6 text-[#68756e]">Choose a public, comfortable plan. You will see the full price before confirming.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="rounded-2xl border border-[#e9e2d9] p-4 text-sm font-medium">
                Date
                <input type="date" required value={date} onChange={(e) => { setDate(e.target.value); setError('') }}
                  className="mt-3 w-full rounded-xl border border-[#e9e2d9] bg-[#fbfaf7] p-3" />
              </label>
              <label className="rounded-2xl border border-[#e9e2d9] p-4 text-sm font-medium">
                Time
                <select value={time} onChange={(e) => setTime(e.target.value)}
                  className="mt-3 w-full rounded-xl border border-[#e9e2d9] bg-[#fbfaf7] p-3">
                  <option>10:00 AM</option><option>12:00 PM</option><option>3:00 PM</option>
                  <option>5:00 PM</option><option>6:00 PM</option><option>7:30 PM</option><option>9:00 PM</option>
                </select>
              </label>
              <label className="rounded-2xl border border-[#e9e2d9] p-4 text-sm font-medium">
                Duration (hours)
                <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}
                  className="mt-3 w-full rounded-xl border border-[#e9e2d9] bg-[#fbfaf7] p-3">
                  <option value={1}>1 hour</option><option value={2}>2 hours</option><option value={3}>3 hours</option>
                </select>
              </label>
              <label className="rounded-2xl border border-[#e9e2d9] p-4 text-sm font-medium">
                Activity
                <select value={activity} onChange={(e) => setActivity(e.target.value)}
                  className="mt-3 w-full rounded-xl border border-[#e9e2d9] bg-[#fbfaf7] p-3">
                  {(companion.categories ?? []).map((cat) => <option key={cat}>{cat}</option>)}
                </select>
              </label>
            </div>
            <label className="mt-4 block rounded-2xl border border-[#e9e2d9] p-4 text-sm font-medium">
              Meeting location
              <input value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Starbucks, Connaught Place, Delhi"
                className="mt-3 w-full rounded-xl border border-[#e9e2d9] bg-[#fbfaf7] p-3" />
            </label>
            <label className="mt-4 block rounded-2xl border border-[#e9e2d9] p-4 text-sm font-medium">
              Message <span className="font-normal text-[#8a968f]">(optional)</span>
              <textarea value={note} onChange={(e) => setNote(e.target.value)}
                className="mt-3 min-h-20 w-full resize-none rounded-xl border border-[#e9e2d9] bg-[#fbfaf7] p-3"
                placeholder="Share anything useful about your plan." />
            </label>
            {error && <p className="mt-4 rounded-xl bg-[#fff3ed] px-4 py-3 text-sm text-[#a04f39]">{error}</p>}
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#f5f8f3] p-4 text-sm">
              <Clock3 className="size-5 shrink-0 text-[#4e8068]" />
              <span>Total: ₹{amount.toLocaleString('en-IN')} for {duration}h</span>
            </div>
          </section>
        )}

        {step === 'review' && (
          <section className="rounded-[24px] border border-[#e9e2d9] bg-white p-5">
            <h2 className="text-xl font-semibold">Review your booking</h2>
            <div className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between gap-4"><span className="text-[#738078]">Companion</span><span className="font-semibold">{companion.display_name}</span></div>
              <div className="flex justify-between gap-4"><span className="text-[#738078]">Date</span><span className="font-semibold">{date}</span></div>
              <div className="flex justify-between gap-4"><span className="text-[#738078]">Time</span><span className="font-semibold">{time}</span></div>
              <div className="flex justify-between gap-4"><span className="text-[#738078]">Duration</span><span className="font-semibold">{duration}h</span></div>
              <div className="flex justify-between gap-4"><span className="text-[#738078]">Activity</span><span className="font-semibold">{activity}</span></div>
              <div className="flex justify-between gap-4"><span className="text-[#738078]">Location</span><span className="font-semibold text-right">{location}</span></div>
              <div className="border-t border-[#eee9e2] pt-4">
                <div className="flex justify-between text-base font-semibold"><span>Total</span><span>₹{amount.toLocaleString('en-IN')}</span></div>
              </div>
            </div>
            <p className="mt-5 flex gap-2 rounded-2xl bg-[#f5f8f3] p-4 text-sm leading-6 text-[#52665a]">
              <ShieldCheck className="size-5 shrink-0 text-[#4e8068]" />
              Lawful, non-sexual social companionship only. Meet in public and keep plans respectful.
            </p>
          </section>
        )}

        {step === 'payment' && (
          <section className="rounded-[24px] border border-[#e9e2d9] bg-white p-5">
            <div className="flex items-start gap-3">
              <CreditCard className="mt-1 size-6 text-[#c36d4d]" />
              <div>
                <h2 className="text-xl font-semibold">Confirm booking</h2>
                <p className="mt-2 text-sm leading-6 text-[#68756e]">Your booking request will be sent. Payment will be collected once accepted.</p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-[#e9e2d9] p-4 text-sm">
              <div className="flex justify-between font-semibold text-base"><span>Total</span><span>₹{amount.toLocaleString('en-IN')}</span></div>
              <p className="mt-1 text-xs text-[#738078]">Includes 15% platform fee. Payment due on acceptance.</p>
            </div>
            {error && <p className="mt-4 rounded-xl bg-[#fff3ed] px-4 py-3 text-sm text-[#a04f39]">{error}</p>}
            <button
              type="button"
              disabled={submitting}
              onClick={submitBooking}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#173f35] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              <CheckCircle2 className="size-4" />
              {submitting ? 'Sending request…' : 'Send booking request'}
            </button>
          </section>
        )}

        {step === 'details' && (
          <BookingFooter
            price={`₹${amount.toLocaleString('en-IN')}`}
            onContinue={() => { if (!date) { setError('Choose a date to continue.'); return } if (!location) { setError('Enter a meeting location.'); return } setError(''); setStep('review') }}
          />
        )}
        {step === 'review' && (
          <BookingFooter price={`₹${amount.toLocaleString('en-IN')}`} label="Continue to confirm" onContinue={() => setStep('payment')} />
        )}
        {step === 'payment' && (
          <div className="mt-6 flex items-center gap-2 text-sm text-[#738078]">
            <CalendarDays className="size-4" />
            Booking request is created immediately. Payment collected after acceptance.
          </div>
        )}
      </main>
    </MobileShell>
  )
}
