'use client'

import { useEffect, useState } from 'react'

type Booking = {
  id: string
  status: string
  payment_status: string | null
  final_price: number | null
  scheduled_date: string | null
  scheduled_time: string | null
  created_at: string | null
  customer_name: string | null
  companion_name: string | null
}

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'cancelled'

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'cancelled', label: 'Cancelled' },
]

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')

  useEffect(() => {
    // Server API uses the service role; the browser client is blocked by RLS for the admin.
    fetch('/api/aryanbloch/bookings', { cache: 'no-store' })
      .then(async (res) => {
        const json = (await res.json()) as { bookings?: Booking[]; error?: string }
        if (!res.ok) setError(json.error ?? 'Could not load bookings')
        setBookings(json.bookings ?? [])
      })
      .catch(() => setError('Could not load bookings'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-[#173f35]">Bookings</h1>
      <p className="mt-1 text-sm text-[#68756e]">All platform bookings.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {STATUS_TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold ${
              filter === key ? 'bg-[#173f35] text-white' : 'bg-white border border-[#e9e2d9] text-[#52645b]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 rounded-xl bg-[#fff3ed] px-4 py-3 text-sm text-[#a04f39]">{error}</p>}

      <div className="mt-5 overflow-hidden rounded-2xl border border-[#e9e2d9] bg-white">
        {loading ? (
          <p className="p-6 text-sm text-[#68756e]">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-[#68756e]">No bookings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#f0ebe4] bg-[#faf8f5] text-xs font-semibold uppercase tracking-wider text-[#89958d]">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Companion</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f1ec]">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-[#faf8f5]">
                    <td className="px-4 py-3 font-mono text-xs text-[#52645b]">{b.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3">{b.customer_name ?? '—'}</td>
                    <td className="px-4 py-3">{b.companion_name ?? '—'}</td>
                    <td className="px-4 py-3 text-[#738078]">
                      {b.scheduled_date ?? '—'}
                      {b.scheduled_time ? ` ${b.scheduled_time}` : ''}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {b.final_price ? `₹${Number(b.final_price).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        b.status === 'confirmed' ? 'bg-[#edf4ed] text-[#4e8068]' :
                        b.status === 'pending' ? 'bg-[#fff8ed] text-[#8c5c2a]' :
                        b.status === 'cancelled' ? 'bg-[#fff0f0] text-[#a04040]' :
                        'bg-[#f5f0e9] text-[#6e5a3c]'
                      }`}>{b.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        b.payment_status?.toUpperCase() === 'PAID' ? 'bg-[#edf4ed] text-[#4e8068]' : 'bg-[#f5f0e9] text-[#6e5a3c]'
                      }`}>{b.payment_status ?? 'PENDING'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
