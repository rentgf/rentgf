'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CheckCircle2, ChevronRight, ShieldCheck, Star, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/logo'

type Step = 'intro' | 'personal' | 'profile' | 'submitted'

const CATEGORIES = ['Coffee & conversation', 'Dining', 'Movies & events', 'Travel companion', 'Shopping', 'Fitness & outdoors', 'Study buddy', 'Gaming']
const CITIES = [
  'Agra', 'Ahmedabad', 'Amritsar', 'Aurangabad', 'Bengaluru',
  'Bhopal', 'Bhubaneswar', 'Chandigarh', 'Chennai', 'Coimbatore',
  'Dehradun', 'Delhi', 'Faridabad', 'Ghaziabad', 'Goa (Panaji)',
  'Gurgaon', 'Guwahati', 'Gwalior', 'Hyderabad', 'Indore',
  'Jaipur', 'Jalandhar', 'Jammu', 'Jodhpur', 'Kanpur',
  'Kochi', 'Kolkata', 'Kozhikode', 'Lucknow', 'Ludhiana',
  'Madurai', 'Mangalore', 'Mumbai', 'Mysuru', 'Nagpur',
  'Nashik', 'Navi Mumbai', 'Noida', 'Patna', 'Prayagraj',
  'Pune', 'Raipur', 'Rajkot', 'Ranchi', 'Surat',
  'Thane', 'Thiruvananthapuram', 'Vadodara', 'Varanasi', 'Visakhapatnam',
]
const LANGUAGES = ['Hindi', 'English', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Marathi', 'Gujarati']
const MIN_PRICE = 500

export default function BecomeCompanionPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('intro')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [feePercent, setFeePercent] = useState(15)

  // Personal
  const [displayName, setDisplayName] = useState('')
  const [dob, setDob] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')

  // Profile
  const [bio, setBio] = useState('')
  const [price, setPrice] = useState('999')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [photoUrl, setPhotoUrl] = useState('')

  useEffect(() => {
    // Show the admin-configured platform fee.
    createClient().from('platform_settings').select('value').eq('key', 'booking_commission_percent').maybeSingle()
      .then(({ data }) => {
        const n = Number(data?.value)
        if (Number.isFinite(n) && n >= 0 && n <= 100) setFeePercent(n)
      })
  }, [])

  function toggleItem(list: string[], setList: (v: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item])
  }

  async function submit() {
    setError('')
    if (!bio || selectedCategories.length === 0 || !city) {
      setError('Please fill in all required fields.')
      return
    }
    const priceNum = Number(price)
    if (!Number.isFinite(priceNum) || priceNum < MIN_PRICE) {
      setError(`Minimum hourly rate is ₹${MIN_PRICE}.`)
      return
    }
    setSubmitting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login?redirectTo=/become-companion'); return }

    const { error: profileError } = await supabase.from('profiles').update({
      display_name: displayName || undefined,
      date_of_birth: dob || undefined,
      phone: phone || undefined,
      profile_photo_url: photoUrl || undefined,
    }).eq('id', user.id)
    if (profileError) { setError(profileError.message); setSubmitting(false); return }

    // Review state is forced to pending/hidden by a database trigger.
    const { error: cpError } = await supabase.from('companion_profiles').upsert({
      profile_id: user.id,
      bio,
      city,
      starting_price: priceNum,
      categories: selectedCategories,
      languages: selectedLanguages,
      verification_status: 'pending',
      is_visible: false,
    }, { onConflict: 'profile_id' })

    if (cpError) { setError(cpError.message); setSubmitting(false); return }

    const { error: roleError } = await supabase.from('profiles').update({ role: 'companion' }).eq('id', user.id)
    if (roleError) { setError(roleError.message); setSubmitting(false); return }

    await supabase.from('notifications').insert({
      profile_id: user.id,
      type: 'verification',
      title: 'Application submitted!',
      body: 'Your companion application is under review. We will notify you within 48 hours.',
    })

    setStep('submitted')
    setSubmitting(false)
  }

  if (step === 'submitted') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-[#cfe2d3] bg-[#f4faf4] p-8 text-center">
          <CheckCircle2 className="mx-auto size-12 text-[#4e8068]" />
          <h1 className="mt-5 text-2xl font-semibold text-[#173f35]">Application submitted!</h1>
          <p className="mt-3 text-sm leading-6 text-[#52665a]">Our team will review your profile within 48 hours. Upload your ID on the verification page to speed this up.</p>
          <Link href="/companion/verification" className="mt-6 inline-flex rounded-full bg-[#173f35] px-5 py-3 text-sm font-semibold text-white">
            Upload ID documents
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] pb-16">
      <header className="sticky top-0 z-10 border-b border-[#eee9e2] bg-[#fbfaf7]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-xl items-center justify-between px-4">
          <Logo />
          <span className="text-xs text-[#68756e]">
            {step === 'intro' && 'Overview'}
            {step === 'personal' && 'Step 1 of 2'}
            {step === 'profile' && 'Step 2 of 2'}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-xl px-4 pt-8">
        {step === 'intro' && (
          <>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#d17b58]">Earn on your terms</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-.04em] text-[#173f35]">Become a companion</h1>
            <p className="mt-3 text-[#68756e]">Share your time and earn by spending it with interesting people. All activities are lawful and non-sexual.</p>

            <div className="mt-8 grid gap-4">
              {[
                { icon: Star, title: 'Set your own price', desc: `You decide your hourly rate. RentGF keeps a ${feePercent}% platform fee, you get the rest.` },
                { icon: ShieldCheck, title: 'Safe and verified', desc: 'We verify every companion before their profile goes live.' },
                { icon: Users, title: 'Real connections', desc: 'Meet interesting people for coffee, events, travel and more.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4 rounded-2xl border border-[#e9e2d9] bg-white p-5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#edf4ed]">
                    <Icon className="size-5 text-[#4e8068]" />
                  </div>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="mt-1 text-sm text-[#68756e]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl bg-[#fff8ed] p-5 text-sm leading-6 text-[#745b35]">
              <strong>18+ only.</strong> By applying you confirm you are at least 18 years old and agree to our non-sexual companionship policy and Terms of Service.
            </div>

            <button
              type="button"
              onClick={() => setStep('personal')}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#173f35] px-5 py-4 font-semibold text-white"
            >
              Start application <ChevronRight className="size-4" />
            </button>
            <p className="mt-4 text-center text-sm text-[#68756e]">
              Already applied? <Link href="/companion" className="font-semibold text-[#c36d4d]">Go to your studio</Link>
            </p>
          </>
        )}

        {step === 'personal' && (
          <>
            <h2 className="text-2xl font-semibold text-[#173f35]">Personal details</h2>
            <p className="mt-2 text-sm text-[#68756e]">This information is used for verification only.</p>
            <div className="mt-6 flex flex-col gap-4">
              <label className="text-sm font-medium">
                Display name (shown publicly)
                <input required value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Priya S."
                  className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-3 outline-none focus:ring-2 focus:ring-[#bdd2c7]" />
              </label>
              <label className="text-sm font-medium">
                Date of birth
                <input type="date" required value={dob} onChange={(e) => setDob(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-3 outline-none focus:ring-2 focus:ring-[#bdd2c7]" />
              </label>
              <label className="text-sm font-medium">
                City
                <select required value={city} onChange={(e) => setCity(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-3 outline-none focus:ring-2 focus:ring-[#bdd2c7]">
                  <option value="">Select your city</option>
                  {CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium">
                Phone number (private)
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-3 outline-none focus:ring-2 focus:ring-[#bdd2c7]" />
              </label>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!city) { setError('Please select your city.'); return }
                if (dob) {
                  const age = (Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
                  if (age < 18) { setError('You must be 18 or older to become a companion.'); return }
                }
                setError(''); setStep('profile')
              }}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#173f35] px-5 py-4 font-semibold text-white"
            >
              Next: Profile <ChevronRight className="size-4" />
            </button>
            {error && <p className="mt-3 rounded-xl bg-[#fff3ed] px-4 py-3 text-sm text-[#a04f39]">{error}</p>}
          </>
        )}

        {step === 'profile' && (
          <>
            <h2 className="text-2xl font-semibold text-[#173f35]">Your profile</h2>
            <p className="mt-2 text-sm text-[#68756e]">This is what customers will see.</p>
            <div className="mt-6 flex flex-col gap-5">
              <label className="text-sm font-medium">
                Profile photo URL <span className="font-normal text-[#8a968f]">(optional for now)</span>
                <input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-3 outline-none focus:ring-2 focus:ring-[#bdd2c7]" />
                <span className="mt-1 block text-xs text-[#8a968f]">You can add a photo later from your studio.</span>
              </label>

              <label className="text-sm font-medium">
                Bio <span className="text-red-500">*</span>
                <textarea required value={bio} onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell customers about yourself, your personality, and what kind of activities you enjoy..."
                  className="mt-2 min-h-28 w-full resize-none rounded-xl border border-[#e5e1da] px-3 py-3 outline-none focus:ring-2 focus:ring-[#bdd2c7]" />
              </label>

              <div>
                <p className="text-sm font-medium">Activities you offer <span className="text-red-500">*</span></p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleItem(selectedCategories, setSelectedCategories, cat)}
                      className={`rounded-full px-3.5 py-2 text-xs font-semibold ${
                        selectedCategories.includes(cat)
                          ? 'bg-[#173f35] text-white'
                          : 'bg-white border border-[#e5e1da] text-[#52645b]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">Languages you speak</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleItem(selectedLanguages, setSelectedLanguages, lang)}
                      className={`rounded-full px-3.5 py-2 text-xs font-semibold ${
                        selectedLanguages.includes(lang)
                          ? 'bg-[#4e8068] text-white'
                          : 'bg-white border border-[#e5e1da] text-[#52645b]'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <label className="text-sm font-medium">
                Hourly rate (₹)
                <input type="number" min={MIN_PRICE} step="100" value={price} onChange={(e) => setPrice(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-3 outline-none focus:ring-2 focus:ring-[#bdd2c7]" />
                <span className="mt-1 block text-xs text-[#8a968f]">
                  Minimum ₹{MIN_PRICE}/hr. Customers pay this price; you receive it minus the {feePercent}% platform fee
                  {Number(price) > 0 ? ` (₹${(Number(price) - Math.round((Number(price) * feePercent) / 100)).toLocaleString('en-IN')} per hour)` : ''}.
                </span>
              </label>
            </div>

            {error && <p className="mt-4 rounded-xl bg-[#fff3ed] px-4 py-3 text-sm text-[#a04f39]">{error}</p>}
            <button
              type="button"
              disabled={submitting}
              onClick={submit}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#173f35] px-5 py-4 font-semibold text-white disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Submit application'}
            </button>
            <button type="button" onClick={() => setStep('personal')} className="mt-3 w-full text-center text-sm text-[#68756e]">
              Back
            </button>
          </>
        )}
      </div>
    </main>
  )
}
