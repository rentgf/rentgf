import { NextResponse } from 'next/server'
import { calculateAccessPrice, platformSettings } from '@/lib/domain/rentgf'
export function GET() { return NextResponse.json({ settings: platformSettings, price: calculateAccessPrice(platformSettings) }) }
