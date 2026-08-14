import { NextResponse } from 'next/server'
import { listPatients } from '@/lib/repositories/patients'
import { simulateLatency } from '@/lib/api/latency'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') ?? undefined
  const flaggedOnly = searchParams.get('flagged') === 'true'
  await simulateLatency()
  return NextResponse.json({ patients: listPatients({ query, flaggedOnly }) })
}
