'use client'

import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, FileImage, XCircle } from 'lucide-react'

type VerificationDoc = {
  id: string
  status: string
  submitted_at: string | null
  id_document_url: string | null
  selfie_url: string | null
}

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
  verification: VerificationDoc | null
}

type Tab = 'pending' | 'approved' | 'rejected'

const TABS: { key: Tab; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]

export default function AdminCompanionsPage() {
  const [companions, setCompanions] = useState<CompanionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('pending')
  const [processing, setProcessing] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<CompanionRow | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [preview, setPreview] = useState<string | null>(null)

  // All admin reads/writes go through the password-guarded API, which uses the
  // service-role key server-side. The browser client cannot bypass RLS.
  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const res = await fetch('/api/aryanbloch/companions', { cache: 'no-store' })
    const json = (await res.json()) as { companions?: CompanionRow[]; error?: string }
    if (!res.ok) setError(json.error ?? 'Could not load companions')
    setCompanions(json.companions ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  async function decide(companion: CompanionRow, action: 'approve' | 'reject', reason?: string) {
    setProcessing(companion.id)
    setError('')
    const res = await fetch('/api/aryanbloch/companions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companionId: companion.id, action, reason }),
    })
    if (!res.ok) {
      const json = (await res.json()) as { error?: string }
      setError(json.error ?? 'Action failed')
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-[#173f35]">Companions</h1>
      <p className="mt-1 text-sm text-[#68756e]">Check ID documents, then approve or reject. Emails are sent automatically.</p>

      <div className="mt-5 flex gap-2">
        {TABS.map(({ key, label }) => (
          <button key={key} type="button" onClick={() => setTab(key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === key ? 'bg-[#173f35] text-white' : 'border border-[#e9e2d9] bg-white text-[#52645b]'}`}>
            {label}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 rounded-xl bg-[#fff3ed] px-4 py-3 text-sm text-[#a04f39]">{error}</p>}

      <div className="mt-5">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl border border-[#e9e2d9] bg-white" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-[#e9e2d9] bg-white p-8 text-center text-sm text-[#68756e]">No {tab} companions.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => (
              <div key={c.id} className="rounded-2xl border border-[#e9e2d9] bg-white p-4">
                <div className="flex items-start gap-4">
                  {c.profile_photo_url ? (
                    <img src={c.profile_photo_url} alt="" className="size-12 rounded-full object-cover" />
                  ) : (
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#dce9dd] font-semibold text-[#173f35]">{c.display_name?.[0] ?? '?'}</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold">{c.display_name}</p>
                        <p className="text-xs text-[#738078]">{c.email} · {c.city}</p>
                      </div>
                      <div className="flex gap-2">
                        {tab !== 'approved' && (
                          <button type="button" disabled={processing === c.id} onClick={() => decide(c, 'approve')}
                            className="flex items-center gap-1.5 rounded-full bg-[#edf4ed] px-3 py-1.5 text-xs font-semibold text-[#4e8068] disabled:opacity-60">
                            <CheckCircle2 className="size-3.5" /> Approve
                          </button>
                        )}
                        {tab !== 'rejected' && (
                          <button type="button" disabled={processing === c.id} onClick={() => setRejectModal(c)}
                            className="flex items-center gap-1.5 rounded-full bg-[#fff3ed] px-3 py-1.5 text-xs font-semibold text-[#c36d4d] disabled:opacity-60">
                            <XCircle className="size-3.5" /> {tab === 'approved' ? 'Remove' : 'Reject'}
                          </button>
                        )}
                      </div>
                    </div>
                    {c.bio && <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#68756e]">{c.bio}</p>}

                    <div className="mt-3 rounded-xl bg-[#f7f5f1] p-3">
                      {c.verification ? (
                        <>
                          <p className="text-xs font-semibold text-[#52645b]">
                            ID documents · {c.verification.status}
                            {c.verification.submitted_at ? ` · ${new Date(c.verification.submitted_at).toLocaleString()}` : ''}
                          </p>
                          <div className="mt-2 flex gap-3">
                            {[['ID', c.verification.id_document_url], ['Selfie', c.verification.selfie_url]].map(([label, url]) => (
                              url ? (
                                <button key={label} type="button" onClick={() => setPreview(url)} className="group text-left">
                                  <img src={url} alt={`${label} of ${c.display_name}`} className="h-20 w-28 rounded-lg border border-[#e9e2d9] object-cover group-hover:opacity-80" />
                                  <span className="mt-1 block text-[10px] font-medium text-[#738078]">{label}</span>
                                </button>
                              ) : (
                                <div key={label} className="flex h-20 w-28 items-center justify-center rounded-lg border border-dashed border-[#d9d2c8] text-[10px] text-[#9aa49d]">No {label}</div>
                              )
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="flex items-center gap-2 text-xs text-[#8a9490]"><FileImage className="size-4" /> No ID documents submitted yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreview(null)}>
          <img src={preview} alt="Verification document" className="max-h-[90vh] max-w-full rounded-xl" />
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#e9e2d9] bg-white p-6 shadow-xl">
            <h3 className="font-semibold text-[#173f35]">Reject companion</h3>
            <p className="mt-1 text-sm text-[#68756e]">The reason is shown to <strong>{rejectModal.display_name}</strong> and included in the email.</p>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3}
              placeholder="e.g. ID photo is blurry, please upload a clearer one"
              className="mt-4 w-full rounded-xl border border-[#e5e1da] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#bdd2c7]" />
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => { setRejectModal(null); setRejectReason('') }}
                className="flex-1 rounded-xl border border-[#e9e2d9] py-2.5 text-sm font-semibold text-[#68756e]">Cancel</button>
              <button type="button" disabled={processing === rejectModal.id} onClick={() => decide(rejectModal, 'reject', rejectReason || undefined)}
                className="flex-1 rounded-xl bg-[#c36d4d] py-2.5 text-sm font-semibold text-white disabled:opacity-60">Reject &amp; send email</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
