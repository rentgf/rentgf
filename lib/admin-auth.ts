import { NextRequest, NextResponse } from 'next/server'

export function isAdminRequest(req: NextRequest): boolean {
  const cookie = req.cookies.get('admin_session')?.value
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword || !cookie) return false
  return cookie === adminPassword
}

export function adminGuardResponse(): NextResponse {
  return NextResponse.redirect(new URL('/admin/login', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'))
}
