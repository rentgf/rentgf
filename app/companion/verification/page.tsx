'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Clock, ShieldCheck, Upload, XCircle } from 'lucide-react'
import { MobileShell } from '@/components/mobile-shell'
import { createClient } from '@/lib/supabase/client'

type Verification = {
  id: string
  status: string
  submitted_at: string | null
  rejection_reason: string | null
}

const STATUS_UI: Record<string, { label: string; text: string; Icon: typeof Clock; cls: string }> = {
  pending: { label: 'Under review', text: 'We usually review documents within 48 hours.', Icon: Clock, cls: 'bg-[#fff8ed] border-[#f0d9b5] text-[#8c5c2a]' },
  approved: { label: 'Verified', text: 'Your identity is verified.', Icon: CheckCircle2, cls: 'bg-[#edf4ee] border-[#cce3cc] text-[#4e8068]' },
  rejected: { label: 'Not approved', text: 'Please fix the issue below and submit again.', Icon: XCircle, cls: 'bg-[#fff3ed] border-[#f2cfc2] text-[#a04f39]' },
  suspended: { label: 'Suspended', text: 'Please contact support.', Icon: XCircle, cls: 'bg-[#fff3ed] border-[#f2cfc2] text-[#a04f39]' },
}

// Private bucket: only the owner (folder = their user id) and admins can read files.
const BUCKET = 'verification-docs'
const MAX_BYTES = 5 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

function FilePicker({ label, file, onChange }: { label: string; file: File | null; onChange: (f: File | null) => void }) {
  return (
    <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-[#d9d2c8] bg-[#fbfaf7] p-4 text-sm">
      <Upload className="size-5 shrink-0 text-[#c36d4d]" />
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{label}</span>
        <span className="block truncate text-xs text-[#8a9490]">{file ? file.name : 'JPG, PNG or WEBP, up to 5 MB'}</span>
      </span>
      <input type="file" accept={ACCEPTED.join(',')} className="sr-only" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
    </label>
  )
}

export default function CompanionVerificationPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [companionId, setCompanionId] = useState<string | null>(null)
  const [latest, setLatest] = useState<Verification | null>(null)
  const [loading, setLoading] = useState(true)
  const [idFile, setIdFile] = useState<File | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirectTo=/companion/verification'); return }
      setUserId(user.id)
      const { data: cp } = await supabase.from('companion_profiles').select('id').eq('profile_id', user.id).maybeSingle()
      if (!cp) { router.push('/become-companion'); return }
      setCompanionId(cp.id)
      const { data } = await supabase
        .from('companion_verification')
        .select('id, status, submitted_at, rejection_reason')
        .eq('companion_profile_id', cp.id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      setLatest(data)
      setLoading(false)
    }
    load()
  }, [router])

  function validate(f: File | null, name: string) {
    if (!f) return `Please choose your ${name}.`
    if (!ACCEPTED.includes(f.type)) return `${name} must be a JPG, PNG or WEBP image.`
    if (f.size > MAX_BYTES) return `${name} must be under 5 MB.`
    return null
  }

  async function upload(f: File, kind: string) {
    const supabase = createClient()
    const ext = f.name.split('.').pop() ?? 'jpg'
    const path = `${userId}/${kind}-${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, f, { contentType: f.type })
    if (upErr) throw upErr
    return path // stored as a storage path; admins open it via a signed URL
  }

  async function submit() {
    if (!companionId || !userId) return
    const problem = validate(idFile, 'ID photo') ?? validate(selfieFile, 'Selfie')
    if (problem) { setError(problem); return }
    setBusy(true)
    setError('')
    try {
      const [idPath, selfiePath] = await Promise.all([upload(idFile as File, 'id'), upload(selfieFile as File, 'selfie')])
      const supabase = createClient()
      const { data, error: insErr } = await supabase
        .from('companion_verification')
        .insert({ companion_profile_id: companionId, id_document_url: idPath, selfie_url: selfiePath, status: 'pending' })
        .select('id, status, submitted_at, rejection_reason')
        .single()
      if (insErr) throw insErr
      setLatest(data)
    } catch {
      setError('Upload failed. Please try again.')
    }
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
                <p className="mt-1 text-sm leading-6 text-[#68756e]">Upload a government ID photo and a clear selfie. Only our safety team can see these.</p>
              </div>
            </div>
            <FilePicker label="Government ID photo" file={idFile} onChange={setIdFile} />
            <FilePicker label="Selfie" file={selfieFile} onChange={setSelfieFile} />
            {error && <p className="mt-4 rounded-xl bg-[#fff3ed] px-4 py-3 text-sm text-[#a04f39]">{error}</p>}
            <button type="button" onClick={submit} disabled={busy}
              className="mt-5 w-full rounded-full bg-[#173f35] py-3 text-sm font-semibold text-white disabled:opacity-60">
              {busy ? 'Uploading…' : 'Submit for review'}
            </button>
          </section>
        )}

        <Link href="/companion" className="block text-center text-sm font-semibold text-[#c36d4d]">Back to companion dashboard</Link>
      </main>
    </MobileShell>
  )
}
