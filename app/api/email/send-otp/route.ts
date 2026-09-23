import { NextRequest, NextResponse } from 'next/server'
import { sendOtpEmail } from '@/lib/email/resend'
import { createServerSupabaseClient } from '@/lib/supabase/server'

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST(req: NextRequest) {
  try {
    const { email, name } = (await req.json()) as { email?: string; name?: string }
    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name required' }, { status: 400 })
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('send-otp error: RESEND_API_KEY is not configured')
      return NextResponse.json({ error: 'Email service is not configured. Please contact support.' }, { status: 500 })
    }

    const otp = generateOtp()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min

    // Store OTP in Supabase
    const supabase = await createServerSupabaseClient()
    await supabase.from('email_otps').upsert(
      { email, otp, expires_at: expiresAt, used: false },
      { onConflict: 'email' },
    )

    // Send via Resend. The Resend SDK resolves with { data, error } instead of
    // throwing on API failures (e.g. unverified sender domain, invalid API key),
    // so we must check `error` explicitly or a failed send is silently ignored
    // and the client is told the code was sent when it was not.
    const { error: sendError } = await sendOtpEmail(email, name, otp)
    if (sendError) {
      console.error('send-otp error: Resend failed to send email:', sendError)
      return NextResponse.json({ error: 'Failed to send verification email. Please try again in a moment.' }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('send-otp error:', err)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
