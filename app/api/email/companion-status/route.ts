import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { sendCompanionApprovedEmail, sendCompanionRejectedEmail } from '@/lib/email/resend'

export async function POST(req: NextRequest) {
  // Admin-only: prevents anyone sending fake approval/rejection emails.
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { type, email, name, reason } = (await req.json()) as {
      type: 'approved' | 'rejected'
      email: string
      name: string
      reason?: string
    }
    if (!email || !name || !type) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    if (type === 'approved') {
      await sendCompanionApprovedEmail(email, name)
    } else {
      await sendCompanionRejectedEmail(email, name, reason)
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('companion-status email error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
