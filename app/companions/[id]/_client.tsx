'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, CalendarDays, Heart, MapPin, MessageCircle, ShieldCheck, Star } from 'lucide-react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ReportBlockActions } from '@/components/report-block-actions'

type CompanionDetail = {
  id: string
  profile_id: string
  bio: string | null
  city: string | null
  starting_price: number | null
  avg_rating: number | null
  review_count: number | null
  categories: string[] | null
  interests: string[] | null
  languages: string[] | null
  profile_photo_url: string | null
  display_name: string | null
  age: number | null
}

type Review = {
  id: string
  rating: number
  comment: string | null
  created_at: string | null
  reviewer_name: string | null
}

export default function CompanionProfileClient({ id }: { id: string }) {
  const [person, setPerson] = useState<CompanionDetail | null | undefined>(undefined)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isSaved, setIsSaved] = useState(false)
  const [hasBooking, setHasBooking] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const { data } = await supabase
        .from('companion_profiles')
        .select('id, profile_id, bio, city, starting_price, avg_rating, total_reviews, categories, interests, languages, profiles!inner(display_name, profile_photo_url, date_of_birth)')
        .eq('id', id)
        .eq('is_visible', true)
        .single()

      if (!data) { setPerson(null); return }

      const profile = data.profiles as unknown as { display_name: string | null; profile_photo_url: string | null; date_of_birth: string | null }
      let age: number | null = null
      if (profile.date_of_birth) {
        age = Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      }

      setPerson({
        id: data.id,
        profile_id: data.profile_id,
        bio: data.bio,
        city: data.city,
        starting_price: data.starting_price,
        avg_rating: data.avg_rating,
        review_count: data.total_reviews,
        categories: data.categories,
        interests: data.interests,
        languages: data.languages,
        profile_photo_url: profile.profile_photo_url,
        display_name: profile.display_name,
        age,
      })

      const { data: reviewData } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at, profiles!inner(display_name)')
        .eq('companion_profile_id', id)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .limit(10)

      if (reviewData) {
        setReviews(reviewData.map((r) => {
          const rp = r.profiles as unknown as { display_name: string | null }
          return { id: r.id, rating: r.rating, comment: r.comment, created_at: r.created_at, reviewer_name: rp.display_name }
        }))
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const [favResult, bookingResult] = await Promise.all([
          supabase.from('favorites').select('id').eq('customer_profile_id', user.id).eq('companion_profile_id', id).maybeSingle(),
          supabase.from('bookings').select('id').eq('customer_profile_id', user.id).eq('companion_profile_id', id).limit(1).maybeSingle(),
        ])
        setIsSaved(!!favResult.data)
        setHasBooking(!!bookingResult.data)
      }
    }
    void load()
  }, [id])

  async function toggleFavorite() {
    if (!userId) return
    const supabase = createClient()
    if (isSaved) {
      await supabase.from('favorites').delete().eq('customer_profile_id', userId).eq('companion_profile_id', id)
      setIsSaved(false)
    } else {
      await supabase.from('favorites').insert({ customer_profile_id: userId, companion_profile_id: id })
      setIsSaved(true)
    }
  }

  if (person === undefined) {
    return (
      <main className="min-h-screen bg-[#fbfaf7]">
        <div className="mx-auto max-w-2xl animate-pulse px-4 pt-6">
          <div className="aspect-[1.05] rounded-[26px] bg-[#ede8e1]" />
          <div className="mt-5 space-y-3">
            <div className="h-8 w-48 rounded-xl bg-[#ede8e1]" />
            <div className="h-4 w-32 rounded-xl bg-[#ede8e1]" />
            <div className="h-20 rounded-xl bg-[#ede8e1]" />
          </div>
        </div>
      </main>
    )
  }

  if (person === null) notFound()

  const isOwnProfile = userId === person.profile_id

  return (
    <main className="min-h-screen bg-[#fbfaf7] pb-10 text-[#173f35]">
      <header className="flex items-center gap-3 border-b border-[#eee9e2] px-4 py-4">
        <Link href="/discover" aria-label="Back to discover" className="rounded-full bg-white p-2">
          <ArrowLeft className="size-5" />
        </Link>
        <span className="font-semibold tracking-[-.04em]">rent<span className="text-[#d17b58]">gf</span></span>
      </header>

      <div className="mx-auto max-w-2xl px-4">
        <div className="relative mt-5 overflow-hidden rounded-[26px] bg-[#eaded4]">
          {person.profile_photo_url ? (
            <img src={person.profile_photo_url} alt={`${person.display_name} profile`} className="aspect-[1.05] w-full object-cover" />
          ) : (
            <div className="flex aspect-[1.05] w-full items-center justify-center bg-[#dce9dd] text-6xl font-semibold text-[#4e8068]">
              {person.display_name?.[0] ?? '?'}
            </div>
          )}
          <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold backdrop-blur">
            <ShieldCheck className="size-3.5 text-[#4e8068]" /> Verified companion
          </span>
        </div>

        <section className="py-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-[-.05em]">
                {person.display_name}
                {person.age ? <span className="text-xl font-normal text-[#718079]">{person.age}</span> : null}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-[#718079]">
                <MapPin className="size-3.5" />
                {person.city}
                {person.languages?.length ? ` · ${person.languages.join(' · ')}` : ''}
              </p>
            </div>
            <button
              type="button"
              aria-label={isSaved ? 'Remove from saved' : 'Save companion'}
              onClick={toggleFavorite}
              className="rounded-full bg-white p-3 shadow-sm"
            >
              <Heart className={`size-5 ${isSaved ? 'fill-[#d17b58] text-[#d17b58]' : ''}`} />
            </button>
          </div>

          {person.avg_rating ? (
            <div className="mt-3 flex items-center gap-1.5 text-sm font-semibold">
              <Star className="size-4 fill-[#e7a547] text-[#e7a547]" />
              {Number(person.avg_rating).toFixed(1)}
              <span className="font-normal text-[#718079]">({person.review_count ?? 0} reviews)</span>
            </div>
          ) : null}

          <p className="mt-5 text-[15px] leading-7 text-[#4f6259]">{person.bio}</p>

          {person.categories?.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {person.categories.map((cat) => (
                <span key={cat} className="rounded-full bg-[#edf4ed] px-3 py-1.5 text-xs font-medium text-[#4e8068]">{cat}</span>
              ))}
            </div>
          ) : null}

          {person.interests?.length ? (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[.15em] text-[#89958d]">Interests</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {person.interests.map((interest) => (
                  <span key={interest} className="rounded-full bg-[#f5f0e9] px-3 py-1.5 text-xs font-medium text-[#6e5a3c]">{interest}</span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-7 rounded-[20px] border border-[#e9e2d9] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[.15em] text-[#89958d]">Starting from</p>
            <p className="mt-1 text-2xl font-semibold">
              ₹{(person.starting_price ?? 999).toLocaleString('en-IN')}
              <span className="text-sm font-normal text-[#718079]"> / hour</span>
            </p>
            <p className="mt-2 text-sm text-[#718079]">Payment collected after the companion accepts your request.</p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link
              href={`/booking/${person.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#173f35] px-4 py-3 text-sm font-semibold text-white"
            >
              <CalendarDays className="size-4" /> Book now
            </Link>
            {hasBooking ? (
              <Link
                href={`/messages?companion=${person.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#cedbd1] bg-white px-4 py-3 text-sm font-semibold text-[#173f35]"
              >
                <MessageCircle className="size-4" /> Message
              </Link>
            ) : (
              <div className="flex items-center rounded-2xl border border-[#e9e2d9] bg-[#fffaf4] px-4 py-3 text-xs leading-5 text-[#765f4b]">
                Book first to unlock messages.
              </div>
            )}
          </div>
          <p className="mt-3 text-center text-xs leading-5 text-[#718079]">Lawful, non-sexual social companionship only. Meet in public.</p>

          {reviews.length > 0 && (
            <div className="mt-10">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                Reviews
                <span className="rounded-full bg-[#edf4ed] px-2.5 py-0.5 text-xs font-medium text-[#4e8068]">{reviews.length}</span>
              </h2>
              <div className="mt-4 space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-2xl border border-[#e9e2d9] bg-white p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{review.reviewer_name ?? 'Anonymous'}</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`size-3.5 ${i < review.rating ? 'fill-[#e7a547] text-[#e7a547]' : 'text-[#d5d5d5]'}`} />
                        ))}
                      </div>
                    </div>
                    {review.comment && <p className="mt-2 text-sm leading-6 text-[#68756e]">{review.comment}</p>}
                    {review.created_at && (
                      <p className="mt-2 text-xs text-[#9aa49d]">{new Date(review.created_at).toLocaleDateString()}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isOwnProfile && (
            <ReportBlockActions companionId={person.id} companionProfileId={person.profile_id} name={person.display_name ?? 'companion'} />
          )}
        </section>
      </div>
    </main>
  )
}
