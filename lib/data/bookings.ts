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
}): Promise<{ id: string } | null> {
  const supabase = await createServerSupabaseClient()
  const platformFee = Math.round(totalAmount * 0.15)
  const companionEarnings = totalAmount - platformFee

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      customer_profile_id: customerProfileId,
      companion_profile_id: companionProfileId,
      category_id: categoryId ?? null,
      status: 'pending',
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      duration_hours: durationHours,
      location,
      notes: notes ?? null,
      total_amount: totalAmount,
      currency: 'INR',
      platform_fee: platformFee,
      companion_earnings: companionEarnings,
    })
    .select('id')
    .single()

  if (error) {
    console.error('createBooking error:', error.message)
    return null
  }
  return data
}
