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

    const otp = generateOtp()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min

    // Store OTP in Supabase
    const supabase = await createServerSupabaseClient()
    await supabase.from('email_otps').upsert(
      { email, otp, expires_at: expiresAt, used: false },
      { onConflict: 'email' },
    )

    // Send via Resend
    await sendOtpEmail(email, name, otp)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('send-otp error:', err)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
