'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { MobileShell } from '@/components/mobile-shell'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Notification = {
  id: string
  type: string
  title: string
  body: string | null
  is_read: boolean | null
  created_at: string | null
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirectTo=/notifications'); return }
      const { data } = await supabase
        .from('notifications')
        .select('id, type, title, body, is_read, created_at')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      setNotifications(data ?? [])
      // Mark all as read
      if (data && data.length > 0) {
        await supabase.from('notifications').update({ is_read: true }).eq('profile_id', user.id).eq('is_read', false)
      }
      setLoading(false)
    }
    load()
  }, [router])

  return (
    <MobileShell title="Notifications">
      <main className="mx-auto max-w-xl px-4 py-6">
        {loading ? (
          <p className="text-center text-sm text-[#738078]">Loading…</p>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#edf4ed]">
              <Bell className="size-7 text-[#4e8068]" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold">No notifications</h1>
            <p className="mt-2 text-sm text-[#68756e]">You are all caught up!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`rounded-2xl border p-4 ${
                  notif.is_read ? 'border-[#e9e2d9] bg-white' : 'border-[#c8dfc7] bg-[#f4faf4]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#173f35]">{notif.title}</p>
                    {notif.body && <p className="mt-1 text-sm leading-6 text-[#68756e]">{notif.body}</p>}
                  </div>
                  {!notif.is_read && <span className="mt-1 size-2 shrink-0 rounded-full bg-[#4e8068]" />}
                </div>
                {notif.created_at && (
                  <p className="mt-2 text-xs text-[#9aa49d]">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </MobileShell>
  )
}
