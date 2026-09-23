'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Bell, CalendarDays, Heart, MessageCircle, ShieldCheck, Star, type LucideIcon } from 'lucide-react'
import { MobileShell } from '@/components/mobile-shell'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Booking = {
  id: string
  status: string
  scheduled_date: string | null
  scheduled_time: string | null
  final_price: number | null
  companion_profile_id: string
  companion_display_name: string | null
  created_at: string | null
}

type Stat = { count: number; label: string; Icon: LucideIcon }

export default function DashboardPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [totalBookings, setTotalBookings] = useState(0)
  const [favCount, setFavCount] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirectTo=/dashboard'); return }

      const [profileResult, bookingsResult, favsResult, notifsResult] = await Promise.all([
        supabase.from('profiles').select('display_name, full_name').eq('id', user.id).maybeSingle(),
        supabase
          .from('bookings')
          .select('id, status, scheduled_date, scheduled_time, final_price, companion_profile_id, created_at, companion_profiles!inner(profiles!inner(display_name))', { count: 'exact' })
          .eq('customer_profile_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('customer_profile_id', user.id),
        supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('profile_id', user.id).eq('is_read', false),
      ])

      if (bookingsResult.error) setLoadError('Could not load your bookings. Please refresh.')

      const mapped: Booking[] = (bookingsResult.data ?? []).map((b) => {
        const cp = b.companion_profiles as unknown as { profiles: { display_name: string | null } }
        return {
          id: b.id,
          status: b.status,
          scheduled_date: b.scheduled_date,
          scheduled_time: b.scheduled_time,
          final_price: b.final_price,
          companion_profile_id: b.companion_profile_id,
          companion_display_name: cp?.profiles?.display_name ?? null,
          created_at: b.created_at,
        }
      })

      setDisplayName(profileResult.data?.display_name ?? profileResult.data?.full_name ?? 'there')
      setBookings(mapped)
      setTotalBookings(bookingsResult.count ?? mapped.length)
      setFavCount(favsResult.count ?? 0)
      setUnreadCount(notifsResult.count ?? 0)
      setLoading(false)
    }
    void load()
  }, [router])

  const upcoming = bookings.filter((b) => ['pending', 'accepted', 'confirmed'].includes(b.status))
  const completed = bookings.filter((b) => b.status === 'completed')

  const stats: Stat[] = [
    { count: upcoming.length, label: 'Upcoming bookings', Icon: CalendarDays },
    { count: favCount, label: 'Likes', Icon: Heart },
    { count: totalBookings, label: 'Total bookings', Icon: MessageCircle },
  ]

  return (
    <MobileShell title="My bookings">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 rounded-2xl bg-[#e9e2d9]" />
            <div className="h-32 rounded-2xl bg-[#e9e2d9]" />
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[.18em] text-[#c36d4d]">Your space</p>
                <h1 className="mt-2 text-4xl font-semibold tracking-[-.05em]">Welcome, {displayName}</h1>
                <p className="mt-3 text-[#68756e]">Track your bookings, likes, and conversations.</p>
              </div>
              <Link href="/notifications" aria-label="Notifications" className="relative rounded-full border border-[#e4e9e1] bg-white p-3">
                <Bell className="size-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-[#c36d4d] text-[10px] font-bold text-white">{unreadCount}</span>
                )}
              </Link>
            </div>

            {loadError && <p className="mt-6 rounded-xl bg-[#fff3ed] px-4 py-3 text-sm text-[#a04f39]">{loadError}</p>}

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {stats.map(({ count, label, Icon }) => (
                <div key={label} className="rounded-2xl border border-[#e9e2d9] bg-white p-5">
                  <Icon className="size-5 text-[#c36d4d]" />
                  <p className="mt-5 text-sm text-[#68756e]">{label}</p>
                  <p className="mt-1 text-2xl font-semibold">{count}</p>
                </div>
              ))}
            </div>

            {upcoming.length > 0 && (
              <div className="mt-8">
                <h2 className="font-semibold">Upcoming bookings</h2>
                <div className="mt-4 flex flex-col gap-3">
                  {upcoming.map((booking) => (
                    <div key={booking.id} className="rounded-2xl border border-[#e9e2d9] bg-white p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarDays className="size-4 text-[#c36d4d]" />
                          <span className="font-medium">{booking.scheduled_date ?? 'Date TBC'}</span>
                          <span className="text-[#738078]">{booking.scheduled_time ?? ''}</span>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          booking.status === 'confirmed' ? 'bg-[#f4faf4] text-[#4e8068]' :
                          booking.status === 'accepted' ? 'bg-[#fff8ed] text-[#8c5c2a]' :
                          'bg-[#f5f0e9] text-[#6e5a3c]'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      {booking.companion_display_name && (
                        <p className="mt-2 text-sm font-semibold text-[#173f35]">with {booking.companion_display_name}</p>
                      )}
                      {booking.final_price != null && (
                        <p className="mt-1 text-sm text-[#738078]">₹{booking.final_price.toLocaleString('en-IN')}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completed.length > 0 && (
              <div className="mt-8">
                <h2 className="font-semibold">Leave a review</h2>
                <div className="mt-4 flex flex-col gap-3">
                  {completed.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between rounded-2xl border border-[#e9e2d9] bg-white p-4">
                      <div>
                        <p className="text-sm font-semibold">Booking with {booking.companion_display_name ?? 'companion'}</p>
                        <p className="mt-0.5 text-xs text-[#738078]">{booking.scheduled_date ?? ''}</p>
                      </div>
                      <Link
                        href={`/reviews?bookingId=${booking.id}&companionId=${booking.companion_profile_id}`}
                        className="flex items-center gap-1.5 rounded-full bg-[#fff8ed] px-3 py-2 text-xs font-semibold text-[#8c5c2a]"
                      >
                        <Star className="size-3.5 fill-[#e7a547] text-[#e7a547]" /> Rate
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {[
                ['Upcoming bookings', upcoming.length === 0 ? 'No bookings yet. Your next plan can start here.' : `${upcoming.length} upcoming`, '/discover', 'Explore companions'],
                ['Likes', favCount === 0 ? 'Like profiles you want to revisit.' : `${favCount} saved`, '/likes', 'View liked profiles'],
                ['Messages', 'Conversations will appear here after a booking.', '/messages', 'Open messages'],
              ].map(([title, text, href, action]) => (
                <section key={title as string} className="rounded-2xl border border-[#e9e2d9] bg-white p-5">
                  <h2 className="font-semibold">{title}</h2>
                  <p className="mt-3 min-h-12 text-sm leading-6 text-[#68756e]">{text}</p>
                  <Link href={href as string} className="mt-5 inline-block text-sm font-semibold text-[#c36d4d]">{action} →</Link>
                </section>
              ))}
            </div>

            <section className="mt-8 flex gap-4 rounded-2xl bg-[#edf4ee] p-5">
              <ShieldCheck className="size-5 shrink-0 text-[#4d8a73]" />
              <div>
                <h2 className="font-semibold">Your safety comes first</h2>
                <p className="mt-1 text-sm leading-6 text-[#68756e]">Keep conversations respectful, meet in public, and report anything that feels wrong.</p>
              </div>
            </section>
          </>
        )}
      </main>
    </MobileShell>
  )
}
