'use client'

import Link from 'next/link'

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-6 text-center text-[#173f35]"><div className="max-w-md"><span className="brand-mark"><span /></span><p className="mt-6 text-sm font-semibold uppercase tracking-[.18em] text-[#d17b58]">Something needs a refresh</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.05em]">We couldn&apos;t load this page.</h1><p className="mt-4 text-sm leading-6 text-[#68756e]">Please try again. Your account and preferences remain safe.</p><div className="mt-7 flex justify-center gap-3"><button type="button" onClick={reset} className="rounded-full bg-[#173f35] px-5 py-3 text-sm font-semibold text-white">Try again</button><Link href="/" className="rounded-full border border-[#dcd6ce] bg-white px-5 py-3 text-sm font-semibold text-[#173f35]">Go home</Link></div></div></main>
}
