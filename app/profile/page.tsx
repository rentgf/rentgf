'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CalendarDays, KeyRound, LogOut, Settings, ShieldCheck, Star, Users } from 'lucide-react'
import { MobileShell } from '@/components/mobile-shell'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  display_name: string | null
  email: string | null
  profile_photo_url: string | null
  role: string | null
  account_status: string | null
  date_of_birth: string | null
}

type CompanionProfile = {
  verification_status: string | null
  is_visible: boolean | null
  avg_rating: number | null
  total_reviews: number | null
  city: string | null
  starting_price: number | null
} | null

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [companionProfile, setCompanionProfile] = useState<CompanionProfile>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirectTo=/profile'); return }

      // `companion_profiles` is keyed by its own `id`, linked to the user via
      // `profile_id` (not `id`). It also has no `is_approved`/`review_count`
      // columns — the real columns are `verification_status`/`total_reviews`.
      const [profileRes, companionRes] = await Promise.all([
        supabase.from('profiles').select('display_name, email, profile_photo_url, role, account_status, date_of_birth').eq('id', user.id).single(),
        supabase.from('companion_profiles').select('verification_status, is_visible, avg_rating, total_reviews, city, starting_price').eq('profile_id', user.id).maybeSingle(),
      ])

      setProfile(profileRes.data ?? null)
      setCompanionProfile(companionRes.data ?? null)
      setLoading(false)
    }
    load()
  }, [router])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const initials = profile?.display_name?.[0]?.toUpperCase() ?? '?'
  const isCompanion = profile?.role === 'companion'
  const isApproved = companionProfile?.verification_status === 'approved'

  return (
    <MobileShell title="Profile">
      <main className="mx-auto max-w-xl px-4 pb-32 pt-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-28 rounded-2xl bg-[#ede8e1]" />
            <div className="h-16 rounded-2xl bg-[#ede8e1]" />
            <div className="h-40 rounded-2xl bg-[#ede8e1]" />
          </div>
        ) : (
          <>
            {/* Profile card */}
            <section className="rounded-[22px] border border-[#e9e2d9] bg-white p-6">
              <div className="flex items-center gap-4">
                {profile?.profile_photo_url ? (
                  <img src={profile.profile_photo_url} alt="" className="size-16 rounded-full object-cover" />
                ) : (
                  <div className="flex size-16 items-center justify-center rounded-full bg-[#dce9dd] text-2xl font-semibold text-[#173f35]">
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#c36d4d]">
                    {profile?.role === 'companion' ? (isApproved ? 'Companion' : 'Pending Review') : 'Member'}
                  </p>
                  <h1 className="mt-0.5 text-xl font-semibold text-[#173f35] truncate">{profile?.display_name ?? 'Your Profile'}</h1>
                  <p className="mt-0.5 text-sm text-[#68756e] truncate">{profile?.email}</p>
                </div>
              </div>
              <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#edf4ee] p-4">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#4e8068]" />
                <p className="text-sm leading-6 text-[#52665a]">Keep your information private and use the platform safely.</p>
              </div>
            </section>

            {/* Companion status card */}
            {isCompanion && (
              <section className="mt-4 rounded-[22px] border border-[#e9e2d9] bg-white p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-[#4e8068]" />
                    <p className="font-semibold text-sm">Companion profile</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    isApproved ? 'bg-[#edf4ed] text-[#4e8068]' : 'bg-[#fff8ed] text-[#8c5c2a]'
                  }`}>
                    {isApproved ? 'Approved' : 'Pending review'}
                  </span>
                </div>
                {isApproved && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#f5f3ef] p-3">
                      <p className="text-xs text-[#8a9490]">Rating</p>
                      <p className="mt-1 flex items-center gap-1 font-semibold">
                        <Star className="size-3.5 fill-[#e7a547] text-[#e7a547]" />
                        {companionProfile?.avg_rating ? Number(companionProfile.avg_rating).toFixed(1) : '–'}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#f5f3ef] p-3">
                      <p className="text-xs text-[#8a9490]">Reviews</p>
                      <p className="mt-1 font-semibold">{companionProfile?.total_reviews ?? 0}</p>
                    </div>
                    <div className="rounded-xl bg-[#f5f3ef] p-3">
                      <p className="text-xs text-[#8a9490]">City</p>
                      <p className="mt-1 font-semibold text-sm">{companionProfile?.city ?? '–'}</p>
                    </div>
                    <div className="rounded-xl bg-[#f5f3ef] p-3">
                      <p className="text-xs text-[#8a9490]">Rate</p>
                      <p className="mt-1 font-semibold text-sm">₹{(companionProfile?.starting_price ?? 0).toLocaleString('en-IN')}/hr</p>
                    </div>
                  </div>
                )}
                <Link href="/companion" className="mt-4 block w-full rounded-xl bg-[#173f35] py-2.5 text-center text-sm font-semibold text-white">
                  Companion dashboard →
                </Link>
              </section>
            )}

            {/* Action grid */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link href="/dashboard" className="rounded-2xl border border-[#e9e2d9] bg-white p-4">
                <CalendarDays className="size-5 text-[#c36d4d]" />
                <p className="mt-4 font-semibold">My bookings</p>
                <p className="mt-1 text-sm text-[#68756e]">View your upcoming plans.</p>
              </Link>
              <Link href="/change-password" className="rounded-2xl border border-[#e9e2d9] bg-white p-4">
                <KeyRound className="size-5 text-[#c36d4d]" />
                <p className="mt-4 font-semibold">Change password</p>
                <p className="mt-1 text-sm text-[#68756e]">Update your sign-in password.</p>
              </Link>
              <Link href="/notifications" className="rounded-2xl border border-[#e9e2d9] bg-white p-4">
                <Bell className="size-5 text-[#c36d4d]" />
                <p className="mt-4 font-semibold">Notifications</p>
                <p className="mt-1 text-sm text-[#68756e]">Stay up to date.</p>
              </Link>
              <Link href="/settings" className="rounded-2xl border border-[#e9e2d9] bg-white p-4">
                <Settings className="size-5 text-[#c36d4d]" />
                <p className="mt-4 font-semibold">Settings</p>
                <p className="mt-1 text-sm text-[#68756e]">Privacy and account settings.</p>
              </Link>
            </div>

            {/* Become companion CTA */}
            {!isCompanion && (
              <Link href="/become-companion" className="mt-4 flex items-center gap-3 rounded-2xl border border-[#d5e8d8] bg-[#f4faf4] p-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#dce9dd]">
                  <Users className="size-5 text-[#4e8068]" />
                </div>
                <div>
                  <p className="font-semibold text-[#173f35]">Earn as a companion</p>
                  <p className="text-sm text-[#52665a]">Apply to become a verified companion.</p>
                </div>
              </Link>
            )}

            {/* Sign out */}
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#e9e2d9] bg-white py-3.5 text-sm font-semibold text-[#68756e]"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </>
        )}
      </main>
    </MobileShell>
  )
}
