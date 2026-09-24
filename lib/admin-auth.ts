import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

// The cookie stores an HMAC-signed token derived from ADMIN_PASSWORD, never the
// password itself. The token embeds an expiry so it can't be replayed forever.
// Must match the Web Crypto version in middleware.ts.
export const ADMIN_TOKEN_LABEL = 'rentgf-admin-session-v2'
export const SESSION_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

function signPayload(payload: string): string | null {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return null
  return crypto.createHmac('sha256', adminPassword).update(payload).digest('hex')
}

export function createAdminToken(): string | null {
  const expiresAt = Date.now() + SESSION_TTL_MS
  const sig = signPayload(`${ADMIN_TOKEN_LABEL}:${expiresAt}`)
  if (!sig) return null
  return `${expiresAt}.${sig}`
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb)
}

export function isValidAdminToken(token: string | undefined | null): boolean {
  if (!token) return false
  const [expiresAtStr, sig] = token.split('.')
  if (!expiresAtStr || !sig) return false
  const expiresAt = Number(expiresAtStr)
  if (Number.isNaN(expiresAt) || expiresAt < Date.now()) return false
  const expected = signPayload(`${ADMIN_TOKEN_LABEL}:${expiresAtStr}`)
  return !!expected && safeEqual(sig, expected)
}

export function isAdminRequest(req: NextRequest): boolean {
  return isValidAdminToken(req.cookies.get('admin_session')?.value)
}

export function adminGuardResponse(): NextResponse {
  return NextResponse.redirect(new URL('/aryanbloch/login', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'))
}
