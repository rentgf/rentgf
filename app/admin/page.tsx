'use client'

import { useEffect, useState } from 'react'
import { BookOpen, CheckCircle2, Clock, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Stats = {
  totalUsers: number
  pendingCompanions: number
  totalBookings: number
  confirmedBookings: number
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentBookings, setRecentBookings] = useState<{ id: string; status: string; total_amount: number | null; created_at: string | null }[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [usersRes, pendingRes, bookingsRes, confirmedRes, recentRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        // `companion_profiles` has no `is_approved` column. Pending review state is
        // tracked via `verification_status` (not_submitted | pending | approved | rejected | suspended).
        supabase.from('companion_profiles').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending'),
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'confirmed'),
        supabase.from('bookings').select('id, status, total_amount, created_at').order('created_at', { ascending: false }).limit(5),
      ])
      setStats({
        totalUsers: usersRes.count ?? 0,
        pendingCompanions: pendingRes.count ?? 0,
        totalBookings: bookingsRes.count ?? 0,
        confirmedBookings: confirmedRes.count ?? 0,
      })
      setRecentBookings(recentRes.data ?? [])
    }
    load()
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
        <div className="mt-3 overflow-hidden rounded-2xl border border-[#e9e2d9] bg-white">
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
                    <td className="px-4 py-3">{b.total_amount ? `₹${b.total_amount.toLocaleString('en-IN')}` : '—'}</td>
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
