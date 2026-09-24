import { createClient } from './client'
import type { Database } from './database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

/**
 * Get the current authenticated user's profile from the database.
 * Returns null if not authenticated or profile not found.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

/**
 * Ensure a profile row exists for the authenticated user without changing an
 * existing role. The role may belong to a companion or an administrator.
 */
export async function upsertProfile(userId: string, email?: string, name?: string): Promise<Profile | null> {
  const supabase = createClient()
  const { data: existing, error: lookupError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  if (lookupError) {
    console.error('upsertProfile lookup error:', lookupError.message)
    return null
  }

  const profileFields = {
    email: email ?? null,
    full_name: name ?? null,
    display_name: name ?? null,
  }

  const { data, error } = existing
    ? await supabase.from('profiles').update(profileFields).eq('id', userId).select().single()
    : await supabase.from('profiles').insert({
        id: userId,
        ...profileFields,
        role: 'customer',
        account_status: 'active',
        age_confirmed: false,
        access_granted: false,
      }).select().single()

  if (error) {
    console.error('upsertProfile error:', error.message)
    return null
  }
  return data
}
