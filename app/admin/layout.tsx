'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart2, BookOpen, LogOut, Settings, ShieldCheck, Users } from 'lucide-react'

const NAV = [
  { href: '/admin', label: 'Overview', icon: BarChart2 },
  { href: '/admin/companions', label: 'Companions', icon: Users },
  { href: '/admin/bookings', label: 'Bookings', icon: BookOpen },
  { href: '/admin/reports', label: 'Reports', icon: Settings },
]

async function signOut() {
  await fetch('/api/admin/logout', { method: 'POST' })
  window.location.href = '/admin/login'
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Don't wrap the login page
  if (pathname === '/admin/login') return <>{children}</>

  return (
    <div className="flex min-h-screen bg-[#f5f3ef]">
      {/* Sidebar */}
      <aside className="hidden w-56 flex-col border-r border-[#e9e2d9] bg-white md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-[#e9e2d9] px-5">
          <ShieldCheck className="size-5 text-[#4e8068]" />
          <span className="font-semibold text-[#173f35]">Admin</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium ${
                pathname === href ? 'bg-[#173f35] text-white' : 'text-[#52645b] hover:bg-[#f0f4ef]'
              }`}
            >
              <Icon className="size-4" /> {label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={signOut}
          className="flex items-center gap-2.5 border-t border-[#e9e2d9] px-5 py-4 text-sm text-[#68756e] hover:text-[#173f35]"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-20 flex h-14 items-center gap-3 border-b border-[#e9e2d9] bg-white px-4 md:hidden">
        <ShieldCheck className="size-5 text-[#4e8068]" />
        <span className="font-semibold text-[#173f35]">RentGF Admin</span>
        <div className="ml-auto flex gap-2">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} aria-label={label} className={`rounded-lg p-2 ${ pathname === href ? 'bg-[#173f35] text-white' : 'text-[#52645b]' }`}>
              <Icon className="size-4" />
            </Link>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-auto pt-14 md:pt-0">{children}</main>
    </div>
  )
}
