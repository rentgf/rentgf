'use client'

import { useState } from 'react'
import { Ban, Flag, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  { value: 'harassment', label: 'Harassment' },
  { value: 'fraud_scam', label: 'Fraud or scam' },
  { value: 'safety_concern', label: 'Safety concern' },
  { value: 'fake_profile', label: 'Fake profile' },
  { value: 'prohibited_activity', label: 'Prohibited activity' },
  { value: 'other', label: 'Other' },
] as const

type Props = {
  companionId: string // companion_profiles.id
  companionProfileId: string // profiles.id of the companion (for blocks)
  name: string
}

export function ReportBlockActions({ companionId, companionProfileId, name }: Props) {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<string>('harassment')
  const [description, setDescription] = useState('')
  const [alsoBlock, setAlsoBlock] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function getUserId() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = `/login?redirectTo=/companions/${companionId}`; return null }
    return { supabase, userId: user.id }
  }

  async function block() {
    const ctx = await getUserId()
    if (!ctx) return false
    const { error } = await ctx.supabase.from('blocks').upsert(
      { blocker_id: ctx.userId, blocked_id: companionProfileId, reason: 'Blocked from profile' },
      { onConflict: 'blocker_id,blocked_id', ignoreDuplicates: true },
    )
    return !error
  }

  async function submitReport() {
    setBusy(true)
    setMsg('')
    const ctx = await getUserId()
    if (!ctx) { setBusy(false); return }
    const { error } = await ctx.supabase.from('reports').insert({
      reporter_id: ctx.userId,
      reported_user_id: companionProfileId,
      reported_companion_id: companionId,
      report_type: 'companion',
      category,
      description: description.trim() || null,
    })
    if (error) { setMsg('Could not send report. Please try again.'); setBusy(false); return }
    if (alsoBlock) await block()
    setMsg('Thanks. Our safety team will review this report.')
    setBusy(false)
    setTimeout(() => { setOpen(false); setMsg(''); setDescription('') }, 1800)
  }

  async function blockOnly() {
    setBusy(true)
    const ok = await block()
    setBusy(false)
    if (ok) window.location.href = '/discover'
    else setMsg('Could not block. Please try again.')
  }

  return (
    <>
      <div className="mt-8 flex justify-center gap-6 text-xs font-semibold text-[#9aa49d]">
        <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-1.5 hover:text-[#a04f39]">
          <Flag className="size-3.5" /> Report
        </button>
        <button type="button" onClick={blockOnly} disabled={busy} className="flex items-center gap-1.5 hover:text-[#a04f39]">
          <Ban className="size-3.5" /> Block {name}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-t-[24px] bg-white p-5 sm:rounded-[24px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Report {name}</h2>
              <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="rounded-full p-1.5 hover:bg-[#f5f3ef]"><X className="size-5" /></button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c.value} type="button" onClick={() => setCategory(c.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${category === c.value ? 'bg-[#173f35] text-white' : 'border border-[#e5e1da] text-[#52645b]'}`}>
                  {c.label}
                </button>
              ))}
            </div>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000}
              placeholder="What happened? (optional)"
              className="mt-4 min-h-24 w-full resize-none rounded-xl border border-[#e5e1da] p-3 text-sm outline-none focus:ring-2 focus:ring-[#bdd2c7]" />
            <label className="mt-3 flex items-center gap-2 text-sm text-[#52645b]">
              <input type="checkbox" checked={alsoBlock} onChange={(e) => setAlsoBlock(e.target.checked)} /> Also block this person
            </label>
            {msg && <p className="mt-3 rounded-xl bg-[#f5f8f3] px-4 py-3 text-sm text-[#4e8068]">{msg}</p>}
            <button type="button" onClick={submitReport} disabled={busy}
              className="mt-4 w-full rounded-full bg-[#a04f39] py-3 text-sm font-semibold text-white disabled:opacity-60">
              {busy ? 'Sending…' : 'Send report'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
