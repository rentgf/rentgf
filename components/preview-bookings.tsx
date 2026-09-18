'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CalendarDays, CheckCircle2 } from 'lucide-react'
import { getPreviewBookings, type PreviewBooking } from '@/lib/preview-data'

export function PreviewBookings() {
  const [bookings, setBookings] = useState<PreviewBooking[]>([])
  useEffect(() => setBookings(getPreviewBookings()), [])
  if (!bookings.length) return <section className="rounded-2xl border border-[#e9e2d9] bg-white p-5"><CalendarDays className="size-5 text-[#c36d4d]" /><h2 className="mt-4 font-semibold">No bookings yet</h2><p className="mt-2 text-sm text-[#68756e]">Your confirmed plans will appear here after preview payment.</p><Link href="/discover" className="mt-5 inline-flex rounded-full bg-[#173f35] px-4 py-2.5 text-sm font-semibold text-white">Explore companions</Link></section>
  return <section className="rounded-2xl border border-[#e9e2d9] bg-white p-5"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Your bookings</h2><p className="mt-1 text-sm text-[#68756e]">Preview bookings stored in this browser.</p></div><CalendarDays className="size-5 text-[#c36d4d]" /></div><div className="mt-4 grid gap-3">{bookings.map((booking) => <div key={booking.id} className="flex items-start justify-between gap-3 rounded-xl bg-[#f7faf6] p-4"><div><p className="font-semibold">{booking.companionName}</p><p className="mt-1 text-sm text-[#68756e]">{booking.date} · {booking.time} · {booking.activity}</p><p className="mt-2 text-xs font-semibold uppercase tracking-wide text-[#4e8068]">{booking.status}</p></div><CheckCircle2 className="size-5 text-[#4e8068]" /></div>)}</div></section>
}
