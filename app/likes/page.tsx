'use client'

import Link from 'next/link'
import { Heart, Star } from 'lucide-react'
import { MobileShell } from '@/components/mobile-shell'
import { getFavoriteCompanions, toggleFavorite } from '@/lib/favorites'
import type { Companion } from '@/lib/domain/rentgf'
import { useEffect, useState } from 'react'

export default function FavoritesPage() {
  const [saved, setSaved] = useState<Companion[]>([])
  useEffect(() => setSaved(getFavoriteCompanions()), [])
  return <MobileShell title="Liked companions" showBack><main className="mx-auto max-w-xl px-4 py-8"><div className="flex items-center gap-3"><div className="flex size-12 items-center justify-center rounded-full bg-[#fff0ea]"><Heart className="size-6 text-[#d17b58]" /></div><div><h1 className="text-2xl font-semibold tracking-[-.05em]">Liked companions</h1><p className="text-sm text-[#68756e]">{saved.length} {saved.length === 1 ? 'like' : 'likes'}</p></div></div>{saved.length === 0 ? <div className="py-16 text-center"><p className="text-sm leading-6 text-[#68756e]">Like profiles you want to revisit later.</p><Link href="/discover" className="mt-7 inline-flex rounded-full bg-[#173f35] px-5 py-3 text-sm font-semibold text-white">Explore profiles</Link></div> : <div className="mt-8 flex flex-col gap-3">{saved.map((person) => <article key={person.id} className="flex items-center gap-3 rounded-2xl border border-[#e9e2d9] bg-white p-3"><img src={person.photoUrl} alt={`${person.displayName} profile`} className="size-16 rounded-xl object-cover" /><div className="min-w-0 flex-1"><Link href={`/companions/${person.id}`} className="font-semibold text-[#173f35]">{person.displayName}</Link><p className="text-sm text-[#68756e]">{person.city.name} · {person.startingPriceLabel}</p><p className="mt-1 flex items-center gap-1 text-xs text-[#68756e]"><Star className="size-3 fill-[#e7a547] text-[#e7a547]" /> {person.rating} rating</p></div><button type="button" onClick={() => { toggleFavorite(person.id); setSaved(getFavoriteCompanions()) }} className="rounded-full border border-[#e9e2d9] px-3 py-2 text-xs font-semibold text-[#68756e]">Unlike</button></article>)}</div>}</main></MobileShell>
}
