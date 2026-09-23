import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { sendCompanionApprovedEmail, sendCompanionRejectedEmail } from '@/lib/email/resend'

const DOCS_BUCKET = 'verification-docs'
const SIGNED_URL_SECONDS = 60 * 10

type ProfileJoin = { display_name: string | null; email: string | null; profile_photo_url: string | null }

// Stored values are storage paths; older rows may hold full URLs.
async function signedUrl(supabase: ReturnType<typeof createAdminSupabaseClient>, value: string | null) {
  if (!value) return null
  if (/^https?:\/\//.test(value)) return value
  const { data } = await supabase.storage.from(DOCS_BUCKET).createSignedUrl(value, SIGNED_URL_SECONDS)
  return data?.signedUrl ?? null
}

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const supabase = createAdminSupabaseClient()
    const { data, error } = await supabase
      .from('companion_profiles')
      .select('id, profile_id, bio, city, starting_price, categories, verification_status, is_visible, created_at, profiles!inner(display_name, email, profile_photo_url)')
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const ids = (data ?? []).map((c) => c.id)
    const { data: docs } = ids.length
      ? await supabase
          .from('companion_verification')
          .select('id, companion_profile_id, status, id_document_url, selfie_url, submitted_at')
          .in('companion_profile_id', ids)
          .order('submitted_at', { ascending: false })
      : { data: [] }

    // Keep only the newest submission per companion.
    const latest = new Map<string, NonNullable<typeof docs>[number]>()
    for (const d of docs ?? []) if (!latest.has(d.companion_profile_id)) latest.set(d.companion_profile_id, d)

    const companions = await Promise.all((data ?? []).map(async (row) => {
      const p = row.profiles as unknown as ProfileJoin
      const doc = latest.get(row.id)
      return {
        id: row.id, profile_id: row.profile_id, bio: row.bio, city: row.city, starting_price: row.starting_price,
        categories: row.categories, verification_status: row.verification_status, is_visible: row.is_visible, created_at: row.created_at,
        display_name: p.display_name, email: p.email, profile_photo_url: p.profile_photo_url,
        verification: doc ? {
          id: doc.id, status: doc.status, submitted_at: doc.submitted_at,
          id_document_url: await signedUrl(supabase, doc.id_document_url),
          selfie_url: await signedUrl(supabase, doc.selfie_url),
        } : null,
      }
    }))
    return NextResponse.json({ companions })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = (await req.json()) as { companionId?: string; action?: 'approve' | 'reject'; reason?: string }
  if (!body.companionId || (body.action !== 'approve' && body.action !== 'reject')) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
  const approve = body.action === 'approve'
  const reason = body.reason?.trim().slice(0, 500) || null

  try {
    const supabase = createAdminSupabaseClient()
    const { data: cp } = await supabase
      .from('companion_profiles')
      .select('id, profile_id, profiles!inner(display_name, email)')
      .eq('id', body.companionId)
      .single()
    if (!cp) return NextResponse.json({ error: 'Companion not found' }, { status: 404 })
    const p = cp.profiles as unknown as { display_name: string | null; email: string | null }

    const { error: cpErr } = await supabase
      .from('companion_profiles')
      .update({ verification_status: approve ? 'approved' : 'rejected', is_visible: approve })
      .eq('id', cp.id)
    if (cpErr) return NextResponse.json({ error: cpErr.message }, { status: 500 })

    await supabase.from('profiles').update({ role: approve ? 'companion' : 'customer' }).eq('id', cp.profile_id)

    // Mirror the decision onto the latest verification submission, if any.
    const { data: doc } = await supabase
      .from('companion_verification')
      .select('id')
      .eq('companion_profile_id', cp.id)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (doc) {
      await supabase.from('companion_verification').update({
        status: approve ? 'approved' : 'rejected',
        rejection_reason: approve ? null : reason,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', doc.id)
    }

    await supabase.from('notifications').insert({
      profile_id: cp.profile_id,
      type: 'verification',
      title: approve ? 'Application approved!' : 'Application not approved',
      body: approve
        ? 'Congratulations! Your companion profile is now live on RentGF.'
        : `We could not approve your profile yet.${reason ? ` Reason: ${reason}` : ''}`,
    })

    if (p.email) {
      try {
        if (approve) await sendCompanionApprovedEmail(p.email, p.display_name ?? 'there')
        else await sendCompanionRejectedEmail(p.email, p.display_name ?? 'there', reason ?? undefined)
      } catch (e) {
        console.error('companion status email failed:', e)
      }
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}
