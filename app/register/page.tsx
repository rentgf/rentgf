'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Step = 'form' | 'otp' | 'done'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('form')

  // Form fields
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dob, setDob] = useState('')
  const [ageConfirmed, setAgeConfirmed] = useState(false)

  // OTP
  const [otp, setOtp] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ── Step 1: form submit → send OTP ──────────────────────────────────────
  async function handleRegister(event: React.FormEvent) {
    event.preventDefault()
    if (!ageConfirmed) { setError('Please confirm you are 18 or older.'); return }
    const birthDate = new Date(dob)
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    if (age < 18) { setError('You must be 18 or older to join RentGF.'); return }

    setLoading(true)
    setError('')
    const res = await fetch('/api/email/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name: displayName }),
    })
    const json = await res.json() as { error?: string; ok?: boolean }
    setLoading(false)
    if (!res.ok || !json.ok) { setError(json.error ?? 'Failed to send code. Try again.'); return }
    setStep('otp')
    startResendCooldown()
  }

  // ── Step 2: OTP verify → create account ─────────────────────────────────
  async function handleVerify(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')

    // Verify OTP
    const verifyRes = await fetch('/api/email/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    })
    const verifyJson = await verifyRes.json() as { error?: string; ok?: boolean }
    if (!verifyRes.ok || !verifyJson.ok) {
      setError(verifyJson.error ?? 'Invalid code.')
      setLoading(false)
      return
    }

    // Create Supabase account
    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName, date_of_birth: dob },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })
    if (authError) { setError(authError.message); setLoading(false); return }

    if (data.user) {
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

    setLoading(false)
    setStep('done')
  }

  async function handleResendOtp() {
    setError('')
    const res = await fetch('/api/email/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name: displayName }),
    })
    const json = await res.json() as { error?: string; ok?: boolean }
    if (!res.ok || !json.ok) { setError(json.error ?? 'Failed to resend code.'); return }
    startResendCooldown()
  }

  function startResendCooldown() {
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  // ── Done screen ──────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-[#cfe2d3] bg-[#f4faf4] p-8">
          <CheckCircle2 className="size-9 text-[#4e8068]" />
          <h1 className="mt-4 text-2xl font-semibold text-[#173f35]">Account created!</h1>
          <p className="mt-2 text-sm leading-6 text-[#52665a]">
            Your email is verified. You can now sign in to start exploring companions.
          </p>
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

  // ── OTP screen ───────────────────────────────────────────────────────────
  if (step === 'otp') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-[#e9e2d9] bg-white p-6 shadow-sm sm:p-8">
          <Link href="/" className="text-lg font-semibold text-[#173f35]">
            rent<span className="text-[#d17b58]">gf</span>
          </Link>
          <h1 className="mt-10 text-3xl font-semibold tracking-[-.04em] text-[#173f35]">Check your email</h1>
          <p className="mt-2 text-sm leading-6 text-[#68756e]">
            We sent a 6-digit code to <span className="font-semibold text-[#173f35]">{email}</span>. Enter it below to verify your account.
          </p>

          <form onSubmit={handleVerify} className="mt-8 flex flex-col gap-4">
            <label className="text-sm font-medium">
              Verification code
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-3 text-center text-2xl font-bold tracking-[0.2em] outline-none focus:ring-2 focus:ring-[#bdd2c7]"
                autoFocus
              />
            </label>
            {error && (
              <p className="rounded-xl bg-[#fff2ed] px-4 py-3 text-sm text-[#9e4f38]" role="alert">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="rounded-xl bg-[#173f35] px-4 py-3 font-semibold text-white disabled:opacity-60"
            >
              {loading ? 'Verifying…' : 'Verify email'}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm text-[#68756e]">
            <button
              type="button"
              onClick={() => { setStep('form'); setOtp(''); setError('') }}
              className="hover:text-[#173f35]"
            >
              ← Change email
            </button>
            {resendCooldown > 0 ? (
              <span className="text-[#9aa49d]">Resend in {resendCooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                className="flex items-center gap-1.5 font-semibold text-[#c36d4d] hover:text-[#a85a3b]"
              >
                <RefreshCw className="size-3.5" /> Resend code
              </button>
            )}
          </div>
        </div>
      </main>
    )
  }

  // ── Registration form ────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-[#e9e2d9] bg-white p-6 shadow-sm sm:p-8">
          <Link href="/" className="text-lg font-semibold text-[#173f35]">
            rent<span className="text-[#d17b58]">gf</span>
          </Link>
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
              I confirm I am 18 or older and agree to the{' '}
              <Link href="/terms" className="underline hover:text-[#173f35]">Terms of Service</Link>{' '}and{' '}
              <Link href="/privacy-policy" className="underline hover:text-[#173f35]">Privacy Policy</Link>.
            </label>
            {error && (
              <p className="rounded-xl bg-[#fff2ed] px-4 py-3 text-sm text-[#9e4f38]" role="alert">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#173f35] px-4 py-3 font-semibold text-white disabled:opacity-60"
            >
              {loading ? 'Sending code…' : 'Continue'}
            </button>
          </form>
          <p className="mt-6 text-sm text-[#68756e]">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#c36d4d]">Log in</Link>
          </p>
        </div>
        <div className="mt-6 flex justify-center gap-5 text-xs text-[#9aa49d]">
          <Link href="/terms" className="hover:text-[#173f35]">Terms of Service</Link>
          <Link href="/privacy-policy" className="hover:text-[#173f35]">Privacy Policy</Link>
          <Link href="/contact" className="hover:text-[#173f35]">Contact</Link>
        </div>
      </div>
    </main>
  )
}
