import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/logo'

export function Footer() {
  return (
    <footer className="border-t border-[#e9e2d9] bg-white px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <Logo className="w-fit" />
            <p className="mt-3 text-sm leading-6 text-[#68756e]">
              Safe, verified, non-sexual social companionship. 18+ only.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-[#4e8068]">
              <ShieldCheck className="size-4" />
              <span>Every companion is verified</span>
            </div>
          </div>

          {/* Platform */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#9aa49d]">Platform</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link href="/discover" className="text-[#52645b] hover:text-[#173f35]">Discover companions</Link></li>
              <li><Link href="/become-companion" className="text-[#52645b] hover:text-[#173f35]">Become a companion</Link></li>
              <li><Link href="/about" className="text-[#52645b] hover:text-[#173f35]">About us</Link></li>
              <li><Link href="/contact" className="text-[#52645b] hover:text-[#173f35]">Contact</Link></li>
              <li><Link href="/safety" className="text-[#52645b] hover:text-[#173f35]">Safety</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#9aa49d]">Legal</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link href="/terms" className="text-[#52645b] hover:text-[#173f35]">Terms of Service</Link></li>
              <li><Link href="/privacy-policy" className="text-[#52645b] hover:text-[#173f35]">Privacy Policy</Link></li>
              <li><Link href="/contact" className="text-[#52645b] hover:text-[#173f35]">Report an issue</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[#f0ebe4] pt-6 sm:flex-row">
          <p className="text-xs text-[#9aa49d]">
            &copy; {new Date().getFullYear()} RentGF. All rights reserved.
          </p>
          <div className="flex gap-5 text-xs text-[#9aa49d]">
            <Link href="/terms" className="hover:text-[#173f35]">Terms</Link>
            <Link href="/privacy-policy" className="hover:text-[#173f35]">Privacy</Link>
            <Link href="/contact" className="hover:text-[#173f35]">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
