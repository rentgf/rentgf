'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, Check, Clock3, Inbox, MapPin, X } from 'lucide-react'
import { MobileShell } from '@/components/mobile-shell'
import { createClient } from '@/lib/supabase/client'

type Request = {
  id: string
  status: string
  scheduled_date: string | null
  scheduled_time: string | null
  duration_hours: number | null
  location_description: string | null
  activity_type: string | null
  customer_notes: string | null
  final_price: number | null
}

type Tab = 'pending' | 'upcoming' | 'past'

const TAB_STATUSES: Record<Tab, string[]> = {
  pending: ['pending'],
  upcoming: ['accepted', 'confirmed'],
  past: ['completed', 'rejected', 'cancelled', 'disputed'],
}

const PLATFORM_FEE_RATE = 0.15

export default function CompanionBookingsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [notCompanion, setNotCompanion] = useState(false)
  const [tab, setTab] = useState<Tab>('pending')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login?redirectTo=/companion/bookings'); return }

    // bookings.companion_profile_id -> companion_profiles.id (not profiles.id)
    const { data: cp } = await supabase.from('companion_profiles').select('id').eq('profile_id', user.id).maybeSingle()
    if (!cp) { setNotCompanion(true); setLoading(false); return }

    const { data, error: qErr } = await supabase
      .from('bookings')
      .select('id, status, scheduled_date, scheduled_time, duration_hours, location_description, activity_type, customer_notes, final_price')
      .eq('companion_profile_id', cp.id)
      .order('scheduled_date', { ascending: true })
      .limit(100)

    if (qErr) setError('Could not load booking requests.')
    setRequests(data ?? [])
    setLoading(false)
  }, [router])

  useEffect(() => { load() }, [load])

  async function respond(id: string, accept: boolean) {
    setBusyId(id)
    setError('')
    const supabase = createClient()
    const { error: rpcErr } = await supabase.rpc('companion_respond_to_booking', { p_booking_id: id, p_accept: accept })
    if (rpcErr) setError(rpcErr.message)
    else setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: accept ? 'accepted' : 'rejected' } : r)))
    setBusyId(null)
  }

  const visible = requests.filter((r) => TAB_STATUSES[tab].includes(r.status))

  if (loading) {
    return <MobileShell title="Booking requests"><div className="mx-auto max-w-3xl animate-pulse space-y-3 px-4 py-8">{[0, 1, 2].map((i) => <div key={i} className="h-28 rounded-2xl bg-[#e9e2d9]" />)}</div></MobileShell>
  }

  if (notCompanion) {
    return (
      <MobileShell title="Booking requests">
        <main className="mx-auto max-w-xl px-4 py-12 text-center">
          <Inbox className="mx-auto size-8 text-[#c36d4d]" />
          <h1 className="mt-4 text-2xl font-semibold">You are not a companion yet</h1>
          <p className="mt-2 text-sm text-[#68756e]">Create a companion profile to start receiving booking requests.</p>
          <Link href="/become-companion" className="mt-6 inline-flex rounded-full bg-[#173f35] px-5 py-3 text-sm font-semibold text-white">Become a companion</Link>
        </main>
      </MobileShell>
    )
  }

  return (
    <MobileShell title="Booking requests" showBack>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="flex gap-2 rounded-full bg-[#f0ede7] p-1">
          {(Object.keys(TAB_STATUSES) as Tab[]).map((t) => {
            const count = requests.filter((r) => TAB_STATUSES[t].includes(r.status)).length
            return (
              <button key={t} type="button" onClick={() => setTab(t)}
                className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold capitalize transition ${tab === t ? 'bg-white text-[#173f35] shadow-sm' : 'text-[#738078]'}`}>
                {t} {count > 0 && <span className="ml-1 text-xs text-[#c36d4d]">{count}</span>}
              </button>
            )
          })}
        </div>

        {error && <p className="mt-4 rounded-xl bg-[#fff3ed] px-4 py-3 text-sm text-[#a04f39]">{error}</p>}

        {visible.length === 0 ? (
          <div className="mt-10 text-center">
            <Inbox className="mx-auto size-7 text-[#9aa59f]" />
            <p className="mt-3 text-sm text-[#68756e]">No {tab} bookings.</p>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-3">
            {visible.map((r) => {
              const earning = r.final_price != null ? r.final_price - Math.round(r.final_price * PLATFORM_FEE_RATE) : null
              return (
                <article key={r.id} className="rounded-2xl border border-[#e9e2d9] bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 text-sm">
                      <p className="flex items-center gap-2 font-semibold"><CalendarDays className="size-4 text-[#c36d4d]" />{r.scheduled_date ?? 'Date TBC'} · {r.scheduled_time ?? ''}</p>
                      <p className="flex items-center gap-2 text-[#68756e]"><Clock3 className="size-4" />{r.duration_hours ?? 1}h{r.activity_type ? ` · ${r.activity_type}` : ''}</p>
                      {r.location_description && <p className="flex items-center gap-2 text-[#68756e]"><MapPin className="size-4" />{r.location_description}</p>}
                    </div>
                    <div className="text-right">
                      {earning != null && <p className="font-semibold">₹{earning.toLocaleString('en-IN')}</p>}
                      <p className="text-xs text-[#738078]">your earning</p>
                      <span className="mt-2 inline-block rounded-full bg-[#f5f0e9] px-3 py-1 text-xs font-semibold capitalize text-[#6e5a3c]">{r.status}</span>
                    </div>
                  </div>
                  {r.customer_notes && <p className="mt-3 rounded-xl bg-[#fbfaf7] p-3 text-sm text-[#52665a]">{r.customer_notes}</p>}
                  {r.status === 'pending' && (
                    <div className="mt-4 flex gap-2">
                      <button type="button" disabled={busyId === r.id} onClick={() => respond(r.id, true)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#173f35] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                        <Check className="size-4" />Accept
                      </button>
                      <button type="button" disabled={busyId === r.id} onClick={() => respond(r.id, false)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#f5ebe6] px-4 py-2.5 text-sm font-semibold text-[#a04f39] disabled:opacity-60">
                        <X className="size-4" />Decline
                      </button>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </main>
    </MobileShell>
  )
}
