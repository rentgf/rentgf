import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect admin routes (except login page and API)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const cookie = req.cookies.get('admin_session')?.value
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword || cookie !== adminPassword) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/booking/:path*', '/messages/:path*', '/profile/:path*', '/settings/:path*', '/favorites/:path*', '/likes/:path*', '/notifications/:path*'],
}
