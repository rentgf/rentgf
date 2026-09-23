import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect admin routes (except login page and API). /aryanbloch is the
  // one and only admin panel URL for this app.
  if (pathname.startsWith('/aryanbloch') && pathname !== '/aryanbloch/login') {
    const cookie = req.cookies.get('admin_session')?.value
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword || cookie !== adminPassword) {
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
