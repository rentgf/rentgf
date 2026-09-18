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
 * Ensure a profile row exists for the authenticated user.
 * Called after sign-up or first sign-in.
 */
export async function upsertProfile(userId: string, email?: string, name?: string): Promise<Profile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: email ?? null,
      full_name: name ?? null,
      display_name: name ?? null,
      role: 'customer',
      account_status: 'active',
      age_confirmed: false,
      access_granted: false,
    }, { onConflict: 'id' })
    .select()
    .single()

  if (error) {
    console.error('upsertProfile error:', error.message)
    return null
  }
  return data
}
