'use client'

import Link from 'next/link'
import { use, useState } from 'react'
import { ArrowLeft, CalendarDays, Heart, MessageCircle, ShieldCheck, Star } from 'lucide-react'
import { notFound } from 'next/navigation'
import { companions } from '@/lib/domain/rentgf'
import { hasBookingAccess } from '@/lib/booking-access'

export default function CompanionProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const person = companions.find((item) => item.id === id)
  const [saved, setSaved] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  if (!person) notFound()
  const canMessage = hasAccess || hasBookingAccess(person.id)

  return (
    <main className="min-h-screen bg-[#fbfaf7] pb-10 text-[#173f35]">
      <header className="flex items-center gap-3 border-b border-[#eee9e2] px-4 py-4">
        <Link href="/discover" aria-label="Back to discover" className="rounded-full bg-white p-2"><ArrowLeft className="size-5" /></Link>
        <span className="brand-mark"><span /></span><span className="font-semibold tracking-[-.04em]">rent<span className="text-[#d17b58]">gf</span></span>
      </header>
      <div className="mx-auto max-w-2xl px-4">
        <div className="relative mt-5 overflow-hidden rounded-[26px] bg-[#eaded4]"><img src={person.photoUrl} alt={`${person.displayName} profile`} className="aspect-[1.05] w-full object-cover" /><span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold backdrop-blur">Verified companion</span></div>
        <section className="py-5">
          <div className="flex items-start justify-between"><div><h1 className="flex items-center gap-2 text-3xl font-semibold tracking-[-.05em]">{person.displayName}<ShieldCheck className="size-5 text-[#4e8c70]" /></h1><p className="mt-1 text-sm text-[#718079]">{person.city.name} · {person.languages.join(' · ')}</p></div><button type="button" aria-label={saved ? 'Remove from saved companions' : 'Save companion'} onClick={() => setSaved((value) => !value)} className="rounded-full bg-white p-3 shadow-sm"><Heart className={`size-5 ${saved ? 'fill-[#d17b58] text-[#d17b58]' : ''}`} /></button></div>
          <div className="mt-4 flex items-center gap-1 text-sm font-semibold"><Star className="size-4 fill-[#e7a547] text-[#e7a547]" /> {person.rating} <span className="font-normal text-[#718079]">({person.reviewCount} reviews)</span></div>
          <p className="mt-5 text-[15px] leading-7 text-[#4f6259]">{person.bio}</p>
          <div className="mt-5 flex flex-wrap gap-2">{person.categories.map((item) => <span key={item.id} className="rounded-full bg-[#edf4ed] px-3 py-1.5 text-xs font-medium text-[#4e8068]">{item.name}</span>)}</div>
          <div className="mt-7 rounded-[20px] border border-[#e9e2d9] bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[.15em] text-[#89958d]">Starting from</p><p className="mt-1 text-2xl font-semibold">₹{person.startingPrice.toLocaleString('en-IN')} <span className="text-sm font-normal text-[#718079]">/ hour</span></p><p className="mt-2 text-sm text-[#718079]">Choose a time and pay securely to book.</p></div>
          <div className="mt-5 grid grid-cols-2 gap-3"><Link href={`/booking/${person.id}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#173f35] px-4 py-3 text-sm font-semibold text-white"><CalendarDays className="size-4" /> Book now</Link>{canMessage ? <Link href={`/messages?companion=${person.id}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#cedbd1] bg-white px-4 py-3 text-sm font-semibold text-[#173f35]"><MessageCircle className="size-4" /> Message</Link> : <div className="rounded-2xl border border-[#e9e2d9] bg-[#fffaf4] px-4 py-3 text-sm leading-5 text-[#765f4b]">Book this companion first to unlock messages.</div>}</div>
          <p className="mt-4 text-center text-xs leading-5 text-[#718079]">Messages are for planning lawful, non-sexual social activities only.</p>
        </section>
      </div>
    </main>
  )
}
