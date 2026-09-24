import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = (await req.json()) as { email?: string; otp?: string }
    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP required' }, { status: 400 })
    }

    // verify_email_otp checks expiry, single use, and max 5 attempts atomically.
    const supabase = createAdminSupabaseClient()
    const { data: valid, error } = await supabase.rpc('verify_email_otp', {
      p_email: email.trim().toLowerCase(),
      p_otp: otp.trim(),
    })
    if (error) {
      console.error('verify-otp error:', error)
      return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
    }
    if (!valid) {
      return NextResponse.json({ error: 'Incorrect or expired code. Please request a new code.' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('verify-otp error:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
