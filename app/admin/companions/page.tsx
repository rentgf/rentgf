'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type CompanionRow = {
  id: string
  bio: string | null
  city: string | null
  starting_price: number | null
  categories: string[] | null
  is_approved: boolean | null
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

  async function load() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('companion_profiles')
      .select('id, bio, city, starting_price, categories, is_approved, is_visible, created_at, profiles!inner(display_name, email, profile_photo_url)')
      .order('created_at', { ascending: false })
    if (data) {
      setCompanions(data.map((row) => {
        const p = row.profiles as unknown as { display_name: string | null; email: string | null; profile_photo_url: string | null }
        return { ...row, display_name: p.display_name, email: p.email, profile_photo_url: p.profile_photo_url }
      }))
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function approve(companionId: string) {
    setProcessing(companionId)
    const supabase = createClient()
    await supabase.from('companion_profiles').update({ is_approved: true, is_visible: true }).eq('id', companionId)
    await supabase.from('profiles').update({ role: 'companion' }).eq('id', companionId)
    await supabase.from('notifications').insert({
      profile_id: companionId,
      type: 'application_approved',
      title: 'Application approved!',
      body: 'Congratulations! Your companion profile is now live on RentGF.',
    })
    await load()
    setProcessing(null)
  }

  async function reject(companionId: string) {
    setProcessing(companionId)
    const supabase = createClient()
    await supabase.from('companion_profiles').update({ is_approved: false, is_visible: false }).eq('id', companionId)
    await supabase.from('profiles').update({ role: 'customer' }).eq('id', companionId)
    await supabase.from('notifications').insert({
      profile_id: companionId,
      type: 'application_rejected',
      title: 'Application not approved',
      body: 'Thank you for applying. Unfortunately we are unable to approve your profile at this time.',
    })
    await load()
    setProcessing(null)
  }

  const filtered = companions.filter((c) => {
    if (tab === 'pending') return !c.is_approved
    if (tab === 'approved') return c.is_approved && c.is_visible
    return c.is_approved === false && !c.is_visible
  })

  const TABS: { key: Tab; label: string }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-[#173f35]">Companions</h1>
      <p className="mt-1 text-sm text-[#68756e]">Review and approve companion applications.</p>

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
                            onClick={() => approve(companion.id)}
                            className="flex items-center gap-1.5 rounded-full bg-[#edf4ed] px-3 py-1.5 text-xs font-semibold text-[#4e8068] disabled:opacity-60"
                          >
                            <CheckCircle2 className="size-3.5" /> Approve
                          </button>
                          <button
                            type="button"
                            disabled={processing === companion.id}
                            onClick={() => reject(companion.id)}
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
                          onClick={() => reject(companion.id)}
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
    </div>
  )
}
