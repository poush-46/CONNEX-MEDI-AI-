import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    engine: process.env.AI_PROVIDER ?? 'mock',
    timestamp: new Date().toISOString(),
  })
}
