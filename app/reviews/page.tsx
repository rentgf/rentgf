'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { MobileShell } from '@/components/mobile-shell'
import { savePreviewReview } from '@/lib/preview-data'

export default function ReviewsPage() {
  const [rating, setRating] = useState('5')
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)
  function submit(event: FormEvent) { event.preventDefault(); savePreviewReview({ id: `review-${Date.now()}`, bookingId: 'preview-latest', rating: Number(rating), text, createdAt: new Date().toISOString() }); setSent(true) }
  return <MobileShell title="Share feedback" showBack><main className="mx-auto max-w-xl px-4 py-8"><p className="text-sm font-semibold uppercase tracking-[.18em] text-[#c36d4d]">Preview review</p><h1 className="mt-2 text-3xl font-semibold">How did it go?</h1>{sent ? <section className="mt-7 rounded-3xl border border-[#cfe2d3] bg-[#f4faf4] p-6"><Star className="size-8 fill-[#d17b58] text-[#d17b58]" /><h2 className="mt-4 text-xl font-semibold">Thanks for your feedback</h2><p className="mt-2 text-sm leading-6 text-[#68756e]">Your review is stored in preview mode only.</p><Link href="/dashboard" className="mt-6 inline-flex rounded-full bg-[#173f35] px-5 py-3 text-sm font-semibold text-white">Back to bookings</Link></section> : <form onSubmit={submit} className="mt-7 rounded-3xl border border-[#e9e2d9] bg-white p-5"><label className="block text-sm font-semibold">Rating<select value={rating} onChange={(event) => setRating(event.target.value)} className="mt-2 w-full rounded-xl border border-[#e9e2d9] bg-[#fbfaf7] p-3"><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select></label><label className="mt-4 block text-sm font-semibold">Your review<textarea required value={text} onChange={(event) => setText(event.target.value)} rows={5} placeholder="Share a respectful note about your experience." className="mt-2 w-full rounded-xl border border-[#e9e2d9] bg-[#fbfaf7] p-3 font-normal" /></label><button type="submit" className="mt-5 w-full rounded-full bg-[#173f35] px-5 py-3 text-sm font-semibold text-white">Submit review</button></form>}</main></MobileShell>
}
