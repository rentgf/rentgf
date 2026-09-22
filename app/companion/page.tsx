'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Camera, CheckCircle2, ChevronRight, CircleDollarSign, Clock, LogOut, Pencil, ShieldCheck, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type CompanionData = {
  id: string
  bio: string | null
  city: string | null
  starting_price: number | null
  avg_rating: number | null
  review_count: number | null
  categories: string[] | null
  languages: string[] | null
  verification_status: string | null
  is_visible: boolean | null
  profile_photo_url: string | null
  display_name: string | null
  email: string | null
}

const CATEGORIES = ['Coffee & conversation', 'Dining', 'Movies & events', 'Travel companion', 'Shopping', 'Fitness & outdoors', 'Study buddy', 'Gaming']
const CITIES = ['Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Ahmedabad', 'Surat']
const LANGUAGES = ['Hindi', 'English', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Marathi', 'Gujarati']

export default function CompanionDashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<CompanionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  // Edit form state
  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [price, setPrice] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])
  const [photoUrl, setPhotoUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  async function load() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login?redirectTo=/companion'); return }

    // `companion_profiles` is keyed by its own `id`, linked to the user via
    // `profile_id` (not `id`). It also has no `is_approved`/`review_count`/
    // `availability_status` columns — the real columns are
    // `verification_status`/`total_reviews`, and visibility is `is_visible`.
    const { data: cp } = await supabase
      .from('companion_profiles')
      .select('id, bio, city, starting_price, avg_rating, total_reviews, categories, languages, verification_status, is_visible, profiles!inner(display_name, email, profile_photo_url)')
      .eq('profile_id', user.id)
      .single()

    if (!cp) {
      // No companion profile → redirect to apply
      router.push('/become-companion')
      return
    }

    const p = cp.profiles as unknown as { display_name: string | null; email: string | null; profile_photo_url: string | null }
    const mapped: CompanionData = {
      id: cp.id, bio: cp.bio, city: cp.city, starting_price: cp.starting_price,
      avg_rating: cp.avg_rating, review_count: cp.total_reviews, categories: cp.categories,
      languages: cp.languages, verification_status: cp.verification_status, is_visible: cp.is_visible,
      profile_photo_url: p.profile_photo_url, display_name: p.display_name, email: p.email,
    }
    setData(mapped)
    setBio(cp.bio ?? '')
    setCity(cp.city ?? '')
    setPrice(String(cp.starting_price ?? 999))
    setCategories(cp.categories ?? [])
    setLanguages(cp.languages ?? [])
    setPhotoUrl(p.profile_photo_url ?? '')
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  function toggleItem(list: string[], setList: (v: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item])
  }

  async function saveProfile() {
    if (!data) return
    setSaving(true)
    setSaveMsg('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const [cpResult, pResult] = await Promise.all([
      supabase.from('companion_profiles').update({
        bio, city,
        starting_price: Number(price),
        categories,
        languages,
      }).eq('id', data.id),
      supabase.from('profiles').update({ profile_photo_url: photoUrl || null }).eq('id', user.id),
    ])
    if (cpResult.error || pResult.error) {
      setSaveMsg('Error saving. Please try again.')
    } else {
      setSaveMsg('Profile saved!')
      await load()
      setEditing(false)
    }
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  async function toggleAvailability() {
    if (!data) return
    const supabase = createClient()
    // `companion_profiles` has no `availability_status` column — visibility on
    // the discover page is controlled by `is_visible`.
    const newVisible = !data.is_visible
    await supabase.from('companion_profiles').update({ is_visible: newVisible }).eq('id', data.id)
    setData({ ...data, is_visible: newVisible })
  }

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fbfaf7] px-4 py-8">
        <div className="mx-auto max-w-2xl animate-pulse space-y-4">
          <div className="h-28 rounded-2xl bg-[#ede8e1]" />
          <div className="h-40 rounded-2xl bg-[#ede8e1]" />
          <div className="h-24 rounded-2xl bg-[#ede8e1]" />
        </div>
      </main>
    )
  }

  if (!data) return null

  const isApproved = data.verification_status === 'approved'

  return (
    <main className="min-h-screen bg-[#fbfaf7] pb-16 text-[#173f35]">
      <header className="sticky top-0 z-10 border-b border-[#eee9e2] bg-[#fbfaf7]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <Link href="/" className="font-semibold tracking-[-.04em]">rent<span className="text-[#d17b58]">gf</span></Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#68756e]">Companion</span>
            <button type="button" onClick={signOut} className="rounded-full border border-[#e4e9e1] p-2 text-[#68756e]">
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-4 px-4 pt-6">

        {/* Status banner */}
        {!isApproved && (
          <div className="flex items-start gap-3 rounded-2xl bg-[#fff8ed] border border-[#f0d9b5] p-4">
            <Clock className="mt-0.5 size-5 shrink-0 text-[#c47d2a]" />
            <div>
              <p className="font-semibold text-[#8c5c2a]">Application under review</p>
              <p className="mt-1 text-sm text-[#745b35]">Our team will review your profile within 48 hours. You will receive an email when approved.</p>
            </div>
          </div>
        )}
        {isApproved && (
          <div className="flex items-center gap-3 rounded-2xl bg-[#edf4ee] border border-[#cce3cc] p-4">
            <CheckCircle2 className="size-5 shrink-0 text-[#4e8068]" />
            <p className="font-semibold text-[#4e8068]">Profile approved and live!</p>
          </div>
        )}

        {/* Profile card */}
        <section className="rounded-[22px] border border-[#e9e2d9] bg-white p-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              {data.profile_photo_url ? (
                <img src={data.profile_photo_url} alt="" className="size-16 rounded-full object-cover" />
              ) : (
                <div className="flex size-16 items-center justify-center rounded-full bg-[#dce9dd] text-2xl font-semibold">{data.display_name?.[0] ?? '?'}</div>
              )}
              {editing && (
                <button type="button" className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-[#173f35] text-white">
                  <Camera className="size-3" />
                </button>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{data.display_name}</p>
              <p className="text-sm text-[#68756e] truncate">{data.email}</p>
              {data.avg_rating ? (
                <div className="mt-1 flex items-center gap-1 text-sm">
                  <Star className="size-3.5 fill-[#e7a547] text-[#e7a547]" />
                  <span className="font-semibold">{Number(data.avg_rating).toFixed(1)}</span>
                  <span className="text-[#9aa49d]">({data.review_count} reviews)</span>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setEditing(!editing)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${editing ? 'border-[#173f35] bg-[#173f35] text-white' : 'border-[#e9e2d9] text-[#52645b]'}`}
            >
              <Pencil className="size-3" /> {editing ? 'Editing' : 'Edit'}
            </button>
          </div>

          {/* Stats */}
          {isApproved && !editing && (
            <div className="mt-5 grid grid-cols-3 divide-x divide-[#f0ebe4] rounded-xl bg-[#f5f3ef] text-center">
              {[
                ['₹' + (data.starting_price ?? 0).toLocaleString('en-IN'), 'per hour'],
                [data.city ?? '–', 'city'],
                [data.categories?.length ?? 0, 'activities'],
              ].map(([val, label]) => (
                <div key={String(label)} className="py-3">
                  <p className="text-base font-semibold">{val}</p>
                  <p className="text-xs text-[#9aa49d]">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Availability toggle */}
          {isApproved && !editing && (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-[#f5f3ef] px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Availability</p>
                <p className="text-xs text-[#8a9490]">{data.is_visible ? 'You are visible to customers' : 'You are hidden from discover'}</p>
              </div>
              <button
                type="button"
                onClick={toggleAvailability}
                className={`relative h-6 w-11 rounded-full transition-colors ${data.is_visible ? 'bg-[#4e8068]' : 'bg-[#d5d5d5]'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${data.is_visible ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          )}
        </section>

        {/* Edit form */}
        {editing && (
          <section className="rounded-[22px] border border-[#e9e2d9] bg-white p-5 space-y-5">
            <h2 className="font-semibold">Edit profile</h2>

            <label className="block text-sm font-medium">
              Profile photo URL
              <input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..."
                className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#bdd2c7]" />
              <span className="mt-1 block text-xs text-[#9aa49d]">Use a direct image URL. Supabase storage or any CDN link works.</span>
            </label>

            <label className="block text-sm font-medium">
              Bio
              <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                placeholder="Tell customers about yourself..."
                className="mt-2 min-h-24 w-full resize-none rounded-xl border border-[#e5e1da] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#bdd2c7]" />
            </label>

            <label className="block text-sm font-medium">
              City
              <select value={city} onChange={(e) => setCity(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#bdd2c7]">
                <option value="">Select city</option>
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>

            <label className="block text-sm font-medium">
              Hourly rate (₹)
              <input type="number" min="500" step="100" value={price} onChange={(e) => setPrice(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#bdd2c7]" />
            </label>

            <div>
              <p className="text-sm font-medium mb-2">Activities</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button key={cat} type="button"
                    onClick={() => toggleItem(categories, setCategories, cat)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${categories.includes(cat) ? 'bg-[#173f35] text-white' : 'border border-[#e5e1da] text-[#52645b]'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Languages</p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button key={lang} type="button"
                    onClick={() => toggleItem(languages, setLanguages, lang)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${languages.includes(lang) ? 'bg-[#4e8068] text-white' : 'border border-[#e5e1da] text-[#52645b]'}`}>
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {saveMsg && (
              <p className={`rounded-xl px-4 py-3 text-sm ${saveMsg.includes('Error') ? 'bg-[#fff3ed] text-[#a04f39]' : 'bg-[#edf4ee] text-[#4e8068]'}`}>{saveMsg}</p>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => setEditing(false)}
                className="flex-1 rounded-xl border border-[#e9e2d9] py-3 text-sm font-semibold text-[#68756e]">
                Cancel
              </button>
              <button type="button" onClick={saveProfile} disabled={saving}
                className="flex-1 rounded-xl bg-[#173f35] py-3 text-sm font-semibold text-white disabled:opacity-60">
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </section>
        )}

        {/* Quick links */}
        {!editing && (
          <section className="rounded-[22px] border border-[#e9e2d9] bg-white divide-y divide-[#f5f1ec]">
            {[
              { icon: BookOpen, label: 'Booking requests', sub: 'Manage pending & accepted bookings', href: '/dashboard' },
              { icon: CircleDollarSign, label: 'Earnings', sub: 'View your payout history', href: '/dashboard' },
              { icon: ShieldCheck, label: 'Verification', sub: 'ID & document status', href: '/settings' },
            ].map(({ icon: Icon, label, sub, href }) => (
              <Link key={label} href={href} className="flex items-center gap-4 px-5 py-4">
                <div className="flex size-9 items-center justify-center rounded-full bg-[#f5f3ef]">
                  <Icon className="size-4 text-[#4e8068]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-[#8a9490]">{sub}</p>
                </div>
                <ChevronRight className="size-4 text-[#b0b9b3]" />
              </Link>
            ))}
          </section>
        )}

        {/* View public profile */}
        {isApproved && !editing && (
          <Link href={`/companions/${data.id}`} className="flex items-center justify-center gap-2 rounded-2xl border border-[#cce3cc] bg-[#f4faf4] py-3.5 text-sm font-semibold text-[#4e8068]">
            View my public profile →
          </Link>
        )}
      </div>
    </main>
  )
}
