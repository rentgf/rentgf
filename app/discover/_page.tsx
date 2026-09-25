'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Bell, Compass, Heart, Home, MessageCircle, Search, ShieldCheck, SlidersHorizontal, Star, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/logo'

type CompanionCard = {
  id: string
  bio: string | null
  city: string | null
  starting_price: number | null
  avg_rating: number | null
  review_count: number | null
  categories: string[] | null
  languages: string[] | null
  display_name: string | null
  profile_photo_url: string | null
}

// Top 10 metros as quick-filter pills
const QUICK_FILTER_CITIES = [
  'Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Chennai',
  'Pune', 'Kolkata', 'Jaipur', 'Ahmedabad', 'Surat',
]

// 18 major states — ~10-12 cities each (alphabetically sorted)
const ALL_CITIES = [
  'Agra', 'Ahmedabad', 'Ajmer', 'Aligarh', 'Alwar', 'Amravati', 'Amritsar', 'Anand', 'Asansol', 'Aurangabad',
  'Bareilly', 'Bardhaman', 'Bathinda', 'Belagavi', 'Bengaluru', 'Berhampur', 'Bharatpur', 'Bharuch', 'Bhavnagar', 'Bhilwara', 'Bhopal', 'Bhubaneswar', 'Bikaner', 'Bokaro',
  'Chennai', 'Coimbatore', 'Cuttack',
  'Darjeeling', 'Davangere', 'Delhi', 'Deoghar', 'Dewas', 'Dhanbad', 'Dindigul', 'Dibrugarh', 'Durgapur',
  'Erode',
  'Faridabad',
  'Gandhinagar', 'Gandhidham', 'Gaya', 'Ghaziabad', 'Gorakhpur', 'Gulbarga', 'Guntur', 'Gurgaon', 'Guwahati', 'Gwalior',
  'Hazaribagh', 'Hisar', 'Howrah', 'Hubli', 'Hyderabad',
  'Indore',
  'Jabalpur', 'Jaipur', 'Jalandhar', 'Jamnagar', 'Jamshedpur', 'Jodhpur', 'Jorhat', 'Junagadh',
  'Kakinada', 'Kanchipuram', 'Kanpur', 'Karimnagar', 'Karnal', 'Khammam', 'Kochi', 'Kolkata', 'Kollam', 'Kota', 'Kottayam', 'Kozhikode', 'Kurnool',
  'Lucknow', 'Ludhiana',
  'Madurai', 'Mahbubnagar', 'Malda', 'Mangalore', 'Meerut', 'Mohali', 'Moradabad', 'Mumbai', 'Muzaffarpur', 'Mysuru',
  'Nadiad', 'Nagaon', 'Nagpur', 'Nashik', 'Navi Mumbai', 'Nellore', 'Nizamabad', 'Noida',
  'Palakkad', 'Panipat', 'Pathankot', 'Patna', 'Patiala', 'Prayagraj', 'Pune', 'Puri', 'Purnia',
  'Rajahmundry', 'Rajkot', 'Ramagundam', 'Ranchi', 'Ratlam', 'Rewa', 'Rohtak', 'Rourkela',
  'Sagar', 'Salem', 'Sambalpur', 'Satna', 'Sikar', 'Silchar', 'Siliguri', 'Solapur', 'Sonipat', 'Surat',
  'Thane', 'Thiruvananthapuram', 'Thoothukudi', 'Tinsukia', 'Tiruchirappalli', 'Tirunelveli', 'Tirupati', 'Tiruppur', 'Thrissur', 'Tumkur',
  'Udaipur', 'Udupi', 'Ujjain',
  'Vadodara', 'Varanasi', 'Vellore', 'Vijayawada', 'Visakhapatnam',
  'Warangal',
]

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e9e2d9] bg-white/95 px-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(23,63,53,.06)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between">
        <Link href="/" className="flex flex-col items-center gap-1 text-[#718079]"><Home className="size-[19px]" /><span className="text-[10px]">Home</span></Link>
        <Link href="/discover" className="flex flex-col items-center gap-1 text-[#d17b58]"><Compass className="size-[19px]" /><span className="text-[10px] font-semibold">Discover</span></Link>
        <Link href="/likes" className="flex flex-col items-center gap-1 text-[#718079]"><Heart className="size-[19px]" /><span className="text-[10px]">Likes</span></Link>
        <Link href="/messages" className="flex flex-col items-center gap-1 text-[#718079]"><MessageCircle className="size-[19px]" /><span className="text-[10px]">Messages</span></Link>
        <Link href="/profile" className="flex flex-col items-center gap-1 text-[#718079]"><UserRound className="size-[19px]" /><span className="text-[10px]">Profile</span></Link>
      </div>
    </nav>
  )
}

const PRICE_OPTIONS = [
  { label: 'Any price', value: '' },
  { label: 'Under ₹1,000', value: '0-999' },
  { label: '₹1,000 – ₹2,500', value: '1000-2500' },
  { label: '₹2,500+', value: '2500-99999' },
]

export default function DiscoverPage() {
  const [companions, setCompanions] = useState<CompanionCard[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string | null>(null)
  const [allCategories, setAllCategories] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    let blockedIds: string[] = []
    if (user) {
      setUserId(user.id)
      const [{ data: favs }, { data: blocks }] = await Promise.all([
        supabase.from('favorites').select('companion_profile_id').eq('customer_profile_id', user.id),
        supabase.from('blocks').select('blocked_id').eq('blocker_id', user.id),
      ])
      if (favs) setSavedIds(new Set(favs.map((f) => f.companion_profile_id)))
      blockedIds = (blocks ?? []).map((b) => b.blocked_id)
    }
    let dbQuery = supabase
      .from('public_companion_profiles')
      .select('id, profile_id, bio, city, starting_price, avg_rating, total_reviews, categories, languages, display_name, profile_photo_url')
      .eq('verification_status', 'approved')
      .eq('is_visible', true)
      .order('avg_rating', { ascending: false })
    if (blockedIds.length) dbQuery = dbQuery.not('profile_id', 'in', `(${blockedIds.join(',')})`)
    const { data } = await dbQuery
    if (data) {
      const mapped: CompanionCard[] = data.filter((row) => row.id !== null).map((row) => {
        return { id: row.id as string, bio: row.bio, city: row.city, starting_price: row.starting_price, avg_rating: row.avg_rating, review_count: row.total_reviews, categories: row.categories, languages: row.languages, display_name: row.display_name, profile_photo_url: row.profile_photo_url }
      })
      setCompanions(mapped)
      setAllCategories([...new Set(mapped.flatMap((c) => c.categories ?? []))] as string[])
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function toggleFavorite(companionId: string) {
    if (!userId) return
    const supabase = createClient()
    const isSaved = savedIds.has(companionId)
    if (isSaved) {
      await supabase.from('favorites').delete().eq('customer_profile_id', userId).eq('companion_profile_id', companionId)
      setSavedIds((prev) => { const next = new Set(prev); next.delete(companionId); return next })
    } else {
      await supabase.from('favorites').insert({ customer_profile_id: userId, companion_profile_id: companionId })
      setSavedIds((prev) => new Set([...prev, companionId]))
    }
  }

  const results = useMemo(() => companions.filter((c) => {
    if (query) { const hay = [c.display_name, c.bio, c.city, ...(c.categories ?? [])].join(' ').toLowerCase(); if (!hay.includes(query.toLowerCase())) return false }
    if (city && c.city !== city) return false
    if (category && !(c.categories ?? []).includes(category)) return false
    if (price) { const [min, max] = price.split('-').map(Number); const p = c.starting_price ?? 0; if (p < min || p > max) return false }
    return true
  }), [companions, query, city, category, price])

  return (
    <main id="main-content" className="min-h-screen bg-[#fbfaf7] pb-24 text-[#173f35] md:pb-10">
      <header className="sticky top-0 z-20 border-b border-[#eee9e2] bg-[#fbfaf7]/95 backdrop-blur">
        <div className="mx-auto flex h-[64px] max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <Link href="/notifications" aria-label="Notifications"><Bell className="size-[18px]" /></Link>
            <Link href="/register" className="rounded-full bg-[#173f35] px-3.5 py-2 text-xs font-semibold text-white">Join</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#d17b58]">Explore people &amp; plans</p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-[-.045em]">Find your kind of company.</h1>
          </div>
          <span className="hidden rounded-full bg-[#edf4ed] px-3 py-1.5 text-xs font-medium text-[#4e8068] sm:block">
            {loading ? '…' : `${results.length} profiles`}
          </span>
        </div>

        {/* Quick-filter city pills — top 10 metros */}
        <div className="mt-3 hidden flex-wrap gap-2 sm:flex">
          {QUICK_FILTER_CITIES.map((c) => (
            <button key={c} type="button" onClick={() => setCity(city === c ? '' : c)} aria-label={`Companions in ${c}`}
              className={`rounded-full px-3 py-1 text-xs ${ city === c ? 'bg-[#173f35] font-semibold text-white' : 'bg-[#f0ece6] text-[#68756e]' }`}>{c}</button>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-[18px] border border-[#e9e2d9] bg-white px-4 py-3 shadow-sm">
          <Search className="size-[18px] shrink-0 text-[#9aa49d]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, city, or interest" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9aa49d]" />
          <button type="button" onClick={() => setShowFilters((v) => !v)} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ${ showFilters || city || category || price ? 'bg-[#173f35] text-white' : 'bg-[#f0f4ef] text-[#4e8068]' }`}>
            <SlidersHorizontal className="size-3.5" /> Filters
          </button>
        </div>

        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
          <button type="button" onClick={() => setCategory('')} className={!category ? 'shrink-0 rounded-full bg-[#173f35] px-4 py-2 text-xs font-semibold text-white' : 'shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#68756e] shadow-sm'}>All</button>
          {allCategories.map((cat) => <button key={cat} type="button" onClick={() => setCategory(cat === category ? '' : cat)} className={category === cat ? 'shrink-0 rounded-full bg-[#f0d9ca] px-4 py-2 text-xs font-semibold text-[#8c4d37]' : 'shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#68756e] shadow-sm'}>{cat}</button>)}
        </div>

        {showFilters && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <select value={city} onChange={(e) => setCity(e.target.value)} aria-label="Filter by city" className="rounded-xl border border-[#e9e2d9] bg-white px-3 py-2.5 text-xs text-[#52645b] outline-none">
              <option value="">All cities</option>
              {ALL_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={price} onChange={(e) => setPrice(e.target.value)} aria-label="Filter by price" className="rounded-xl border border-[#e9e2d9] bg-white px-3 py-2.5 text-xs text-[#52645b] outline-none">
              {PRICE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        )}

        {loading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="animate-pulse overflow-hidden rounded-[22px] border border-[#ebe5dd] bg-white"><div className="aspect-[1.05] bg-[#ede8e1]" /><div className="p-4 space-y-2"><div className="h-4 w-1/2 rounded bg-[#ede8e1]" /><div className="h-3 w-3/4 rounded bg-[#ede8e1]" /></div></div>)}
          </div>
        ) : results.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-lg font-semibold">No companions found</p>
            <p className="mt-2 text-sm text-[#68756e]">Try a different search or clear your filters.</p>
            <button type="button" onClick={() => { setQuery(''); setCity(''); setCategory(''); setPrice('') }} className="mt-5 rounded-full bg-[#173f35] px-5 py-2.5 text-sm font-semibold text-white">Clear filters</button>
          </div>
        ) : (
          <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Available companions">
            {results.map((person) => {
              const isSaved = savedIds.has(person.id)
              return (
                <article key={person.id} className="overflow-hidden rounded-[22px] border border-[#ebe5dd] bg-white shadow-[0_8px_24px_rgba(23,63,53,.045)]">
                  <div className="relative aspect-[1.05] overflow-hidden bg-[#ede8e1]">
                    {person.profile_photo_url ? <img src={person.profile_photo_url} alt={`${person.display_name} — companion in ${person.city ?? 'India'}`} className="size-full object-cover" /> : <div className="flex size-full items-center justify-center text-4xl font-semibold text-[#9aa49d]">{person.display_name?.[0] ?? '?'}</div>}
                    <button type="button" onClick={() => toggleFavorite(person.id)} aria-label={isSaved ? 'Remove from favorites' : 'Save to favorites'} className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/90 shadow-sm">
                      <Heart className={isSaved ? 'size-[18px] fill-[#d17b58] text-[#d17b58]' : 'size-[18px] text-[#173f35]'} />
                    </button>
                    <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-[#173f35]/90 px-2.5 py-1.5 text-[11px] font-semibold text-white">
                      <ShieldCheck className="size-3.5" /> Verified
                    </span>
                  </div>
                  <div className="p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="text-[17px] font-semibold">{person.display_name}</h2>
                        <p className="mt-0.5 text-xs text-[#7d8a82]">{person.city}{person.languages?.length ? ` · ${person.languages.join(', ')}` : ''}</p>
                      </div>
                      {person.avg_rating ? <span className="flex shrink-0 items-center gap-1 text-xs font-semibold"><Star className="size-3.5 fill-[#e7a547] text-[#e7a547]" />{Number(person.avg_rating).toFixed(1)}</span> : null}
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#68756e]">{person.bio}</p>
                    {person.categories?.length ? <div className="mt-2 flex flex-wrap gap-1">{person.categories.slice(0, 2).map((cat) => <span key={cat} className="rounded-full bg-[#edf4ed] px-2.5 py-1 text-[10px] font-medium text-[#4e8068]">{cat}</span>)}</div> : null}
                    <Link href={`/companions/${person.id}`} className="mt-3 block rounded-xl bg-[#f4f7f2] py-2.5 text-center text-xs font-semibold text-[#356354]">
                      View profile{person.starting_price ? ` · From ₹${person.starting_price.toLocaleString('en-IN')}/hr` : ''}
                    </Link>
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </div>
      <BottomNav />
    </main>
  )
}
