import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } =
    await req.json() as {
      razorpay_order_id: string
      razorpay_payment_id: string
      razorpay_signature: string
      bookingId: string
    }

  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  // Verify signature
  const body = `${razorpay_order_id}|${razorpay_payment_id}`
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Update booking with payment info
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  await supabase
    .from('bookings')
    .update({
      status: 'confirmed',
      payment_status: 'paid',
      payment_id: razorpay_payment_id,
      razorpay_order_id,
    })
    .eq('id', bookingId)

  return NextResponse.json({ success: true })
}
