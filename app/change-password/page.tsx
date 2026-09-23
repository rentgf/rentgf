'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/logo'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleChange(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError(updateError.message)
    } else {
      setDone(true)
    }
    setLoading(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-[#e9e2d9] bg-white p-6 shadow-sm sm:p-8">
        <Logo className="w-fit" />
        <h1 className="mt-10 text-3xl font-semibold tracking-[-.04em] text-[#173f35]">New password</h1>
        {done ? (
          <div className="mt-8">
            <CheckCircle2 className="size-9 text-[#4e8068]" />
            <p className="mt-4 font-semibold">Password updated</p>
            <button onClick={() => router.push('/login')} className="mt-4 inline-flex rounded-xl bg-[#173f35] px-5 py-3 text-sm font-semibold text-white">Go to login</button>
          </div>
        ) : (
          <form onSubmit={handleChange} className="mt-8 flex flex-col gap-4">
            <label className="text-sm font-medium">
              New password
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-3 outline-none focus:ring-2 focus:ring-[#bdd2c7]"
              />
            </label>
            {error && <p className="rounded-xl bg-[#fff2ed] px-4 py-3 text-sm text-[#9e4f38]">{error}</p>}
            <button type="submit" disabled={loading} className="rounded-xl bg-[#173f35] px-4 py-3 font-semibold text-white disabled:opacity-60">
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
