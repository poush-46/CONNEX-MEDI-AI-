import type { ScheduledEvent } from '@/types/clinical'
import { SCHEDULED_EVENTS } from '@/data/patients'

/**
 * In-memory mutable demo state.
 *
 * Only mutations live here — immutable seed data is read straight from
 * src/data/. This is deliberately the ONLY place that holds changing state,
 * so replacing it with a database is a contained change.
 *
 * Note: on serverless platforms each instance holds its own copy and state
 * resets on cold start. That is acceptable (and honest) for a prototype.
 */

interface DemoState {
  /** Overrides keyed by event id, applied over the seeded events. */
  eventOverrides: Map<string, ScheduledEvent>
}

const globalForStore = globalThis as unknown as { __connexStore?: DemoState }

function getState(): DemoState {
  if (!globalForStore.__connexStore) {
    globalForStore.__connexStore = { eventOverrides: new Map() }
  }
  return globalForStore.__connexStore
}

/** All scheduled events with any overrides applied. */
export function getScheduledEvents(): ScheduledEvent[] {
  const { eventOverrides } = getState()
  return SCHEDULED_EVENTS.map((e) => eventOverrides.get(e.id) ?? e)
}

export function getScheduledEvent(id: string): ScheduledEvent | undefined {
  return getScheduledEvents().find((e) => e.id === id)
}

export function putScheduledEvent(event: ScheduledEvent): void {
  getState().eventOverrides.set(event.id, event)
}

export function resetDemoState(): void {
  getState().eventOverrides.clear()
}
