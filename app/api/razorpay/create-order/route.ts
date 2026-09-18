import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

export async function POST(req: NextRequest) {
  const { amount, bookingId } = await req.json() as { amount: number; bookingId: string }

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 })
  }

  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })

  const order = await razorpay.orders.create({
    amount: amount * 100, // paise
    currency: 'INR',
    receipt: `booking_${bookingId}`,
    notes: { bookingId },
  })

  return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency })
}
