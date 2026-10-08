import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Public endpoint used by the register form to check (server-side, bypassing
// RLS) whether an email is already registered, before sending an OTP.
export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email?: string }
    if (!email || !EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const supabase = createAdminSupabaseClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()

    if (error) {
      console.error('check-email error:', error.message)
      return NextResponse.json({ error: 'Could not check email' }, { status: 500 })
    }

    return NextResponse.json({ exists: !!data })
  } catch (err) {
    console.error('check-email error:', err)
    return NextResponse.json({ error: 'Could not check email' }, { status: 500 })
  }
}
