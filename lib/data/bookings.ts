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
  totalAmount: _clientTotalAmount,
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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== customerProfileId) return null
  if (!Number.isInteger(durationHours) || durationHours < 1 || durationHours > 8) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate) || scheduledDate < new Date().toISOString().slice(0, 10)) return null
  if (!/^(?:[1-9]|1[0-2]):[0-5]\d (?:AM|PM)$/.test(scheduledTime)) return null
  const cleanLocation = location.trim()
  const cleanNotes = notes?.trim() ?? ''
  if (!cleanLocation || cleanLocation.length > 500 || cleanNotes.length > 2000) return null

  const { data: companion } = await supabase
    .from('public_companion_profiles')
    .select('id, profile_id, starting_price, categories')
    .eq('id', companionProfileId)
    .maybeSingle()
  if (!companion || !companion.id || companion.profile_id === user.id) return null
  if (activityType && !(companion.categories ?? []).includes(activityType)) return null

  const hourlyPrice = Number(companion.starting_price)
  if (!Number.isFinite(hourlyPrice) || hourlyPrice <= 0) return null
  const totalAmount = hourlyPrice * durationHours

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      customer_profile_id: user.id,
      companion_profile_id: companion.id,
      category_id: categoryId ?? null,
      status: 'pending',
      payment_status: 'PENDING',
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      duration_hours: durationHours,
      location_description: cleanLocation,
      customer_notes: cleanNotes || null,
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
