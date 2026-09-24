import { NextRequest, NextResponse } from 'next/server'
import { adminSessionToken, safeEqual } from '@/lib/admin-auth'

// Simple per-IP brute-force limit (per server instance).
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000
const attempts = new Map<string, { count: number; resetAt: number }>()

function clientIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const now = Date.now()
  const entry = attempts.get(ip)
  if (entry && entry.resetAt > now && entry.count >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 })
  }

  const { password } = (await req.json()) as { password?: string }
  const adminPassword = process.env.ADMIN_PASSWORD
  const token = adminSessionToken()
  if (!adminPassword || !token) {
    return NextResponse.json({ error: 'Admin not configured' }, { status: 500 })
  }

  if (typeof password !== 'string' || !safeEqual(password, adminPassword)) {
    const next = entry && entry.resetAt > now ? { count: entry.count + 1, resetAt: entry.resetAt } : { count: 1, resetAt: now + WINDOW_MS }
    attempts.set(ip, next)
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
  }

  attempts.delete(ip)
  const res = NextResponse.json({ success: true })
  res.cookies.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  return res
}
