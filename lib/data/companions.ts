'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export type CompanionWithProfile = {
  id: string
  profile_id: string
  display_name: string | null
  bio: string | null
  profile_photo_url: string | null
  city: string | null
  languages: string[] | null
  categories: string[] | null
  interests: string[] | null
  starting_price: number | null
  currency: string | null
  avg_rating: number | null
  total_reviews: number | null
  verification_status: string | null
  is_visible: boolean | null
  is_discoverable: boolean | null
}

type JoinedProfile = { display_name: string | null; profile_photo_url: string | null } | null

const SELECT = `
  id, profile_id, bio, city, languages, categories, interests, starting_price, currency,
  avg_rating, total_reviews, verification_status, is_visible, is_discoverable,
  profiles!inner(display_name, profile_photo_url)
`

type Row = Omit<CompanionWithProfile, 'display_name' | 'profile_photo_url'> & { profiles: unknown }

function mapRow(row: Row): CompanionWithProfile {
  const { profiles, ...rest } = row
  const p = profiles as JoinedProfile
  return { ...rest, display_name: p?.display_name ?? null, profile_photo_url: p?.profile_photo_url ?? null }
}

// Profile ids the signed-in user has blocked (RLS only exposes the user's own blocks).
export async function fetchBlockedProfileIds(): Promise<string[]> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', user.id)
  return (data ?? []).map((b) => b.blocked_id)
}

export async function fetchCompanions({
  query = '',
  city = '',
  category = '',
  limit = 20,
  offset = 0,
}: {
  query?: string
  city?: string
  category?: string
  limit?: number
  offset?: number
} = {}): Promise<CompanionWithProfile[]> {
  const supabase = await createServerSupabaseClient()
  const blockedIds = await fetchBlockedProfileIds()

  let dbQuery = supabase
    .from('companion_profiles')
    .select(SELECT)
    .eq('verification_status', 'approved')
    .eq('is_visible', true)
    .eq('is_discoverable', true)
    .order('avg_rating', { ascending: false })
    .range(offset, offset + limit - 1)

  if (city) dbQuery = dbQuery.ilike('city', city)
  if (category) dbQuery = dbQuery.contains('categories', [category])
  // Filter blocked companions in the database so pages stay full.
  if (blockedIds.length) dbQuery = dbQuery.not('profile_id', 'in', `(${blockedIds.join(',')})`)

  const { data, error } = await dbQuery

  if (error) {
    console.error('fetchCompanions error:', error.message)
    return []
  }

  const rows = (data ?? []) as unknown as Row[]
  const q = query.trim().toLowerCase()
  const mapped = rows.map(mapRow)
  return q ? mapped.filter((c) => (c.display_name ?? '').toLowerCase().includes(q) || (c.bio ?? '').toLowerCase().includes(q)) : mapped
}

export async function fetchCompanionById(companionProfileId: string): Promise<CompanionWithProfile | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('companion_profiles')
    .select(SELECT)
    .eq('id', companionProfileId)
    .single()

  if (error || !data) return null
  return mapRow(data as unknown as Row)
}
