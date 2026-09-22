import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect admin routes (except login page and API)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const cookie = req.cookies.get('admin_session')?.value
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword || cookie !== adminPassword) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    return NextResponse.next()
  }

  // `lib/supabase/middleware.ts` defines the Supabase session refresh + auth
  // redirect logic, but it was never called from here. Without this, the
  // Supabase session cookie never refreshes and protected routes
  // (dashboard, booking, messages, profile, settings, favorites, likes,
  // notifications) never actually check whether the user is logged in.
  return updateSession(req)
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/booking/:path*', '/messages/:path*', '/profile/:path*', '/settings/:path*', '/favorites/:path*', '/likes/:path*', '/notifications/:path*'],
}
