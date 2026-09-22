'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type CompanionRow = {
  id: string
  profile_id: string
  bio: string | null
  city: string | null
  starting_price: number | null
  categories: string[] | null
  verification_status: string | null
  is_visible: boolean | null
  created_at: string | null
  display_name: string | null
  email: string | null
  profile_photo_url: string | null
}

type Tab = 'pending' | 'approved' | 'rejected'

export default function AdminCompanionsPage() {
  const [companions, setCompanions] = useState<CompanionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('pending')
  const [processing, setProcessing] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<{ id: string; name: string; email: string } | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  async function load() {
    setLoading(true)
    const supabase = createClient()
    // `companion_profiles` has no `is_approved` column. Review state lives in
    // `verification_status` (not_submitted | pending | approved | rejected | suspended).
    // `profile_id` is the FK back to `profiles.id` and is required to update the
    // linked profile's role and to send notifications (both keyed by profiles.id,
    // which is NOT the same as this companion_profiles row's own `id`).
    const { data } = await supabase
      .from('companion_profiles')
      .select('id, profile_id, bio, city, starting_price, categories, verification_status, is_visible, created_at, profiles!inner(display_name, email, profile_photo_url)')
      .order('created_at', { ascending: false })
    if (data) {
      setCompanions(data.map((row) => {
        const p = row.profiles as unknown as { display_name: string | null; email: string | null; profile_photo_url: string | null }
        return { ...row, display_name: p.display_name, email: p.email, profile_photo_url: p.profile_photo_url }
      }))
    }
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  async function approve(companion: CompanionRow) {
    setProcessing(companion.id)
    const supabase = createClient()
    await supabase.from('companion_profiles').update({ verification_status: 'approved', is_visible: true }).eq('id', companion.id)
    await supabase.from('profiles').update({ role: 'companion' }).eq('id', companion.profile_id)
    await supabase.from('notifications').insert({
      profile_id: companion.profile_id,
      type: 'verification',
      title: 'Application approved!',
      body: 'Congratulations! Your companion profile is now live on RentGF.',
    })
    if (companion.email) {
      await fetch('/api/email/companion-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'approved', email: companion.email, name: companion.display_name ?? 'there' }),
      })
    }
    await load()
    setProcessing(null)
  }

  async function reject(companion: CompanionRow, reason?: string) {
    setProcessing(companion.id)
    const supabase = createClient()
    await supabase.from('companion_profiles').update({ verification_status: 'rejected', is_visible: false }).eq('id', companion.id)
    await supabase.from('profiles').update({ role: 'customer' }).eq('id', companion.profile_id)
    await supabase.from('notifications').insert({
      profile_id: companion.profile_id,
      type: 'verification',
      title: 'Application not approved',
      body: 'Thank you for applying. Unfortunately we are unable to approve your profile at this time.',
    })
    if (companion.email) {
      await fetch('/api/email/companion-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'rejected', email: companion.email, name: companion.display_name ?? 'there', reason }),
      })
    }
    await load()
    setProcessing(null)
    setRejectModal(null)
    setRejectReason('')
  }

  const filtered = companions.filter((c) => {
    if (tab === 'pending') return c.verification_status === 'pending' || c.verification_status === 'not_submitted'
    if (tab === 'approved') return c.verification_status === 'approved'
    return c.verification_status === 'rejected' || c.verification_status === 'suspended'
  })

  const TABS: { key: Tab; label: string }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-[#173f35]">Companions</h1>
      <p className="mt-1 text-sm text-[#68756e]">Review and approve companion applications. Emails are sent automatically on status changes.</p>

      <div className="mt-5 flex gap-2">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              tab === key ? 'bg-[#173f35] text-white' : 'bg-white border border-[#e9e2d9] text-[#52645b]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-white border border-[#e9e2d9]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-[#e9e2d9] bg-white p-8 text-center text-sm text-[#68756e]">
            No {tab} companions.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((companion) => (
              <div key={companion.id} className="rounded-2xl border border-[#e9e2d9] bg-white p-4">
                <div className="flex items-start gap-4">
                  {companion.profile_photo_url ? (
                    <img src={companion.profile_photo_url} alt="" className="size-12 rounded-full object-cover" />
                  ) : (
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#dce9dd] font-semibold text-[#173f35]">
                      {companion.display_name?.[0] ?? '?'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold">{companion.display_name}</p>
                        <p className="text-xs text-[#738078]">{companion.email} · {companion.city}</p>
                      </div>
                      {tab === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={processing === companion.id}
                            onClick={() => approve(companion)}
                            className="flex items-center gap-1.5 rounded-full bg-[#edf4ed] px-3 py-1.5 text-xs font-semibold text-[#4e8068] disabled:opacity-60"
                          >
                            <CheckCircle2 className="size-3.5" /> Approve
                          </button>
                          <button
                            type="button"
                            disabled={processing === companion.id}
                            onClick={() => setRejectModal({ id: companion.id, name: companion.display_name ?? '', email: companion.email ?? '' })}
                            className="flex items-center gap-1.5 rounded-full bg-[#fff3ed] px-3 py-1.5 text-xs font-semibold text-[#c36d4d] disabled:opacity-60"
                          >
                            <XCircle className="size-3.5" /> Reject
                          </button>
                        </div>
                      )}
                      {tab === 'approved' && (
                        <button
                          type="button"
                          disabled={processing === companion.id}
                          onClick={() => setRejectModal({ id: companion.id, name: companion.display_name ?? '', email: companion.email ?? '' })}
                          className="rounded-full bg-[#fff3ed] px-3 py-1.5 text-xs font-semibold text-[#c36d4d] disabled:opacity-60"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {companion.bio && (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#68756e]">{companion.bio}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {companion.categories?.slice(0, 4).map((cat) => (
                        <span key={cat} className="rounded-full bg-[#f0f4ef] px-2.5 py-1 text-[10px] font-medium text-[#4e8068]">{cat}</span>
                      ))}
                      {companion.starting_price && (
                        <span className="rounded-full bg-[#f5f0e9] px-2.5 py-1 text-[10px] font-medium text-[#6e5a3c]">₹{companion.starting_price}/hr</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#e9e2d9] bg-white p-6 shadow-xl">
            <h3 className="font-semibold text-[#173f35]">Reject companion</h3>
            <p className="mt-1 text-sm text-[#68756e]">
              Optionally add a reason that will be included in the rejection email to <strong>{rejectModal.name}</strong>.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Profile photos do not meet guidelines…"
              rows={3}
              className="mt-4 w-full rounded-xl border border-[#e5e1da] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#bdd2c7]"
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => { setRejectModal(null); setRejectReason('') }}
                className="flex-1 rounded-xl border border-[#e9e2d9] py-2.5 text-sm font-semibold text-[#68756e]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const companion = companions.find((c) => c.id === rejectModal.id)
                  if (companion) void reject(companion, rejectReason || undefined)
                }}
                className="flex-1 rounded-xl bg-[#c36d4d] py-2.5 text-sm font-semibold text-white"
              >
                Reject &amp; send email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
