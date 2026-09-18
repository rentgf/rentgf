'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Heart, ShieldCheck } from 'lucide-react'
import { MobileShell } from '@/components/mobile-shell'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type FavoriteCompanion = {
  favorite_id: string
  companion_profile_id: string
  display_name: string | null
  profile_photo_url: string | null
  city: string | null
  starting_price: number | null
  avg_rating: number | null
}

export default function LikesPage() {
  const router = useRouter()
  const [favorites, setFavorites] = useState<FavoriteCompanion[]>([])
  const [loading, setLoading] = useState(true)
  const [profileId, setProfileId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirectTo=/likes'); return }
      setProfileId(user.id)

      const { data } = await supabase
        .from('favorites')
        .select(`
          id,
          companion_profile_id,
          companion_profiles!inner(
            id,
            starting_price,
            avg_rating,
            city,
            profiles!inner(display_name, profile_photo_url)
          )
        `)
        .eq('customer_profile_id', user.id)
        .order('created_at', { ascending: false })

      const mapped = (data ?? []).map((row) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cp = row.companion_profiles as any
        const profile = cp?.profiles
        return {
          favorite_id: row.id,
          companion_profile_id: row.companion_profile_id,
          display_name: profile?.display_name ?? null,
          profile_photo_url: profile?.profile_photo_url ?? null,
          city: cp?.city ?? null,
          starting_price: cp?.starting_price ?? null,
          avg_rating: cp?.avg_rating ?? null,
        }
      })
      setFavorites(mapped)
      setLoading(false)
    }
    load()
  }, [router])

  async function removeFavorite(favoriteId: string) {
    const supabase = createClient()
    await supabase.from('favorites').delete().eq('id', favoriteId)
    setFavorites((prev) => prev.filter((f) => f.favorite_id !== favoriteId))
  }

  return (
    <MobileShell title="Liked companions">
      <main className="mx-auto max-w-xl px-4 py-6">
        {loading ? (
          <p className="text-center text-sm text-[#738078]">Loading…</p>
        ) : favorites.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#fff8ed]">
              <Heart className="size-7 text-[#c36d4d]" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold">No liked companions yet</h1>
            <p className="mt-2 text-sm leading-6 text-[#68756e]">Like profiles you want to revisit. They will appear here.</p>
            <Link href="/discover" className="mt-6 inline-flex rounded-full bg-[#173f35] px-5 py-3 text-sm font-semibold text-white">Discover companions</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {favorites.map((fav) => (
              <div key={fav.favorite_id} className="overflow-hidden rounded-[22px] border border-[#ebe5dd] bg-white shadow-sm">
                <div className="flex items-center justify-between px-4 py-3">
                  <Link href={`/companions/${fav.companion_profile_id}`} className="flex items-center gap-2.5">
                    {fav.profile_photo_url ? (
                      <img src={fav.profile_photo_url} alt="" className="size-10 rounded-full object-cover" />
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-full bg-[#dce9dd] font-semibold text-[#173f35]">
                        {fav.display_name?.[0] ?? '?'}
                      </div>
                    )}
                    <span>
                      <span className="flex items-center gap-1 text-sm font-semibold text-[#173f35]">
                        {fav.display_name}
                        <ShieldCheck className="size-3.5 text-[#4e8c70]" />
                      </span>
                      <span className="block text-[11px] text-[#849087]">
                        {fav.city ?? 'India'}
                        {fav.avg_rating ? ` · ★ ${Number(fav.avg_rating).toFixed(1)}` : ''}
                      </span>
                    </span>
                  </Link>
                  <button
                    type="button"
                    aria-label="Remove from likes"
                    onClick={() => removeFavorite(fav.favorite_id)}
                    className="rounded-full p-2 hover:bg-[#fdf3ee]"
                  >
                    <Heart className="size-5 fill-[#d17b58] text-[#d17b58]" />
                  </button>
                </div>
                <div className="border-t border-[#f0ebe4] px-4 py-3 flex items-center justify-between">
                  {fav.starting_price && (
                    <p className="text-xs text-[#8a958e]">From <span className="font-semibold text-[#173f35]">₹{fav.starting_price.toLocaleString('en-IN')}</span>/hr</p>
                  )}
                  <Link href={`/booking/${fav.companion_profile_id}`} className="ml-auto rounded-full bg-[#173f35] px-4 py-2 text-xs font-semibold text-white">Book now</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </MobileShell>
  )
}
