'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  return <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-4 py-10"><div className="w-full max-w-md rounded-3xl border border-[#e9e2d9] bg-white p-6 shadow-sm sm:p-8"><Link href="/login" className="inline-flex items-center gap-2 text-sm text-[#68756e]"><ArrowLeft className="size-4" /> Back to login</Link><div className="mt-10 flex size-12 items-center justify-center rounded-2xl bg-[#edf4ee]"><Mail className="size-6 text-[#4e8068]" /></div><h1 className="mt-5 text-3xl font-semibold tracking-[-.04em] text-[#173f35]">Forgot password?</h1><p className="mt-2 text-sm leading-6 text-[#68756e]">Enter your email and we will show the next step when email service is connected.</p>{submitted ? <div className="mt-7 rounded-2xl border border-[#cfe2d3] bg-[#f4faf4] p-5"><CheckCircle2 className="size-6 text-[#4e8068]" /><p className="mt-3 font-semibold">Reset link requested in preview</p><p className="mt-1 text-sm leading-6 text-[#68756e]">No email was sent. Connect authentication and email services to enable real resets.</p></div> : <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }} className="mt-7 space-y-4"><label className="block text-sm font-medium">Email<input required type="email" className="mt-2 w-full rounded-xl border border-[#e5e1da] px-3 py-3 outline-none focus:ring-2 focus:ring-[#bdd2c7]" /></label><button type="submit" className="w-full rounded-xl bg-[#173f35] px-4 py-3 font-semibold text-white">Send reset link</button></form>}<p className="mt-6 text-sm text-[#68756e]">Remembered your password? <Link href="/login" className="font-semibold text-[#c36d4d]">Log in</Link></p></div></main>
}
