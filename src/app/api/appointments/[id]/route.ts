import { NextResponse } from 'next/server'
import { z } from 'zod'
import { rescheduleEvent, slotsForEvent } from '@/lib/repositories/appointments'
import { simulateLatency } from '@/lib/api/latency'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({ slots: slotsForEvent(params.id) })
}

const patchSchema = z.object({ targetIso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const parsed = patchSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'INVALID_REQUEST', message: 'A target date is required.' } },
      { status: 400 }
    )
  }
  await simulateLatency()
  const result = rescheduleEvent(params.id, parsed.data.targetIso)
  if (!result.ok) {
    return NextResponse.json(
      { error: { code: 'RESCHEDULE_REJECTED', message: result.error! } },
      { status: 409 }
    )
  }
  return NextResponse.json({ event: result.event })
}
