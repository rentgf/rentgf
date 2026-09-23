import Link from 'next/link'
import { Logo } from '@/components/logo'

export default function NotFound() {
  return <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-6 text-center text-[#173f35]"><div className="max-w-md"><Logo className="justify-center" /><p className="mt-6 text-sm font-semibold uppercase tracking-[.18em] text-[#d17b58]">That page moved</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.05em]">Let&apos;s get you back to good company.</h1><p className="mt-4 text-sm leading-6 text-[#68756e]">The link may be outdated, but the community is still here.</p><div className="mt-7 flex justify-center gap-3"><Link href="/" className="rounded-full bg-[#173f35] px-5 py-3 text-sm font-semibold text-white">Go home</Link><Link href="/discover" className="rounded-full border border-[#dcd6ce] bg-white px-5 py-3 text-sm font-semibold text-[#173f35]">Discover</Link></div></div></main>
}
