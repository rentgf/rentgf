import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Server-only client that bypasses RLS. Use ONLY in routes already guarded by isAdminRequest().
export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
