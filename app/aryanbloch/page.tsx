'use client'

import { useEffect, useState } from 'react'
import { BookOpen, CheckCircle2, Clock, Users } from 'lucide-react'

type Stats = {
  totalUsers: number
  pendingCompanions: number
  totalBookings: number
  confirmedBookings: number
}

type RecentBooking = { id: string; status: string; final_price: number | null; created_at: string | null }

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    // Server API uses the service role; the browser client is blocked by RLS for the admin.
    fetch('/api/aryanbloch/bookings', { cache: 'no-store' })
      .then(async (res) => {
        const json = (await res.json()) as { stats?: Stats; bookings?: RecentBooking[]; error?: string }
        if (!res.ok || !json.stats) { setError(json.error ?? 'Could not load stats'); return }
        setStats(json.stats)
        setRecentBookings((json.bookings ?? []).slice(0, 5))
      })
      .catch(() => setError('Could not load stats'))
  }, [])

  const cards = [
    { label: 'Total users', value: stats?.totalUsers ?? '…', icon: Users, color: 'text-[#4e8068]', bg: 'bg-[#edf4ed]' },
    { label: 'Pending companions', value: stats?.pendingCompanions ?? '…', icon: Clock, color: 'text-[#c36d4d]', bg: 'bg-[#fff3ed]' },
    { label: 'Total bookings', value: stats?.totalBookings ?? '…', icon: BookOpen, color: 'text-[#173f35]', bg: 'bg-[#e9f0e9]' },
    { label: 'Confirmed bookings', value: stats?.confirmedBookings ?? '…', icon: CheckCircle2, color: 'text-[#4e8068]', bg: 'bg-[#edf4ed]' },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-[#173f35]">Overview</h1>
      <p className="mt-1 text-sm text-[#68756e]">Platform stats at a glance.</p>

      {error && <p className="mt-4 rounded-xl bg-[#fff3ed] px-4 py-3 text-sm text-[#a04f39]">{error}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl border border-[#e9e2d9] bg-white p-5">
            <div className={`flex size-10 items-center justify-center rounded-full ${bg}`}>
              <Icon className={`size-5 ${color}`} />
            </div>
            <p className="mt-4 text-2xl font-semibold">{value}</p>
            <p className="mt-1 text-sm text-[#68756e]">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="font-semibold text-[#173f35]">Recent bookings</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-[#e9e2d9] bg-white">
          {recentBookings.length === 0 ? (
            <p className="p-6 text-sm text-[#68756e]">No bookings yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-[#f0ebe4] bg-[#faf8f5] text-xs font-semibold uppercase tracking-wider text-[#89958d]">
                <tr>
                  <th className="px-4 py-3 text-left">Booking ID</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f1ec]">
                {recentBookings.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-3 font-mono text-xs text-[#52645b]">{b.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        b.status === 'confirmed' ? 'bg-[#edf4ed] text-[#4e8068]' :
                        b.status === 'pending' ? 'bg-[#fff8ed] text-[#8c5c2a]' :
                        'bg-[#f5f0e9] text-[#6e5a3c]'
                      }`}>{b.status}</span>
                    </td>
                    <td className="px-4 py-3">{b.final_price ? `₹${Number(b.final_price).toLocaleString('en-IN')}` : '—'}</td>
                    <td className="px-4 py-3 text-[#738078]">{b.created_at ? new Date(b.created_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
