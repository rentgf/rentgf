import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

// The cookie stores an HMAC token derived from ADMIN_PASSWORD, never the password itself.
// Must match adminSessionToken() in middleware.ts (Web Crypto version).
export const ADMIN_TOKEN_LABEL = 'rentgf-admin-session-v1'

export function adminSessionToken(): string | null {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return null
  return crypto.createHmac('sha256', adminPassword).update(ADMIN_TOKEN_LABEL).digest('hex')
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb)
}

export function isAdminRequest(req: NextRequest): boolean {
  const cookie = req.cookies.get('admin_session')?.value
  const token = adminSessionToken()
  if (!token || !cookie) return false
  return safeEqual(cookie, token)
}

export function adminGuardResponse(): NextResponse {
  return NextResponse.redirect(new URL('/aryanbloch/login', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'))
}
