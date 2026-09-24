import { createAdminSupabaseClient } from '@/lib/supabase/admin'

// Platform fee % taken from each booking. Admin-editable via platform_settings.
export const BOOKING_COMMISSION_KEY = 'booking_commission_percent'
export const DEFAULT_BOOKING_COMMISSION = 15

export function parseCommission(value: string | null | undefined): number {
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : DEFAULT_BOOKING_COMMISSION
}

export async function getBookingCommission(): Promise<number> {
  const supabase = createAdminSupabaseClient()
  const { data } = await supabase.from('platform_settings').select('value').eq('key', BOOKING_COMMISSION_KEY).maybeSingle()
  return parseCommission(data?.value)
}

export function splitAmount(total: number, commissionPercent: number) {
  const platformFee = Math.round((total * commissionPercent) / 100)
  return { platformFee, companionAmount: total - platformFee }
}
