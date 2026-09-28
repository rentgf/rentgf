import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

type Body = { name?: string; email?: string; subject?: string; message?: string }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Public endpoint: visitors submit the contact form. Saved with the service role.
export async function POST(req: NextRequest) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const name = body.name?.trim() ?? ''
  const email = body.email?.trim() ?? ''
  const subject = body.subject?.trim() ?? ''
  const message = body.message?.trim() ?? ''

  if (!name || !subject || !message || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: 'Please fill in all fields with a valid email.' }, { status: 400 })
  }
  if (name.length > 100 || email.length > 200 || subject.length > 100 || message.length > 5000) {
    return NextResponse.json({ error: 'Some fields are too long.' }, { status: 400 })
  }

  const supabase = createAdminSupabaseClient()
  const { error } = await supabase.from('contact_messages').insert({ name, email, subject, message })
  if (error) return NextResponse.json({ error: 'Could not send your message. Please try again.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
