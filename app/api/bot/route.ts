import { NextResponse } from 'next/server'
import { answerBot } from '@/lib/server/bot'
export async function POST(request: Request) { const body = await request.json().catch(() => null); if (!body || typeof body.message !== 'string' || body.message.length > 500) return NextResponse.json({ error: 'Please enter a valid question.' }, { status: 400 }); return NextResponse.json(answerBot(body.message)) }
