'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function AgeCheckPage() {
  const [confirmed, setConfirmed] = useState(false)
  return <main className="flex min-h-screen items-center justify-center bg-[#173f35] px-4 py-10 text-white"><section className="w-full max-w-md rounded-3xl bg-[#fbfaf7] p-7 text-[#173f35] shadow-2xl sm:p-9"><p className="text-sm font-semibold uppercase tracking-[.18em] text-[#c36d4d]">Adults only</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.05em]">Please confirm your age.</h1><p className="mt-5 text-sm leading-7 text-[#68756e]">RentGF is for people aged 18 and over and is limited to lawful, non-sexual social companionship.</p><label className="mt-7 flex items-start gap-3 text-sm leading-6"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-1 size-4 accent-[#173f35]" />I confirm that I am 18 or older and agree to the <Link href="/terms" className="font-semibold underline">Terms</Link> and <Link href="/safety" className="font-semibold underline">Safety policy</Link>.</label><Link href="/" aria-disabled={!confirmed} className={`mt-7 block rounded-full px-5 py-3 text-center text-sm font-semibold ${confirmed ? 'bg-[#173f35] text-white' : 'pointer-events-none bg-[#dce5dd] text-[#809087]'}`}>Continue to RentGF</Link><Link href="/support" className="mt-4 block text-center text-sm font-semibold text-[#68756e]">Need help?</Link></section></main>
}
