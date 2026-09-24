'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Bell, Bookmark, CalendarDays, Compass, Heart, Home, MessageCircle, Search, ShieldCheck, Sparkles, Star, UserRound } from 'lucide-react'
import { categories } from '@/lib/domain/rentgf'
import { createClient } from '@/lib/supabase/client'
import { Footer } from '@/components/footer'
import { Logo } from '@/components/logo'

type CompanionCard = {
  id: string
  display_name: string | null
  bio: string | null
  city: string | null
  starting_price: number | null
  avg_rating: number | null
  total_reviews: number | null
  categories: string[] | null
  profile_photo_url: string | null
}

function MobileNav() {
  const pathname = usePathname()
  const items = [
    { href: '/', label: 'Home', Icon: Home },
    { href: '/discover', label: 'Discover', Icon: Compass },
    { href: '/likes', label: 'Likes', Icon: Heart },
    { href: '/messages', label: 'Messages', Icon: MessageCircle },
    { href: '/profile', label: 'Profile', Icon: UserRound },
  ]
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e9e2d9] bg-white/95 px-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(23,63,53,.06)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between">
        {items.map(({ href, label, Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link key={href} href={href} className={`flex flex-col items-center gap-1 ${active ? 'text-[#d17b58]' : 'text-[#718079]'}`}>
              <Icon className="size-[19px]" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function StoryRow({ companions }: { companions: CompanionCard[] }) {
  return (
    <div className="no-scrollbar flex gap-4 overflow-x-auto pb-1">
      <Link href="/discover" className="flex min-w-[62px] flex-col items-center gap-1.5">
        <span className="flex size-[58px] items-center justify-center rounded-full bg-[#173f35] p-[2px]">
          <span className="flex size-full items-center justify-center rounded-full border-2 border-white bg-[#dce9dd] text-[#173f35]">
            <Sparkles className="size-5" />
          </span>
        </span>
        <span className="text-[11px] font-medium text-[#4f6259]">For you</span>
      </Link>
      {companions.slice(0, 5).map((person) => (
        <Link key={person.id} href={`/companions/${person.id}`} className="flex min-w-[62px] flex-col items-center gap-1.5">
          <span className="rounded-full bg-gradient-to-br from-[#d17b58] to-[#f0c48b] p-[2px]">
            {person.profile_photo_url ? (
              <img src={person.profile_photo_url} alt="" className="size-[54px] rounded-full border-2 border-white object-cover" />
            ) : (
              <div className="flex size-[54px] items-center justify-center rounded-full border-2 border-white bg-[#dce9dd] text-lg font-semibold text-[#173f35]">
                {person.display_name?.[0] ?? '?'}
              </div>
            )}
          </span>
          <span className="max-w-[62px] truncate text-[11px] font-medium text-[#4f6259]">{person.display_name}</span>
        </Link>
      ))}
    </div>
  )
}

function SocialCard({ person }: { person: CompanionCard }) {
  const [saved, setSaved] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function checkFav() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase.from('favorites').select('id').eq('customer_profile_id', user.id).eq('companion_profile_id', person.id).maybeSingle()
      setSaved(!!data)
    }
    void checkFav()
  }, [person.id])

  async function handleFav() {
    if (!userId) return
    const supabase = createClient()
    if (saved) {
      await supabase.from('favorites').delete().eq('customer_profile_id', userId).eq('companion_profile_id', person.id)
      setSaved(false)
    } else {
      await supabase.from('favorites').insert({ customer_profile_id: userId, companion_profile_id: person.id })
      setSaved(true)
    }
  }

  return (
    <article className="overflow-hidden rounded-[22px] border border-[#ebe5dd] bg-white shadow-[0_8px_24px_rgba(23,63,53,.045)]">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href={`/companions/${person.id}`} className="flex items-center gap-2.5">
          {person.profile_photo_url ? (
            <img src={person.profile_photo_url} alt="" className="size-9 rounded-full object-cover" />
          ) : (
            <div className="flex size-9 items-center justify-center rounded-full bg-[#dce9dd] font-semibold text-[#173f35]">{person.display_name?.[0] ?? '?'}</div>
          )}
          <span>
            <span className="flex items-center gap-1 text-sm font-semibold text-[#173f35]">{person.display_name}<ShieldCheck className="size-3.5 text-[#4e8c70]" /></span>
            <span className="block text-[11px] text-[#849087]">{person.city} · Available this week</span>
          </span>
        </Link>
        <button type="button" aria-label="More profile options" className="text-lg text-[#859087]">•••</button>
      </div>
      <Link href={`/companions/${person.id}`} className="block">
        <div className="relative aspect-[1.12] overflow-hidden bg-[#eaded4]">
          {person.profile_photo_url ? (
            <img src={person.profile_photo_url} alt={`${person.display_name} profile`} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-6xl font-semibold text-[#9aa49d]">{person.display_name?.[0] ?? '?'}</div>
          )}
          <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#173f35] backdrop-blur">Verified companion</span>
        </div>
      </Link>
      <div className="px-4 pb-4 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button type="button" aria-label={saved ? 'Unlike' : 'Like'} onClick={handleFav}>
              <Heart className={saved ? 'size-[21px] fill-[#d17b58] text-[#d17b58]' : 'size-[21px] text-[#173f35]'} />
            </button>
            <Link href={`/companions/${person.id}`} aria-label="View messages"><MessageCircle className="size-[21px] text-[#173f35]" /></Link>
            <Link href={`/booking/${person.id}`} aria-label="Book this companion"><CalendarDays className="size-[21px] text-[#173f35]" /></Link>
          </div>
          <Bookmark className="size-[20px] text-[#173f35]" />
        </div>
        <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-[#173f35]">
          <Star className="size-3.5 fill-[#e7a547] text-[#e7a547]" />
          {person.avg_rating ? Number(person.avg_rating).toFixed(1) : '5.0'}
          {' · '}{person.total_reviews ?? 0} reviews
        </div>
        <p className="mt-2 text-sm leading-5 text-[#52645b]">
          <span className="font-semibold text-[#173f35]">{person.display_name}</span>{' '}{person.bio}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(person.categories ?? []).slice(0, 3).map((cat) => (
            <span key={cat} className="rounded-full bg-[#f5f0e9] px-2.5 py-1 text-[11px] font-medium text-[#68756e]">{cat}</span>
          ))}
        </div>
        <p className="mt-3 text-xs text-[#8a958e]">From <span className="font-semibold text-[#173f35]">₹{(person.starting_price ?? 999).toLocaleString('en-IN')}</span> per hour</p>
      </div>
    </article>
  )
}

export default function Page() {
  const [companions, setCompanions] = useState<CompanionCard[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('public_companion_profiles')
      .select('id, bio, city, starting_price, avg_rating, total_reviews, categories, display_name, profile_photo_url')
      .eq('verification_status', 'approved')
      .eq('is_visible', true)
      .order('avg_rating', { ascending: false })
      .limit(20)
    if (data) {
      setCompanions(data.filter((row) => row.id !== null).map((row) => {
        return { id: row.id as string, bio: row.bio, city: row.city, starting_price: row.starting_price, avg_rating: row.avg_rating, total_reviews: row.total_reviews, categories: row.categories, display_name: row.display_name, profile_photo_url: row.profile_photo_url }
      }))
    }
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  const results = useMemo(() => companions.filter((person) => {
    const haystack = [person.display_name, person.bio, person.city, ...(person.categories ?? [])].join(' ').toLowerCase()
    return (!query || haystack.includes(query.toLowerCase())) && (!category || (person.categories ?? []).includes(category))
  }), [companions, query, category])

  return (
    <div className="min-h-screen bg-[#fbfaf7] pb-20 text-[#173f35] md:pb-0">
      <div className="bg-[#173f35] px-4 py-2 text-center text-[11px] font-medium tracking-wide text-white/90">18+ only · Lawful, non-sexual companionship</div>
      <header className="sticky top-0 z-20 border-b border-[#eee9e2]/80 bg-[#fbfaf7]/95 backdrop-blur">
        <div className="mx-auto flex h-[64px] max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <Link href="/discover" aria-label="Search companions" className="flex size-9 items-center justify-center rounded-full bg-white text-[#173f35] shadow-sm"><Search className="size-[18px]" /></Link>
            <Link href="/notifications" aria-label="Notifications" className="flex size-9 items-center justify-center rounded-full bg-white text-[#173f35] shadow-sm"><Bell className="size-[18px]" /></Link>
            <Link href="/register" className="hidden rounded-full bg-[#173f35] px-4 py-2 text-sm font-semibold text-white sm:block">Join</Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 sm:px-6">
        <section className="pb-5 pt-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold text-[#d17b58]">Good company, thoughtfully found.</p>
              <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.045em]">Your next plan starts here.</h1>
            </div>
            <Link href="/safety" className="hidden text-xs font-semibold text-[#587466] sm:block">Safety first</Link>
          </div>
          <div className="mt-5 flex items-center gap-3 rounded-[18px] border border-[#e9e2d9] bg-white px-4 py-3 shadow-sm">
            <Search className="size-[18px] text-[#9aa49d]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people, places, or plans" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9aa49d]" />
          </div>
        </section>
        {!loading && companions.length > 0 && (
          <section className="border-b border-[#eee9e2] pb-5">
            <StoryRow companions={companions} />
          </section>
        )}
        <section className="flex items-center gap-2 overflow-x-auto py-4">
          <button type="button" onClick={() => setCategory('')} className="shrink-0 rounded-full bg-[#173f35] px-4 py-2 text-xs font-semibold text-white">For you</button>
          {categories.slice(0, 5).map((item) => (
            <button key={item.id} type="button" onClick={() => setCategory(category === item.name ? '' : item.name)}
              className={category === item.name ? 'shrink-0 rounded-full bg-[#f0d9ca] px-4 py-2 text-xs font-semibold text-[#8c4d37]' : 'shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#68756e] shadow-sm'}>
              {item.name}
            </button>
          ))}
        </section>
        {loading ? (
          <div className="flex flex-col gap-5 pb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-[22px] border border-[#ebe5dd] bg-white">
                <div className="aspect-[1.12] bg-[#ede8e1]" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-1/2 rounded bg-[#ede8e1]" />
                  <div className="h-3 w-3/4 rounded bg-[#ede8e1]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <section className="flex flex-col gap-5 pb-8">
            {results.length ? results.map((person) => <SocialCard key={person.id} person={person} />) : (
              <div className="rounded-[22px] bg-white p-8 text-center text-sm text-[#68756e]">No companions match that search yet.</div>
            )}
          </section>
        )}
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
