'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dob, setDob] = useState('')
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState(false)

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault()
    if (!ageConfirmed) { setError('Please confirm you are 18 or older.'); return }
    // Check age from date of birth
    const birthDate = new Date(dob)
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    if (age < 18) { setError('You must be 18 or older to join RentGF.'); return }

    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName, date_of_birth: dob },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Create profile row
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        full_name: displayName,
        display_name: displayName,
        date_of_birth: dob,
        age_confirmed: true,
        role: 'customer',
        account_status: 'active',
        access_granted: false,
      }, { onConflict: 'id' })
    }
    setCreated(true)
    setLoading(false)
  }

  if (created) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-[#cfe2d3] bg-[#f4faf4] p-8">
          <CheckCircle2 className="size-9 text-[#4e8068]" />
          <h1 className="mt-4 text-2xl font-semibold text-[#173f35]">Account created!</h1>
          <p className="mt-2 text-sm leading-6 text-[#52665a]">Check your email to confirm your address, then sign in to start exploring companions.</p>
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="mt-6 inline-flex rounded-xl bg-[#173f35] px-5 py-3 text-sm font-semibold text-white"
          >
            Go to login
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-[#e9e2d9] bg-white p-6 shadow-sm sm:p-8">
        <Link href="/" className="text-lg font-semibold text-[#173f35]">rent<span className="text-[#d17b58]">gf</span></Link>
        <h1 className="mt-10 text-3xl font-semibold tracking-[-.04em] text-[#173f35]">Create your account</h1>
        <p className="mt-2 text-sm leading-6 text-[#68756e]">Join adults 18+ seeking lawful, non-sexual companionship.</p>
        <form onSubmit={handleRegister} className="mt-8 flex flex-col gap-4">
          <label className="text-sm font-medium">
            Display name
            <input
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How you want to be known"
              className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-3 outline-none focus:ring-2 focus:ring-[#bdd2c7]"
            />
          </label>
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
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-3 outline-none focus:ring-2 focus:ring-[#bdd2c7]"
            />
          </label>
          <label className="text-sm font-medium">
            Date of birth
            <input
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-3 outline-none focus:ring-2 focus:ring-[#bdd2c7]"
            />
          </label>
          <label className="flex gap-3 text-sm text-[#68756e]">
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={(e) => setAgeConfirmed(e.target.checked)}
              className="mt-1"
            />
            I confirm I am 18 or older and agree to the non-sexual companionship policy.
          </label>
          {error && (
            <p className="rounded-xl bg-[#fff2ed] px-4 py-3 text-sm text-[#9e4f38]" role="alert">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[#173f35] px-4 py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-sm text-[#68756e]">Already have an account? <Link href="/login" className="font-semibold text-[#c36d4d]">Log in</Link></p>
      </div>
    </main>
  )
}
