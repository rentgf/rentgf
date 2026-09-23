'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { upsertProfile } from '@/lib/supabase/auth-helpers'
import { Logo } from '@/components/logo'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }
    if (data.user) {
      await upsertProfile(data.user.id, data.user.email, data.user.user_metadata?.display_name)
    }
    const params = new URLSearchParams(window.location.search)
    router.push(params.get('redirectTo') ?? '/dashboard')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-[#e9e2d9] bg-white p-6 shadow-sm sm:p-8">
        <Logo className="w-fit" />
        <h1 className="mt-10 text-3xl font-semibold tracking-[-.04em] text-[#173f35]">Welcome back</h1>
        <p className="mt-2 text-sm leading-6 text-[#68756e]">Sign in to your RentGF account.</p>
        <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-4">
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
          <label className="text-sm font-medium">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-3 outline-none focus:ring-2 focus:ring-[#bdd2c7]"
            />
          </label>
          {error && (
            <p className="rounded-xl bg-[#fff2ed] px-4 py-3 text-sm text-[#9e4f38]" role="alert">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[#173f35] px-4 py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <div className="mt-6 flex justify-between text-sm">
          <Link href="/forgot-password" className="text-[#68756e]">Forgot password?</Link>
          <Link href="/register" className="font-semibold text-[#c36d4d]">Create account</Link>
        </div>
        <p className="mt-5 text-center text-sm text-[#68756e]">
          Want to earn as a companion?{' '}
          <Link href="/earn-as-companion" className="font-semibold text-[#c36d4d]">Register here</Link>
        </p>
      </div>
    </main>
  )
}
