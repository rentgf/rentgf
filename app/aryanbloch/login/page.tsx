'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/logo'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/aryanbloch/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    const data = await res.json() as { success?: boolean; error?: string }

    if (data.success) {
      router.push('/aryanbloch')
    } else {
      setError(data.error ?? 'Wrong password')
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f3ef] px-4">
      <div className="w-full max-w-sm rounded-3xl border border-[#e9e2d9] bg-white p-8 shadow-sm">
        <div className="flex items-center gap-2">
          <Logo className="w-fit" />
          <span className="rounded-full bg-[#edf4ed] px-2 py-0.5 text-xs font-semibold text-[#4e8068]">Admin</span>
        </div>
        <h1 className="mt-8 text-2xl font-semibold tracking-[-0.03em] text-[#173f35]">Sign in</h1>
        <p className="mt-1 text-sm text-[#68756e]">Enter your admin password to continue.</p>

        <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
          <label className="text-sm font-medium">
            Password
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-3 outline-none focus:ring-2 focus:ring-[#bdd2c7]"
            />
          </label>
          {error && (
            <p className="rounded-xl bg-[#fff2ed] px-4 py-3 text-sm text-[#9e4f38]">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[#173f35] px-4 py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  )
}
