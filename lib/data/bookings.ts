'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

type Booking = Database['public']['Tables']['bookings']['Row']

export async function fetchUserBookings(customerProfileId: string): Promise<Booking[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('customer_profile_id', customerProfileId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('fetchUserBookings error:', error.message)
    return []
  }
  return data ?? []
}

// Bookings received by a companion. `bookings.companion_profile_id` references
// `companion_profiles.id`, NOT `profiles.id`, so resolve it first.
export async function fetchCompanionBookings(profileId: string): Promise<Booking[]> {
  const supabase = await createServerSupabaseClient()
  const { data: cp } = await supabase
    .from('companion_profiles')
    .select('id')
    .eq('profile_id', profileId)
    .maybeSingle()
  if (!cp) return []

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('companion_profile_id', cp.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('fetchCompanionBookings error:', error.message)
    return []
  }
  return data ?? []
}

export async function createBooking({
  customerProfileId,
  companionProfileId,
  scheduledDate,
  scheduledTime,
  durationHours,
  location,
  notes,
  totalAmount,
  categoryId,
  activityType,
}: {
  customerProfileId: string
  companionProfileId: string
  scheduledDate: string
  scheduledTime: string
  durationHours: number
  location: string
  notes?: string
  totalAmount: number
  categoryId?: string
  activityType?: string
}): Promise<{ id: string } | null> {
  const supabase = await createServerSupabaseClient()

  // Real columns: location_description, customer_notes, price, final_price,
  // total_amount, payment_status (upper-case). There are no platform_fee /
  // companion_earnings columns — those belong in the `earnings` table.
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      customer_profile_id: customerProfileId,
      companion_profile_id: companionProfileId,
      category_id: categoryId ?? null,
      status: 'pending',
      payment_status: 'PENDING',
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      duration_hours: durationHours,
      location_description: location,
      customer_notes: notes ?? null,
      activity_type: activityType ?? null,
      price: totalAmount,
      final_price: totalAmount,
      total_amount: totalAmount,
      currency: 'INR',
    })
    .select('id')
    .single()

  if (error) {
    console.error('createBooking error:', error.message)
    return null
  }
  return data
}
