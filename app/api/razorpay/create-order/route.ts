import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

// Must match the booking page pricing.
const DEFAULT_HOURLY_PRICE = 999

export async function POST(req: NextRequest) {
  const { bookingId } = (await req.json()) as { bookingId?: string }
  if (!bookingId) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) {
    return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 })
  }

  // Only the signed-in customer who owns the booking can pay for it.
  const userClient = await createServerSupabaseClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Please log in' }, { status: 401 })

  const supabase = createAdminSupabaseClient()
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, customer_profile_id, companion_profile_id, duration_hours, payment_status')
    .eq('id', bookingId)
    .maybeSingle()
  if (!booking || booking.customer_profile_id !== user.id) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }
  if (booking.payment_status === 'PAID') {
    return NextResponse.json({ error: 'Booking already paid' }, { status: 409 })
  }

  // Recompute the price on the server from the companion's rate — the browser
  // could have written any price into the booking row.
  const hours = Number(booking.duration_hours)
  if (!Number.isInteger(hours) || hours < 1 || hours > 12) {
    return NextResponse.json({ error: 'Invalid booking duration' }, { status: 400 })
  }
  const { data: companion } = await supabase
    .from('companion_profiles')
    .select('starting_price')
    .eq('id', booking.companion_profile_id)
    .maybeSingle()
  if (!companion) return NextResponse.json({ error: 'Companion not found' }, { status: 404 })
  const amount = (companion.starting_price ?? DEFAULT_HOURLY_PRICE) * hours

  await supabase
    .from('bookings')
    .update({ price: amount, final_price: amount, total_amount: amount })
    .eq('id', bookingId)

  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: `booking_${bookingId}`.slice(0, 40),
      notes: { bookingId, customerId: user.id },
    })
    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency })
  } catch (err) {
    console.error('razorpay create-order failed:', err)
    return NextResponse.json({ error: 'Could not start payment. Please try again.' }, { status: 502 })
  }
}
