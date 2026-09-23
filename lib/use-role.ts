'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type AppRole = 'customer' | 'companion'

// Cached for the tab so every page does not re-fetch the role. Cleared on sign-out.
let cachedRole: AppRole | null = null

export function clearRoleCache() {
  cachedRole = null
}

/** Returns the signed-in user's role, or null while loading / signed out. */
export function useRole(): AppRole | null {
  const [role, setRole] = useState<AppRole | null>(cachedRole)

  useEffect(() => {
    if (cachedRole) return
    let active = true
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
      cachedRole = data?.role === 'companion' ? 'companion' : 'customer'
      if (active) setRole(cachedRole)
    }
    void load()
    return () => { active = false }
  }, [])

  return role
}
