import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

type VerifyBody = {
  razorpay_order_id?: string
  razorpay_payment_id?: string
  razorpay_signature?: string
  bookingId?: string
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb)
}

export async function POST(req: NextRequest) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } =
    (await req.json()) as VerifyBody
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  // 1. Caller must be signed in.
  const userClient = await createServerSupabaseClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Please log in' }, { status: 401 })

  // 2. Signature must be valid.
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')
  if (!safeEqual(expectedSignature, razorpay_signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminSupabaseClient()
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, customer_profile_id, final_price, payment_status')
    .eq('id', bookingId)
    .maybeSingle()
  if (!booking || booking.customer_profile_id !== user.id) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  // 3. The order must belong to THIS booking and the paid amount must match its price.
  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })
    const [order, payment] = await Promise.all([
      razorpay.orders.fetch(razorpay_order_id),
      razorpay.payments.fetch(razorpay_payment_id),
    ])
    const expectedPaise = Math.round(Number(booking.final_price ?? 0) * 100)
    const orderBookingId = (order.notes as Record<string, unknown> | undefined)?.bookingId
    const valid =
      orderBookingId === bookingId &&
      payment.order_id === razorpay_order_id &&
      Number(order.amount) === expectedPaise &&
      Number(payment.amount) === expectedPaise &&
      (payment.status === 'captured' || payment.status === 'authorized')
    if (!valid) {
      console.error('razorpay verify mismatch', { bookingId, razorpay_order_id, razorpay_payment_id })
      return NextResponse.json({ error: 'Payment does not match this booking' }, { status: 400 })
    }
  } catch (err) {
    console.error('razorpay fetch failed:', err)
    return NextResponse.json({ error: 'Could not verify payment' }, { status: 502 })
  }

  // 4. Idempotent: the same payment is recorded only once.
  const { data: existing } = await supabase
    .from('booking_payments')
    .select('id')
    .eq('payment_id', razorpay_payment_id)
    .maybeSingle()
  if (existing || booking.payment_status === 'PAID') {
    return NextResponse.json({ success: true })
  }

  const { error: updateErr } = await supabase
    .from('bookings')
    .update({ status: 'confirmed', payment_status: 'PAID' })
    .eq('id', bookingId)
  if (updateErr) return NextResponse.json({ error: 'Could not update booking' }, { status: 500 })

  await supabase.from('booking_payments').insert({
    booking_id: bookingId,
    customer_profile_id: booking.customer_profile_id,
    amount: booking.final_price ?? 0,
    payment_provider: 'razorpay',
    payment_id: razorpay_payment_id,
    status: 'completed',
  })

  await supabase.from('notifications').insert({
    profile_id: user.id,
    type: 'booking',
    title: 'Payment successful',
    body: 'Your payment is confirmed and your booking is now active.',
  })

  return NextResponse.json({ success: true })
}
