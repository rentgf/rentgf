import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { sendOtpEmail, sendWelcomeEmail, sendBookingRequestEmail, sendBookingConfirmedEmail, sendBookingCancelledEmail, sendPaymentReceiptEmail, sendCompanionApprovedEmail, sendCompanionRejectedEmail, sendBookingReminderEmail } from '@/lib/email/resend'

export async function POST(req: NextRequest) {
  // Admin-only: otherwise anyone could send email from our domain.
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { to, template } = (await req.json()) as { to?: string; template?: string }
    if (!to || !template) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const now = new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

    switch (template) {
      case 'otp': await sendOtpEmail(to, 'Test User', '847291'); break
      case 'welcome': await sendWelcomeEmail(to, 'Test User'); break
      case 'booking-request': await sendBookingRequestEmail(to, 'Aanya', 'Rahul', now, 2, 1998, 'test-booking-id'); break
      case 'booking-confirmed': await sendBookingConfirmedEmail(to, 'Rahul', 'Aanya', now, 2, 1998, 'test-booking-id'); break
      case 'booking-cancelled': await sendBookingCancelledEmail(to, 'Rahul', 'Aanya', now, true, 'test-booking-id'); break
      case 'payment-receipt': await sendPaymentReceiptEmail(to, 'Rahul', 'Aanya', now, 1998, 'order_test123', 'test-booking-id'); break
      case 'companion-approved': await sendCompanionApprovedEmail(to, 'Test Companion'); break
      case 'companion-rejected': await sendCompanionRejectedEmail(to, 'Test Companion', 'Profile photos do not meet our quality guidelines.'); break
      case 'booking-reminder': await sendBookingReminderEmail(to, 'Rahul', 'Aanya', now, 'test-booking-id'); break
      default: return NextResponse.json({ error: 'Unknown template' }, { status: 400 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('test email error:', err)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
