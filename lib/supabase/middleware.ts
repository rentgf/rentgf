import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './database.types'

// Pages that need sign-in.
const PROTECTED_PATHS = ['/dashboard', '/booking', '/messages', '/profile', '/settings', '/favorites', '/likes', '/notifications', '/companion']

// Pages meant only for people who book. Companions are sent to their own studio instead.
const CUSTOMER_ONLY_PATHS = ['/dashboard', '/booking', '/favorites', '/likes', '/discover', '/become-companion']

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session if expired
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Keep refreshed auth cookies on any redirect we return.
  function redirectTo(pathname: string, keepTarget = false) {
    const url = request.nextUrl.clone()
    url.pathname = pathname
    url.search = ''
    if (keepTarget) url.searchParams.set('redirectTo', path)
    const response = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
    return response
  }

  if (!user) {
    return PROTECTED_PATHS.some((p) => path.startsWith(p)) ? redirectTo('/login', true) : supabaseResponse
  }

  const isCustomerOnly = path === '/' || CUSTOMER_ONLY_PATHS.some((p) => path.startsWith(p))
  if (isCustomerOnly) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (profile?.role === 'companion') return redirectTo('/companion')
  }

  return supabaseResponse
}
