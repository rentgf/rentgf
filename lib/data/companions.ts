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

  let dbQuery = supabase
    .from('companion_profiles')
    .select(`
      id,
      profile_id,
      bio,
      city,
      languages,
      categories,
      interests,
      starting_price,
      currency,
      avg_rating,
      total_reviews,
      verification_status,
      is_visible,
      is_discoverable,
      profiles!inner(display_name, profile_photo_url)
    `)
    .eq('verification_status', 'approved')
    .eq('is_visible', true)
    .eq('is_discoverable', true)
    .order('avg_rating', { ascending: false })
    .range(offset, offset + limit - 1)

  if (city) {
    dbQuery = dbQuery.ilike('city', city)
  }

  if (category) {
    dbQuery = dbQuery.contains('categories', [category])
  }

  const { data, error } = await dbQuery

  if (error) {
    console.error('fetchCompanions error:', error.message)
    return []
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    profile_id: row.profile_id,
    bio: row.bio,
    city: row.city,
    languages: row.languages,
    categories: row.categories,
    interests: row.interests,
    starting_price: row.starting_price,
    currency: row.currency,
    avg_rating: row.avg_rating,
    total_reviews: row.total_reviews,
    verification_status: row.verification_status,
    is_visible: row.is_visible,
    is_discoverable: row.is_discoverable,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    display_name: (row.profiles as any)?.display_name ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    profile_photo_url: (row.profiles as any)?.profile_photo_url ?? null,
  }))
}

export async function fetchCompanionById(companionProfileId: string): Promise<CompanionWithProfile | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('companion_profiles')
    .select(`
      id,
      profile_id,
      bio,
      city,
      languages,
      categories,
      interests,
      starting_price,
      currency,
      avg_rating,
      total_reviews,
      verification_status,
      is_visible,
      is_discoverable,
      profiles!inner(display_name, profile_photo_url)
    `)
    .eq('id', companionProfileId)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    profile_id: data.profile_id,
    bio: data.bio,
    city: data.city,
    languages: data.languages,
    categories: data.categories,
    interests: data.interests,
    starting_price: data.starting_price,
    currency: data.currency,
    avg_rating: data.avg_rating,
    total_reviews: data.total_reviews,
    verification_status: data.verification_status,
    is_visible: data.is_visible,
    is_discoverable: data.is_discoverable,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    display_name: (data.profiles as any)?.display_name ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    profile_photo_url: (data.profiles as any)?.profile_photo_url ?? null,
  }
}
