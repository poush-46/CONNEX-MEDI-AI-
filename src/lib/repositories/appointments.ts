import type { AppointmentSlot, ScheduledEvent } from '@/types/clinical'
import { DEMO_TODAY_ISO } from '@/data/patients'
import { addDays, formatDisplayDate } from '@/lib/utils/date'
import { getScheduledEvent, getScheduledEvents, putScheduledEvent } from '@/lib/store/demo-store'

/**
 * Scheduling data access.
 *
 * SWAP POINT: replace with a real scheduling system later. The service layer
 * above calls only these functions.
 */

const SLOT_TIMES = ['09:15', '11:30', '14:45']

export function listEvents(patientId?: string): ScheduledEvent[] {
  const all = getScheduledEvents().filter((e) => e.status !== 'cancelled')
  const filtered = patientId ? all.filter((e) => e.patientId === patientId) : all
  return filtered.sort((a, b) => a.dateIso.localeCompare(b.dateIso))
}

export function getEvent(id: string): ScheduledEvent | undefined {
  return getScheduledEvent(id)
}

/**
 * Candidate slots for rescheduling an event.
 * Deterministic: offers the next three weekdays after the current date.
 */
export function slotsForEvent(eventId: string, count = 3): AppointmentSlot[] {
  const event = getScheduledEvent(eventId)
  const anchor = event?.dateIso ?? DEMO_TODAY_ISO
  const slots: AppointmentSlot[] = []
  let offset = 1

  while (slots.length < count && offset < 30) {
    const iso = addDays(anchor, offset)
    const dow = new Date(iso).getUTCDay()
    if (dow !== 0 && dow !== 6) {
      slots.push({
        id: `${eventId}::${iso}`,
        date: formatDisplayDate(iso),
        dateIso: iso,
        time: SLOT_TIMES[slots.length % SLOT_TIMES.length],
        available: true,
      })
    }
    offset++
  }
  return slots
}

export interface RescheduleResult {
  ok: boolean
  event?: ScheduledEvent
  error?: string
}

/** Applies a reschedule after validating the target date. */
export function rescheduleEvent(eventId: string, targetIso: string): RescheduleResult {
  const event = getScheduledEvent(eventId)
  if (!event) return { ok: false, error: 'That appointment could not be found.' }
  if (!event.rescheduleable) return { ok: false, error: 'That appointment cannot be rescheduled.' }
  if (targetIso <= DEMO_TODAY_ISO) {
    return { ok: false, error: 'Pick a date in the future.' }
  }

  const dow = new Date(targetIso).getUTCDay()
  if (dow === 0 || dow === 6) {
    return { ok: false, error: 'The clinic is closed at weekends. Pick a weekday.' }
  }

  const clash = getScheduledEvents().find(
    (e) => e.id !== eventId && e.patientId === event.patientId && e.dateIso === targetIso
  )
  if (clash) {
    return { ok: false, error: `That date already has "${clash.label}" booked.` }
  }

  const updated: ScheduledEvent = {
    ...event,
    date: formatDisplayDate(targetIso),
    dateIso: targetIso,
    status: 'rescheduled',
  }
  putScheduledEvent(updated)
  return { ok: true, event: updated }
}
