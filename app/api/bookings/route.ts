import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const MAX_HOURS = 8
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TIME_PATTERN = /^(?:[1-9]|1[0-2]):[0-5]\d (?:AM|PM)$/

function isValidDate(value: string) {
  if (!DATE_PATTERN.test(value)) return false
  const parsed = new Date(value + 'T00:00:00Z')
  if (Number.isNaN(parsed.getTime())) return false
  return value >= new Date().toISOString().slice(0, 10)
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as {
    companionId?: unknown
    scheduledDate?: unknown
    scheduledTime?: unknown
    durationHours?: unknown
    location?: unknown
    notes?: unknown
    activityType?: unknown
  } | null

  const companionId = typeof body?.companionId === 'string' ? body.companionId : ''
  const scheduledDate = typeof body?.scheduledDate === 'string' ? body.scheduledDate : ''
  const scheduledTime = typeof body?.scheduledTime === 'string' ? body.scheduledTime : ''
  const durationHours = Number(body?.durationHours)
  const location = typeof body?.location === 'string' ? body.location.trim() : ''
  const notes = typeof body?.notes === 'string' ? body.notes.trim() : ''
  const activityType = typeof body?.activityType === 'string' ? body.activityType.trim() : ''

  if (!companionId || !isValidDate(scheduledDate) || !TIME_PATTERN.test(scheduledTime)) {
    return NextResponse.json({ error: 'Invalid booking details' }, { status: 400 })
  }
  if (!Number.isInteger(durationHours) || durationHours < 1 || durationHours > MAX_HOURS) {
    return NextResponse.json({ error: 'Invalid booking duration' }, { status: 400 })
  }
  if (!location || location.length > 500 || notes.length > 2000) {
    return NextResponse.json({ error: 'Location or message is too long' }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Please log in to book' }, { status: 401 })

  const { data: companion, error: companionError } = await supabase
    .from('public_companion_profiles')
    .select('id, profile_id, starting_price, categories')
    .eq('id', companionId)
    .maybeSingle()

  if (companionError) {
    console.error('create booking companion lookup failed:', companionError.message)
    return NextResponse.json({ error: 'Could not load companion' }, { status: 500 })
  }
  if (!companion || !companion.id || !companion.profile_id) {
    return NextResponse.json({ error: 'Companion is not available' }, { status: 404 })
  }
  if (companion.profile_id === user.id) {
    return NextResponse.json({ error: 'You cannot book your own profile' }, { status: 400 })
  }
  if (activityType && !(companion.categories ?? []).includes(activityType)) {
    return NextResponse.json({ error: 'Invalid activity' }, { status: 400 })
  }

  const hourlyPrice = Number(companion.starting_price)
  if (!Number.isFinite(hourlyPrice) || hourlyPrice <= 0) {
    return NextResponse.json({ error: 'Companion pricing is unavailable' }, { status: 409 })
  }
  const totalAmount = hourlyPrice * durationHours

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      customer_profile_id: user.id,
      companion_profile_id: companion.id,
      status: 'pending',
      payment_status: 'PENDING',
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      duration_hours: durationHours,
      location_description: location,
      customer_notes: notes || null,
      activity_type: activityType || null,
      price: totalAmount,
      final_price: totalAmount,
      total_amount: totalAmount,
      currency: 'INR',
    })
    .select('id')
    .single()

  if (bookingError || !booking) {
    console.error('create booking insert failed:', bookingError?.message)
    return NextResponse.json({ error: 'Could not create booking' }, { status: 500 })
  }

  return NextResponse.json({ bookingId: booking.id, amount: totalAmount, currency: 'INR' }, { status: 201 })
}
