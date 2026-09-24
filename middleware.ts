import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const ADMIN_TOKEN_LABEL = 'rentgf-admin-session-v2'

// Web Crypto version of isValidAdminToken() from lib/admin-auth.ts (middleware runs on the edge).
async function isValidAdminToken(token: string | undefined): Promise<boolean> {
  if (!token) return false
  const [expiresAtStr, sig] = token.split('.')
  if (!expiresAtStr || !sig) return false
  const expiresAt = Number(expiresAtStr)
  if (Number.isNaN(expiresAt) || expiresAt < Date.now()) return false

  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return false
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(adminPassword), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const expectedSig = await crypto.subtle.sign('HMAC', key, enc.encode(`${ADMIN_TOKEN_LABEL}:${expiresAtStr}`))
  const expectedHex = Array.from(new Uint8Array(expectedSig)).map((b) => b.toString(16).padStart(2, '0')).join('')
  return expectedHex === sig
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect admin routes (except login page and API). /aryanbloch is the
  // one and only admin panel URL for this app.
  if (pathname.startsWith('/aryanbloch') && pathname !== '/aryanbloch/login') {
    const cookie = req.cookies.get('admin_session')?.value

    if (!(await isValidAdminToken(cookie))) {
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
