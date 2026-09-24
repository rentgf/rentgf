import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { BOOKING_COMMISSION_KEY, getBookingCommission } from '@/lib/server/commission'

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ commissionPercent: await getBookingCommission() })
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { commissionPercent } = (await req.json()) as { commissionPercent?: number }
  const n = Number(commissionPercent)
  if (!Number.isFinite(n) || n < 0 || n > 100) {
    return NextResponse.json({ error: 'Commission must be between 0 and 100' }, { status: 400 })
  }
  const value = String(Math.round(n * 100) / 100)
  const supabase = createAdminSupabaseClient()
  const { data: existing } = await supabase.from('platform_settings').select('id').eq('key', BOOKING_COMMISSION_KEY).maybeSingle()
  const { error } = existing
    ? await supabase.from('platform_settings').update({ value }).eq('id', existing.id)
    : await supabase.from('platform_settings').insert({ key: BOOKING_COMMISSION_KEY, value, description: 'Platform fee % taken from each companion booking' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ commissionPercent: Number(value) })
}
