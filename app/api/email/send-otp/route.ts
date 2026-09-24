import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { sendOtpEmail } from '@/lib/email/resend'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000))
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

    // issue_email_otp validates input and enforces a 60s resend cooldown.
    const supabase = createAdminSupabaseClient()
    const { data: issued, error } = await supabase.rpc('issue_email_otp', {
      p_email: email.trim().toLowerCase(),
      p_otp: otp,
      p_expires_at: expiresAt,
    })
    if (error) {
      console.error('send-otp error: issue_email_otp failed:', error)
      return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
    }
    if (!issued) {
      return NextResponse.json({ error: 'Please wait a minute before requesting another code.' }, { status: 429 })
    }

    // Resend resolves with { data, error } instead of throwing, so check `error`.
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
