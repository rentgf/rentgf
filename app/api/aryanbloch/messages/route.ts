import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('contact_messages')
    .select('id, name, email, subject, message, status, created_at')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ messages: data ?? [] })
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { messageId, status } = (await req.json()) as { messageId?: string; status?: string }
  if (!messageId || (status !== 'new' && status !== 'replied')) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const supabase = createAdminSupabaseClient()
  const { error } = await supabase.from('contact_messages').update({ status }).eq('id', messageId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
