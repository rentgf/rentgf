'use client'

import { useEffect, useState } from 'react'
import { Percent, ShieldCheck } from 'lucide-react'

export default function AdminSettingsPage() {
  const [commission, setCommission] = useState('')
  const [saved, setSaved] = useState<number | null>(null)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/aryanbloch/settings')
      .then((r) => r.json() as Promise<{ commissionPercent?: number; error?: string }>)
      .then((d) => {
        if (typeof d.commissionPercent === 'number') { setCommission(String(d.commissionPercent)); setSaved(d.commissionPercent) }
        else setError(d.error ?? 'Could not load settings')
      })
      .catch(() => setError('Could not load settings'))
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const n = Number(commission)
    if (commission === '' || !Number.isFinite(n) || n < 0 || n > 100) { setError('Enter a number between 0 and 100'); return }
    setStatus('saving'); setError('')
    const res = await fetch('/api/aryanbloch/settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ commissionPercent: n }),
    })
    const d = (await res.json()) as { commissionPercent?: number; error?: string }
    if (res.ok && typeof d.commissionPercent === 'number') { setSaved(d.commissionPercent); setStatus('saved') }
    else { setError(d.error ?? 'Save failed'); setStatus('error') }
  }

  const preview = Number(commission)
  const valid = Number.isFinite(preview) && preview >= 0 && preview <= 100

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-[#173f35]">Settings</h1>
      <p className="mt-1 text-sm text-[#68756e]">Admin panel configuration.</p>

      <form onSubmit={save} className="mt-6 rounded-2xl border border-[#e9e2d9] bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-[#edf4ed]">
            <Percent className="size-4 text-[#4e8068]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#173f35]">Platform fee on bookings</p>
            <p className="text-sm text-[#68756e]">Percentage kept by RentGF from every companion booking. Applies to new bookings.</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-xl border border-[#e9e2d9] bg-[#fbfaf7] pr-3">
            <input
              type="number" min={0} max={100} step="0.5" value={commission}
              onChange={(e) => { setCommission(e.target.value); setStatus('idle') }}
              className="w-24 bg-transparent p-3 text-sm outline-none" aria-label="Platform fee percent"
            />
            <span className="text-sm text-[#68756e]">%</span>
          </div>
          <button type="submit" disabled={status === 'saving'}
            className="cursor-pointer rounded-full bg-[#173f35] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {status === 'saving' ? 'Saving…' : 'Save'}
          </button>
          {status === 'saved' && <span className="text-sm text-[#4e8068]">Saved</span>}
        </div>
        {valid && (
          <p className="mt-3 text-xs text-[#738078]">
            Example: on a ₹1,000 booking, RentGF keeps ₹{Math.round(10 * preview)} and the companion gets ₹{1000 - Math.round(10 * preview)}.
            {saved !== null && ` Current saved value: ${saved}%.`}
          </p>
        )}
        {error && <p className="mt-3 rounded-xl bg-[#fff3ed] px-4 py-2 text-sm text-[#a04f39]">{error}</p>}
      </form>

      <div className="mt-4 rounded-2xl border border-[#e9e2d9] bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-[#edf4ed]">
            <ShieldCheck className="size-4 text-[#4e8068]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#173f35]">Admin access</p>
            <p className="text-sm text-[#68756e]">The admin panel password is managed via the <code className="font-mono">ADMIN_PASSWORD</code> environment variable in your hosting provider settings.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
