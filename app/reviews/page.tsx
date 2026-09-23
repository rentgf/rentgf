'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Star } from 'lucide-react'
import { MobileShell } from '@/components/mobile-shell'
import { createClient } from '@/lib/supabase/client'

export default function ReviewsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingId = searchParams.get('bookingId')
  const companionId = searchParams.get('companionId')

  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirectTo=/reviews'); return }
      setUserId(user.id)
    }
    void checkAuth()
  }, [router])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!userId) { setError('Please sign in first.'); return }
    if (!companionId) { setError('No companion specified.'); return }
    setSubmitting(true)
    setError('')
    const supabase = createClient()
    const { error: insertError } = await supabase.from('reviews').insert({
      companion_profile_id: companionId,
      customer_profile_id: userId,
      booking_id: bookingId ?? undefined,
      rating,
      comment: text || null,
      is_visible: true,
      is_verified: !!bookingId,
      status: 'APPROVED',
    })
    if (insertError) { setError(insertError.message); setSubmitting(false); return }
    setSent(true)
    setSubmitting(false)
  }

  return (
    <MobileShell title="Share feedback" showBack>
      <main className="mx-auto max-w-xl px-4 py-8">
        <p className="text-sm font-semibold uppercase tracking-[.18em] text-[#c36d4d]">Leave a review</p>
        <h1 className="mt-2 text-3xl font-semibold">How did it go?</h1>
        {sent ? (
          <section className="mt-7 rounded-3xl border border-[#cfe2d3] bg-[#f4faf4] p-6">
            <CheckCircle2 className="size-8 text-[#4e8068]" />
            <h2 className="mt-4 text-xl font-semibold">Thanks for your feedback!</h2>
            <p className="mt-2 text-sm leading-6 text-[#68756e]">Your review has been submitted.</p>
            <Link href="/dashboard" className="mt-6 inline-flex rounded-full bg-[#173f35] px-5 py-3 text-sm font-semibold text-white">Back to bookings</Link>
          </section>
        ) : (
          <form onSubmit={submit} className="mt-7 rounded-3xl border border-[#e9e2d9] bg-white p-5">
            <div>
              <p className="text-sm font-semibold">Rating</p>
              <div className="mt-3 flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
                    <Star className={`size-8 ${n <= rating ? 'fill-[#e7a547] text-[#e7a547]' : 'text-[#d5d5d5]'}`} />
                  </button>
                ))}
              </div>
            </div>
            <label className="mt-5 block text-sm font-semibold">
              Your review
              <textarea
                required
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={5}
                placeholder="Share a respectful note about your experience."
                className="mt-2 w-full rounded-xl border border-[#e9e2d9] bg-[#fbfaf7] p-3 font-normal"
              />
            </label>
            {error && <p className="mt-3 rounded-xl bg-[#fff3ed] px-4 py-3 text-sm text-[#a04f39]">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="mt-5 w-full rounded-full bg-[#173f35] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Submit review'}
            </button>
          </form>
        )}
      </main>
    </MobileShell>
  )
}
