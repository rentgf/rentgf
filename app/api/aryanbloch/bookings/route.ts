import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

// Admin panel data. The admin uses a password (not a Supabase account), so the
// browser client is blocked by RLS; read everything here with the service role.
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createAdminSupabaseClient()

  const [usersRes, pendingRes, totalRes, confirmedRes, bookingsRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('companion_profiles').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    supabase.from('bookings').select('id', { count: 'exact', head: true }),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'confirmed'),
    supabase
      .from('bookings')
      .select(`
        id, status, payment_status, final_price, scheduled_date, scheduled_time, created_at,
        customer:profiles!customer_profile_id(display_name),
        companion:companion_profiles!companion_profile_id(profiles!inner(display_name))
      `)
      .order('created_at', { ascending: false })
      .limit(100),
  ])
  if (bookingsRes.error) return NextResponse.json({ error: bookingsRes.error.message }, { status: 500 })

  const bookings = (bookingsRes.data ?? []).map((b) => {
    const customer = b.customer as unknown as { display_name: string | null } | null
    const companion = b.companion as unknown as { profiles: { display_name: string | null } | null } | null
    return {
      id: b.id,
      status: b.status,
      payment_status: b.payment_status,
      final_price: b.final_price,
      scheduled_date: b.scheduled_date,
      scheduled_time: b.scheduled_time,
      created_at: b.created_at,
      customer_name: customer?.display_name ?? null,
      companion_name: companion?.profiles?.display_name ?? null,
    }
  })

  return NextResponse.json({
    stats: {
      totalUsers: usersRes.count ?? 0,
      pendingCompanions: pendingRes.count ?? 0,
      totalBookings: totalRes.count ?? 0,
      confirmedBookings: confirmedRes.count ?? 0,
    },
    bookings,
  })
}
