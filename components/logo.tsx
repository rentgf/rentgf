import Link from 'next/link'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`} aria-label="RentGF home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon.svg" alt="RentGF logo" width={32} height={32} className="size-[32px] rounded-[8px]" />
      <span className="text-[19px] font-semibold tracking-[-0.04em] text-[#173f35]">
        Rent<span className="text-[#d17b58]">GF</span>
      </span>
    </Link>
  )
}
