import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('reports')
    .select('id, category, description, status, created_at, reporter:profiles!reporter_id(display_name), reported:profiles!reported_user_id(display_name)')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const reports = (data ?? []).map((r) => {
    const reporter = r.reporter as unknown as { display_name: string | null } | null
    const reported = r.reported as unknown as { display_name: string | null } | null
    return {
      id: r.id,
      category: r.category,
      description: r.description,
      status: r.status,
      created_at: r.created_at,
      reporter_name: reporter?.display_name ?? null,
      reported_name: reported?.display_name ?? null,
    }
  })
  return NextResponse.json({ reports })
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { reportId } = (await req.json()) as { reportId?: string }
  if (!reportId) return NextResponse.json({ error: 'Missing reportId' }, { status: 400 })
  const supabase = createAdminSupabaseClient()
  const { error } = await supabase.from('reports').update({ status: 'resolved' }).eq('id', reportId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
