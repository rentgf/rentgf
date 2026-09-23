'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CheckCircle2, HeartHandshake, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react'
import { Logo } from '@/components/logo'
import { createClient } from '@/lib/supabase/client'

type Step = 'form' | 'otp' | 'created'

type ApiResponse = { error?: string; ok?: boolean }

function isAtLeastEighteen(dateOfBirth: string) {
  if (!dateOfBirth) return false
  const birthDate = new Date(`${dateOfBirth}T00:00:00`)
  if (Number.isNaN(birthDate.getTime())) return false
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const birthdayHasPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate())
  if (!birthdayHasPassed) age -= 1
  return age >= 18
}

export default function EarnAsCompanionPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('form')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dob, setDob] = useState('')
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [otp, setOtp] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function startResendCooldown() {
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown((remaining) => {
        if (remaining <= 1) {
          clearInterval(interval)
          return 0
        }
        return remaining - 1
      })
    }, 1000)
  }

  async function sendCode() {
    const response = await fetch('/api/email/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), name: displayName.trim() }),
    })
    const result = (await response.json()) as ApiResponse
    if (!response.ok || !result.ok) throw new Error(result.error ?? 'Could not send the verification code. Please try again.')
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!isAtLeastEighteen(dob) || !ageConfirmed) {
      setError('Companion applications are for people aged 18 or older. Please confirm your age and check your date of birth.')
      return
    }

    setLoading(true)
    try {
      await sendCode()
      setStep('otp')
      startResendCooldown()
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : 'Could not send the verification code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const verifyResponse = await fetch('/api/email/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp }),
      })
      const verifyResult = (await verifyResponse.json()) as ApiResponse
      if (!verifyResponse.ok || !verifyResult.ok) {
        throw new Error(verifyResult.error ?? 'The code could not be verified. Please try again.')
      }

      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            display_name: displayName.trim(),
            date_of_birth: dob,
            signup_intent: 'companion',
          },
          emailRedirectTo: `${window.location.origin}/login?redirectTo=/become-companion`,
        },
      })
      if (signUpError) throw signUpError
      if (!data.user) throw new Error('We could not create your account. Please try again.')

      if (data.session) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          email: email.trim().toLowerCase(),
          full_name: displayName.trim(),
          display_name: displayName.trim(),
          date_of_birth: dob,
          age_confirmed: true,
          role: 'customer',
          account_status: 'active',
          access_granted: false,
        }, { onConflict: 'id' })
        if (profileError) console.error('Companion signup profile error:', profileError.message)
      }

      setStep('created')
    } catch (verificationError) {
      setError(verificationError instanceof Error ? verificationError.message : 'We could not finish registration. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResendCode() {
    setError('')
    setLoading(true)
    try {
      await sendCode()
      startResendCooldown()
    } catch (resendError) {
      setError(resendError instanceof Error ? resendError.message : 'Could not resend the verification code.')
    } finally {
      setLoading(false)
    }
  }

  async function continueToApplication() {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      router.push('/become-companion')
      return
    }
    router.push('/login?redirectTo=/become-companion')
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-[#173f35] sm:py-12">
      <div className="mx-auto max-w-xl">
        <header className="flex items-center justify-between">
          <Logo />
          <Link href="/" className="text-sm font-medium text-[#68756e] hover:text-[#173f35]">Back to RentGF</Link>
        </header>

        <section className="mt-10 rounded-[28px] border border-[#e9e2d9] bg-white p-6 shadow-[0_16px_50px_rgba(23,63,53,.06)] sm:p-9">
          {step === 'created' ? (
            <div className="py-4 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#edf4ee]">
                <CheckCircle2 className="size-7 text-[#4e8068]" />
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[.18em] text-[#c36d4d]">Companion registration</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em]">Your account is ready</h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#68756e]">
                Next, complete your companion profile and application. It will be reviewed before your profile appears to customers.
              </p>
              <button type="button" onClick={continueToApplication} className="mt-7 w-full rounded-full bg-[#173f35] px-5 py-4 font-semibold text-white transition hover:bg-[#245447]">
                Continue to companion application
              </button>
              <p className="mt-4 text-xs text-[#8a958e]">Your booking requests and companion studio are separate from customer booking activity.</p>
            </div>
          ) : step === 'otp' ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#c36d4d]">Email verification</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Check your inbox</h1>
              <p className="mt-2 text-sm leading-6 text-[#68756e]">
                Enter the 6-digit code sent to <span className="font-semibold text-[#173f35]">{email}</span> to create your companion account.
              </p>
              <form onSubmit={handleVerify} className="mt-7 flex flex-col gap-4">
                <label className="text-sm font-medium">
                  Verification code
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    autoFocus
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-3 text-center text-2xl font-bold tracking-[.2em] outline-none focus:ring-2 focus:ring-[#bdd2c7]"
                  />
                </label>
                {error && <p role="alert" className="rounded-xl bg-[#fff2ed] px-4 py-3 text-sm text-[#9e4f38]">{error}</p>}
                <button type="submit" disabled={loading || otp.length !== 6} className="rounded-full bg-[#173f35] px-5 py-4 font-semibold text-white disabled:opacity-60">
                  {loading ? 'Verifying…' : 'Verify and create companion account'}
                </button>
              </form>
              <div className="mt-5 flex items-center justify-between text-sm text-[#68756e]">
                <button type="button" onClick={() => { setStep('form'); setOtp(''); setError('') }} className="hover:text-[#173f35]">Change details</button>
                {resendCooldown > 0 ? (
                  <span className="text-[#9aa49d]">Resend in {resendCooldown}s</span>
                ) : (
                  <button type="button" disabled={loading} onClick={handleResendCode} className="flex items-center gap-1.5 font-semibold text-[#c36d4d] disabled:opacity-60">
                    <RefreshCw className="size-3.5" /> Resend code
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#edf4ee]">
                <HeartHandshake className="size-6 text-[#4e8068]" />
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[.18em] text-[#c36d4d]">A separate path to earning</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">Earn as a companion</h1>
              <p className="mt-3 text-sm leading-6 text-[#68756e]">
                Create your companion account here, then submit a profile for review. Customer sign-up and customer bookings stay separate.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#f5f3ef] p-4">
                  <ShieldCheck className="size-5 text-[#4e8068]" />
                  <p className="mt-3 text-sm font-semibold">Reviewed before going live</p>
                  <p className="mt-1 text-xs leading-5 text-[#68756e]">Your companion profile goes through a separate review.</p>
                </div>
                <div className="rounded-2xl bg-[#f5f3ef] p-4">
                  <Sparkles className="size-5 text-[#c36d4d]" />
                  <p className="mt-3 text-sm font-semibold">Your own companion space</p>
                  <p className="mt-1 text-xs leading-5 text-[#68756e]">Manage requests and companion activity in your studio.</p>
                </div>
              </div>

              <form onSubmit={handleRegister} className="mt-7 flex flex-col gap-4">
                <label className="text-sm font-medium">
                  Name for your account
                  <input required maxLength={80} value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="e.g. Priya S." className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-3 outline-none focus:ring-2 focus:ring-[#bdd2c7]" />
                </label>
                <label className="text-sm font-medium">
                  Email
                  <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-3 outline-none focus:ring-2 focus:ring-[#bdd2c7]" />
                </label>
                <label className="text-sm font-medium">
                  Password
                  <input type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-3 outline-none focus:ring-2 focus:ring-[#bdd2c7]" />
                  <span className="mt-1 block text-xs text-[#8a958e]">Use at least 8 characters.</span>
                </label>
                <label className="text-sm font-medium">
                  Date of birth
                  <input type="date" required value={dob} onChange={(event) => setDob(event.target.value)} className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-3 outline-none focus:ring-2 focus:ring-[#bdd2c7]" />
                </label>
                <label className="flex items-start gap-3 text-sm leading-5 text-[#68756e]">
                  <input type="checkbox" checked={ageConfirmed} onChange={(event) => setAgeConfirmed(event.target.checked)} className="mt-1" />
                  <span>I confirm that I am 18 or older and agree to the <Link href="/terms" className="underline hover:text-[#173f35]">Terms of Service</Link> and <Link href="/privacy-policy" className="underline hover:text-[#173f35]">Privacy Policy</Link>.</span>
                </label>
                {error && <p role="alert" className="rounded-xl bg-[#fff2ed] px-4 py-3 text-sm text-[#9e4f38]">{error}</p>}
                <button type="submit" disabled={loading} className="rounded-full bg-[#173f35] px-5 py-4 font-semibold text-white transition hover:bg-[#245447] disabled:opacity-60">
                  {loading ? 'Sending verification code…' : 'Create companion account'}
                </button>
              </form>
              <p className="mt-5 text-center text-sm text-[#68756e]">
                Already have an account? <Link href="/login?redirectTo=/become-companion" className="font-semibold text-[#c36d4d]">Sign in to apply</Link>
              </p>
              <p className="mt-3 text-center text-xs text-[#8a958e]">
                Looking to book a companion instead? <Link href="/register" className="font-semibold text-[#c36d4d]">Customer sign-up</Link>
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
