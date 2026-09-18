'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Bell, CheckCircle2 } from 'lucide-react'
import { MobileShell } from '@/components/mobile-shell'
import { getPreviewNotifications } from '@/lib/preview-data'

type Notification = { id: string; title: string; body: string; createdAt: string }

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  useEffect(() => setNotifications(getPreviewNotifications()), [])
  return <MobileShell title="Notifications" showBack><main className="mx-auto max-w-xl px-4 py-7"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold uppercase tracking-[.18em] text-[#c36d4d]">Updates</p><h1 className="mt-2 text-3xl font-semibold">Your notifications</h1></div><Bell className="size-6 text-[#c36d4d]" /></div>{notifications.length ? <div className="mt-7 grid gap-3">{notifications.map((notification) => <section key={notification.id} className="rounded-2xl border border-[#e9e2d9] bg-white p-5"><div className="flex gap-3"><CheckCircle2 className="size-5 shrink-0 text-[#4e8068]" /><div><h2 className="font-semibold">{notification.title}</h2><p className="mt-1 text-sm leading-6 text-[#68756e]">{notification.body}</p></div></div></section>)}</div> : <section className="mt-7 rounded-3xl border border-[#e9e2d9] bg-white p-6"><CheckCircle2 className="size-8 text-[#4e8068]" /><h2 className="mt-4 text-lg font-semibold">You are all caught up</h2><p className="mt-2 text-sm leading-6 text-[#68756e]">Booking updates, messages, and safety alerts will appear here.</p><Link href="/discover" className="mt-6 inline-flex rounded-full bg-[#173f35] px-5 py-3 text-sm font-semibold text-white">Discover companions</Link></section>}</main></MobileShell>
}
