'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function fetchUserFavoriteIds(customerProfileId: string): Promise<string[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('favorites')
    .select('companion_profile_id')
    .eq('customer_profile_id', customerProfileId)
  return (data ?? []).map((r) => r.companion_profile_id)
}

export async function toggleFavoriteAction(customerProfileId: string, companionProfileId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient()
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('customer_profile_id', customerProfileId)
    .eq('companion_profile_id', companionProfileId)
    .single()

  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id)
    return false
  } else {
    await supabase.from('favorites').insert({ customer_profile_id: customerProfileId, companion_profile_id: companionProfileId })
    return true
  }
}
