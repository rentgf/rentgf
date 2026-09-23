'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft, Bell, CalendarDays, Compass, Heart, Home, LayoutDashboard, MessageCircle, UserRound, type LucideIcon } from 'lucide-react'
import { Logo } from '@/components/logo'
import { useRole, type AppRole } from '@/lib/use-role'

type NavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean }

// Customers (who book) and companions (who earn) get completely separate menus.
const NAV_ITEMS: Record<AppRole, NavItem[]> = {
  customer: [
    { href: '/', label: 'Home', icon: Home, exact: true },
    { href: '/discover', label: 'Discover', icon: Compass },
    { href: '/likes', label: 'Likes', icon: Heart },
    { href: '/messages', label: 'Messages', icon: MessageCircle },
    { href: '/profile', label: 'Profile', icon: UserRound },
  ],
  companion: [
    { href: '/companion', label: 'Studio', icon: LayoutDashboard, exact: true },
    { href: '/companion/bookings', label: 'Requests', icon: CalendarDays },
    { href: '/messages', label: 'Messages', icon: MessageCircle },
    { href: '/notifications', label: 'Alerts', icon: Bell },
    { href: '/profile', label: 'Profile', icon: UserRound },
  ],
}

function isActive(item: NavItem, pathname: string) {
  if (item.href === '/companion') return pathname === '/companion' || pathname.startsWith('/companion/verification')
  return item.exact ? pathname === item.href : pathname.startsWith(item.href)
}

export function MobileShell({ children, title, showBack = false }: { children: React.ReactNode; title?: string; showBack?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const role = useRole()
  const isHome = pathname === '/'
  const items = role ? NAV_ITEMS[role] : []

  return (
    <div className="min-h-screen bg-[#fbfaf7] pb-24 text-[#173f35]">
      <header className="sticky top-0 z-20 border-b border-[#eee9e2] bg-[#fbfaf7]/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          {showBack && !isHome ? <button type="button" onClick={() => router.back()} aria-label="Go back" className="rounded-full border border-[#e4e9e1] bg-white p-2 text-[#173f35] transition hover:bg-[#f0f5ef]"><ArrowLeft className="size-5" /></button> : <Logo />}
          {title && <h1 className="truncate text-base font-semibold">{title}</h1>}
          {role === 'companion' && <span className="ml-auto rounded-full bg-[#fbeee7] px-2.5 py-1 text-[11px] font-semibold text-[#b5623f]">Companion</span>}
        </div>
      </header>
      {children}
      <nav aria-label="Main navigation" className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e8e7df] bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 shadow-[0_-6px_20px_rgba(23,63,53,.06)] backdrop-blur">
        <div className="mx-auto grid min-h-12 max-w-lg grid-cols-5 gap-1">
          {items.map((item) => {
            const active = isActive(item, pathname)
            const Icon = item.icon
            return <Link key={item.href} href={item.href} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition ${active ? 'bg-[#edf4ee] text-[#173f35]' : 'text-[#809087] hover:bg-[#f7f8f4]'}`}><Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} /><span>{item.label}</span></Link>
          })}
        </div>
      </nav>
    </div>
  )
}

export function PageBack({ href, label = 'Back' }: { href: string; label?: string }) {
  return <Link href={href} className="inline-flex items-center gap-2 text-sm font-semibold text-[#68756e]"><ArrowLeft className="size-4" />{label}</Link>
}

export function BookingFooter({ price, onContinue, disabled = false, label = 'Continue to review' }: { price: string; onContinue: () => void; disabled?: boolean; label?: string }) {
  return <div className="fixed inset-x-0 bottom-[76px] z-20 border-t border-[#e8e7df] bg-white px-4 pb-3 pt-3 shadow-[0_-6px_20px_rgba(23,63,53,.08)] sm:bottom-0 sm:pb-[calc(env(safe-area-inset-bottom)+12px)]"><div className="mx-auto flex max-w-xl items-center justify-between gap-4"><div><p className="text-xs text-[#7c8982]">Total</p><p className="text-lg font-semibold">{price}</p></div><button type="button" onClick={onContinue} disabled={disabled} className="rounded-full bg-[#173f35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#245447] disabled:cursor-not-allowed disabled:opacity-45">{label}</button></div></div>
}
