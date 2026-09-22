import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = (await req.json()) as { email?: string; otp?: string }
    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('email_otps')
      .select('otp, expires_at, used')
      .eq('email', email)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'OTP not found. Please request a new code.' }, { status: 400 })
    }

    if (data.used) {
      return NextResponse.json({ error: 'OTP already used. Please request a new code.' }, { status: 400 })
    }

    if (new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ error: 'OTP expired. Please request a new code.' }, { status: 400 })
    }

    if (data.otp !== otp) {
      return NextResponse.json({ error: 'Incorrect code. Please try again.' }, { status: 400 })
    }

    // Mark as used
    await supabase.from('email_otps').update({ used: true }).eq('email', email)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('verify-otp error:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
