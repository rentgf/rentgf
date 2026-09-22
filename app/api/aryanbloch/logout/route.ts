import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  void req
  const res = NextResponse.json({ success: true })
  res.cookies.delete('admin_session')
  return res
}
