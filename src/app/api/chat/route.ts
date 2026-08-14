import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAIProvider } from '@/lib/ai/provider'
import { simulateLatency } from '@/lib/api/latency'

/**
 * Core chat endpoint.
 *
 * Returns a structured ChatMessage. The engine behind it is selected by
 * AI_PROVIDER — today the offline mock, later a real model, with no change
 * to this handler or to any component.
 */

const actionSchema = z.object({
  kind: z.enum(['reschedule', 'select-slot', 'confirm', 'cancel']),
  eventId: z.string().max(64).optional(),
  slotId: z.string().max(128).optional(),
  commit: z.record(z.string()).optional(),
})

const bodySchema = z.object({
  message: z.string().max(2000),
  sessionId: z.string().max(64),
  context: z.object({
    route: z.string().max(256),
    patientId: z.string().max(64).optional(),
    action: actionSchema.optional(),
  }),
})

export async function POST(request: Request) {
  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json(
      { error: { code: 'BAD_JSON', message: 'Request body must be valid JSON.' } },
      { status: 400 }
    )
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'INVALID_REQUEST', message: parsed.error.issues[0]?.message ?? 'Invalid request.' } },
      { status: 400 }
    )
  }

  await simulateLatency()

  try {
    const provider = getAIProvider()
    const message = await provider.respond(parsed.data)
    return NextResponse.json({ message })
  } catch (error) {
    if (process.env.DEBUG_LOGGING === 'true') console.error('[connex] chat error', error)
    return NextResponse.json(
      { error: { code: 'ENGINE_ERROR', message: 'The assistant could not respond.' } },
      { status: 500 }
    )
  }
}
