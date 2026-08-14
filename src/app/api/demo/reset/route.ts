import { NextResponse } from 'next/server'
import { resetDemoState } from '@/lib/store/demo-store'

export async function POST() {
  resetDemoState()
  return NextResponse.json({ ok: true })
}
