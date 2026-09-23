'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Clock, ShieldCheck, XCircle } from 'lucide-react'
import { MobileShell } from '@/components/mobile-shell'
import { createClient } from '@/lib/supabase/client'

type Verification = {
  id: string
  status: string
  submitted_at: string | null
  rejection_reason: string | null
  id_document_url: string | null
  selfie_url: string | null
}

const STATUS_UI: Record<string, { label: string; text: string; Icon: typeof Clock; cls: string }> = {
  pending: { label: 'Under review', text: 'We usually review documents within 48 hours.', Icon: Clock, cls: 'bg-[#fff8ed] border-[#f0d9b5] text-[#8c5c2a]' },
  approved: { label: 'Verified', text: 'Your identity is verified.', Icon: CheckCircle2, cls: 'bg-[#edf4ee] border-[#cce3cc] text-[#4e8068]' },
  rejected: { label: 'Not approved', text: 'Please fix the issue below and submit again.', Icon: XCircle, cls: 'bg-[#fff3ed] border-[#f2cfc2] text-[#a04f39]' },
  suspended: { label: 'Suspended', text: 'Please contact support.', Icon: XCircle, cls: 'bg-[#fff3ed] border-[#f2cfc2] text-[#a04f39]' },
}

const isUrl = (s: string) => /^https:\/\/\S+$/.test(s.trim())

export default function CompanionVerificationPage() {
  const router = useRouter()
  const [companionId, setCompanionId] = useState<string | null>(null)
  const [latest, setLatest] = useState<Verification | null>(null)
  const [loading, setLoading] = useState(true)
  const [idUrl, setIdUrl] = useState('')
  const [selfieUrl, setSelfieUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirectTo=/companion/verification'); return }
      const { data: cp } = await supabase.from('companion_profiles').select('id').eq('profile_id', user.id).maybeSingle()
      if (!cp) { router.push('/become-companion'); return }
      setCompanionId(cp.id)
      const { data } = await supabase
        .from('companion_verification')
        .select('id, status, submitted_at, rejection_reason, id_document_url, selfie_url')
        .eq('companion_profile_id', cp.id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      setLatest(data)
      setLoading(false)
    }
    load()
  }, [router])

  async function submit() {
    if (!companionId) return
    if (!isUrl(idUrl) || !isUrl(selfieUrl)) { setError('Enter valid https:// links for both images.'); return }
    setBusy(true)
    setError('')
    const supabase = createClient()
    const { data, error: insErr } = await supabase
      .from('companion_verification')
      .insert({ companion_profile_id: companionId, id_document_url: idUrl.trim(), selfie_url: selfieUrl.trim(), status: 'pending' })
      .select('id, status, submitted_at, rejection_reason, id_document_url, selfie_url')
      .single()
    if (insErr) setError('Could not submit. Please try again.')
    else setLatest(data)
    setBusy(false)
  }

  if (loading) return <MobileShell title="Verification"><div className="mx-auto max-w-xl animate-pulse px-4 py-8"><div className="h-40 rounded-2xl bg-[#e9e2d9]" /></div></MobileShell>

  const ui = latest ? STATUS_UI[latest.status] ?? STATUS_UI.pending : null
  const canSubmit = !latest || latest.status === 'rejected'

  return (
    <MobileShell title="Verification" showBack>
      <main className="mx-auto max-w-xl space-y-4 px-4 py-6">
        {ui && latest && (
          <div className={`flex items-start gap-3 rounded-2xl border p-4 ${ui.cls}`}>
            <ui.Icon className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">{ui.label}</p>
              <p className="mt-1 text-sm">{ui.text}</p>
              {latest.rejection_reason && <p className="mt-2 text-sm">Reason: {latest.rejection_reason}</p>}
              {latest.submitted_at && <p className="mt-2 text-xs opacity-80">Submitted {new Date(latest.submitted_at).toLocaleString()}</p>}
            </div>
          </div>
        )}

        {canSubmit && (
          <section className="rounded-[22px] border border-[#e9e2d9] bg-white p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 text-[#4e8068]" />
              <div>
                <h2 className="font-semibold">Verify your identity</h2>
                <p className="mt-1 text-sm leading-6 text-[#68756e]">Share a government ID photo and a clear selfie. Only our safety team can see these.</p>
              </div>
            </div>
            <label className="mt-5 block text-sm font-medium">
              Government ID image link
              <input value={idUrl} onChange={(e) => setIdUrl(e.target.value)} placeholder="https://..."
                className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#bdd2c7]" />
            </label>
            <label className="mt-4 block text-sm font-medium">
              Selfie image link
              <input value={selfieUrl} onChange={(e) => setSelfieUrl(e.target.value)} placeholder="https://..."
                className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#bdd2c7]" />
            </label>
            {error && <p className="mt-4 rounded-xl bg-[#fff3ed] px-4 py-3 text-sm text-[#a04f39]">{error}</p>}
            <button type="button" onClick={submit} disabled={busy}
              className="mt-5 w-full rounded-full bg-[#173f35] py-3 text-sm font-semibold text-white disabled:opacity-60">
              {busy ? 'Submitting…' : 'Submit for review'}
            </button>
          </section>
        )}

        <Link href="/companion" className="block text-center text-sm font-semibold text-[#c36d4d]">Back to companion dashboard</Link>
      </main>
    </MobileShell>
  )
}
