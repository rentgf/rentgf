'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-react'

export default function ChangePasswordPage() {
  const [show, setShow] = useState(false)
  const [updated, setUpdated] = useState(false)
  const [error, setError] = useState('')
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const next = String(data.get('newPassword') || '')
    const confirm = String(data.get('confirmPassword') || '')
    if (next.length < 8) return setError('Use at least 8 characters for your new password.')
    if (next !== confirm) return setError('New password and confirmation do not match.')
    setError('')
    setUpdated(true)
    event.currentTarget.reset()
  }
  return <main className="min-h-screen bg-[#fbfaf7] px-4 py-5 text-[#173f35]"><Link href="/profile" className="inline-flex items-center gap-2 text-sm text-[#68756e]"><ArrowLeft className="size-4" /> Back to profile</Link><section className="mx-auto max-w-md py-10"><div className="flex size-12 items-center justify-center rounded-2xl bg-[#edf4ee]"><KeyRound className="size-6 text-[#4e8068]" /></div><h1 className="mt-5 text-3xl font-semibold tracking-[-.05em]">Change password</h1><p className="mt-2 text-sm leading-6 text-[#68756e]">Choose a strong password with at least 8 characters.</p>{updated ? <div className="mt-7 rounded-2xl border border-[#cfe2d3] bg-[#f4faf4] p-5"><CheckCircle2 className="size-6 text-[#4e8068]" /><p className="mt-3 font-semibold">Password updated in preview</p><p className="mt-1 text-sm leading-6 text-[#68756e]">Authentication is not connected yet, so this is a test confirmation only.</p></div> : <form onSubmit={submit} className="mt-7 space-y-4 rounded-3xl border border-[#e9e2d9] bg-white p-5"><label className="block text-sm font-medium">Current password<input name="currentPassword" type={show ? 'text' : 'password'} required className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-3 outline-none focus:ring-2 focus:ring-[#bdd2c7]" /></label><label className="block text-sm font-medium">New password<input name="newPassword" type={show ? 'text' : 'password'} required className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-3 outline-none focus:ring-2 focus:ring-[#bdd2c7]" /></label><label className="block text-sm font-medium">Confirm new password<input name="confirmPassword" type={show ? 'text' : 'password'} required className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-3 outline-none focus:ring-2 focus:ring-[#bdd2c7]" /></label><button type="button" onClick={() => setShow(!show)} className="inline-flex items-center gap-2 text-sm font-semibold text-[#4e8068]">{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}{show ? 'Hide passwords' : 'Show passwords'}</button>{error && <p role="alert" className="rounded-xl bg-[#fff3ed] px-3 py-2 text-sm text-[#a04f39]">{error}</p>}<button type="submit" className="w-full rounded-xl bg-[#173f35] px-4 py-3 font-semibold text-white">Update password</button></form>}</section></main>
}
