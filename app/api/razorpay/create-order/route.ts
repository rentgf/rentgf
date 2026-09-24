import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { bookingId } = (await req.json()) as { bookingId?: string }
  if (!bookingId) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) {
    return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 })
  }

  // Only the signed-in customer who owns the booking can pay for it.
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Please log in' }, { status: 401 })

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, customer_profile_id, final_price, payment_status')
    .eq('id', bookingId)
    .maybeSingle()
  if (!booking || booking.customer_profile_id !== user.id) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }
  if (booking.payment_status === 'PAID') {
    return NextResponse.json({ error: 'Booking already paid' }, { status: 409 })
  }

  // Amount always comes from the database — never trust the price sent by the browser.
  const amountInPaise = Math.round(Number(booking.final_price ?? 0) * 100)
  if (!Number.isFinite(amountInPaise) || amountInPaise < 100) {
    return NextResponse.json({ error: 'Invalid booking amount' }, { status: 400 })
  }

  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })
    const order = await razorpay.orders.create({
      amount: amountInPaise,
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
