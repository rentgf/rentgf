import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Web Crypto version of adminSessionToken() from lib/admin-auth.ts (middleware runs on the edge).
async function adminSessionToken(): Promise<string | null> {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return null
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(adminPassword), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode('rentgf-admin-session-v1'))
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect admin routes (except login page and API). /aryanbloch is the
  // one and only admin panel URL for this app.
  if (pathname.startsWith('/aryanbloch') && pathname !== '/aryanbloch/login') {
    const cookie = req.cookies.get('admin_session')?.value
    const token = await adminSessionToken()

    if (!token || cookie !== token) {
      return NextResponse.redirect(new URL('/aryanbloch/login', req.url))
    }
    return NextResponse.next()
  }

  // Supabase session refresh, sign-in guard, and customer/companion separation.
  return updateSession(req)
}

export const config = {
  matcher: ['/', '/aryanbloch/:path*', '/dashboard/:path*', '/booking/:path*', '/messages/:path*', '/profile/:path*', '/settings/:path*', '/favorites/:path*', '/likes/:path*', '/notifications/:path*', '/discover/:path*', '/become-companion/:path*', '/companion/:path*'],
}
