'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/logo'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleReset(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/change-password`,
    })
    if (resetError) {
      setError(resetError.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-[#e9e2d9] bg-white p-6 shadow-sm sm:p-8">
        <Logo className="w-fit" />
        <h1 className="mt-10 text-3xl font-semibold tracking-[-.04em] text-[#173f35]">Reset password</h1>
        <p className="mt-2 text-sm leading-6 text-[#68756e]">Enter your email and we will send you a reset link.</p>
        {sent ? (
          <div className="mt-8 rounded-2xl border border-[#cfe2d3] bg-[#f4faf4] p-5">
            <p className="font-semibold text-[#173f35]">Check your email</p>
            <p className="mt-1 text-sm leading-6 text-[#68756e]">We sent a password reset link to {email}.</p>
            <button onClick={() => router.push('/login')} className="mt-4 inline-flex rounded-xl bg-[#173f35] px-4 py-3 text-sm font-semibold text-white">Back to login</button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="mt-8 flex flex-col gap-4">
            <label className="text-sm font-medium">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-3 outline-none focus:ring-2 focus:ring-[#bdd2c7]"
              />
            </label>
            {error && <p className="rounded-xl bg-[#fff2ed] px-4 py-3 text-sm text-[#9e4f38]">{error}</p>}
            <button type="submit" disabled={loading} className="rounded-xl bg-[#173f35] px-4 py-3 font-semibold text-white disabled:opacity-60">
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}
        <p className="mt-6 text-sm text-[#68756e]"><Link href="/login" className="font-semibold text-[#c36d4d]">Back to login</Link></p>
      </div>
    </main>
  )
}
