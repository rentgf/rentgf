import Link from 'next/link'

// Brand wordmark only — no icon image
export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center ${className}`} aria-label="RentGF home">
      <span className="text-[20px] font-bold tracking-[-0.04em] text-[#173f35]">
        Rent<span className="text-[#d17b58]">GF</span>
      </span>
    </Link>
  )
}
