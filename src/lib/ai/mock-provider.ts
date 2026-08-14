import type { AIProvider, ChatMessage, ChatRequest } from '@/types/chat'
import { HERO_PATIENT_ID } from '@/data/fixtures/hero-patient'
import { GLOSSARY } from '@/data/glossary'
import { evaluatePanel } from '@/lib/clinical/evaluate-analyte'
import { describeFlagged } from '@/lib/clinical/summarise-panel'
import {
  findPatientsByName,
  getMonitoringSnapshot,
  listPatients,
} from '@/lib/repositories/patients'
import { getEvent, rescheduleEvent, slotsForEvent } from '@/lib/repositories/appointments'
import { classify } from './intents/classify'
import { buildLabPanelPayload, buildTrendPayload, resolveAnalyte } from './payloads'

/**
 * Deterministic offline chat engine.
 *
 * Produces the same structured payloads a real model will later emit, so the
 * UI is already built against the final contract. No network, no API key.
 *
 * Guardrails are real, not decorative: adverse-event mentions and requests for
 * clinical decisions short-circuit before any informational handler runs.
 */

let counter = 0
function messageId(): string {
  counter += 1
  return `msg_${Date.now().toString(36)}_${counter}`
}

function reply(partial: Omit<ChatMessage, 'id' | 'role' | 'createdAt' | 'provenance'>): ChatMessage {
  return {
    id: messageId(),
    role: 'assistant',
    provenance: 'mock',
    createdAt: new Date().toISOString(),
    ...partial,
  }
}

const MONITORING_ACTION = (patientId: string) => ({
  label: 'View Clinical Monitoring',
  href: `/patients/${patientId}/monitoring`,
})

export class MockProvider implements AIProvider {
  readonly name = 'mock' as const

  async respond(request: ChatRequest): Promise<ChatMessage> {
    const { message, context } = request

    // ----- Card button actions take priority over free text -----------------
    if (context.action) return this.handleAction(request)

    const { intent } = classify(message)
    const patientId = context.patientId ?? this.inferPatient(message)

    switch (intent) {
      case 'adverse_event':
        return this.adverseEvent()
      case 'clinical_decision':
        return this.clinicalDecision()
      case 'greeting':
      case 'capability':
        return this.greeting(patientId)
      case 'reset':
        return reply({
          text: 'Conversation cleared. What would you like to look at?',
          followUps: this.defaultPrompts(patientId),
        })
      case 'lab_panel':
        return this.labPanel(patientId)
      case 'trend':
        return this.trend(patientId, message)
      case 'side_effects':
        return this.sideEffects(patientId)
      case 'screening':
        return this.screening(patientId)
      case 'schedule_view':
        return this.schedule(patientId)
      case 'patient_summary':
        return this.summary(patientId)
      case 'patient_lookup':
        return this.lookup(message)
      case 'cohort_flagged':
        return this.cohort()
      case 'glossary':
        return this.glossary(message, patientId)
      case 'navigate_monitoring':
        return patientId
          ? reply({
              text: 'Opening clinical monitoring.',
              actionBar: [MONITORING_ACTION(patientId)],
            })
          : this.needPatient()
      default:
        return this.fallback(patientId)
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Actions triggered from inside a card                                    */
  /* ---------------------------------------------------------------------- */

  private handleAction(request: ChatRequest): ChatMessage {
    const action = request.context.action!

    if (action.kind === 'cancel') {
      return reply({ text: 'No changes made. Anything else?' })
    }

    if (action.kind === 'reschedule' && action.eventId) {
      const event = getEvent(action.eventId)
      if (!event) return reply({ text: 'I could not find that appointment.' })
      const slots = slotsForEvent(action.eventId)
      return reply({
        text: `Here are the next available slots for ${event.label.toLowerCase()}.`,
        payload: {
          type: 'slot_picker',
          data: {
            eventId: event.id,
            eventLabel: event.label,
            currentDate: event.date,
            slots,
          },
        },
      })
    }

    if (action.kind === 'select-slot' && action.eventId && action.slotId) {
      const event = getEvent(action.eventId)
      if (!event) return reply({ text: 'I could not find that appointment.' })
      const targetIso = action.slotId.split('::')[1]
      const slot = slotsForEvent(action.eventId).find((s) => s.id === action.slotId)
      if (!slot) return reply({ text: 'That slot is no longer available.' })

      // Always confirm before writing.
      return reply({
        payload: {
          type: 'confirmation',
          data: {
            intent: 'reschedule',
            eventId: event.id,
            summary: `Move ${event.label.toLowerCase()} to ${slot.date}?`,
            details: [
              { label: 'Currently', value: event.date },
              { label: 'New date', value: `${slot.date} at ${slot.time}` },
            ],
            confirmLabel: 'Confirm change',
            cancelLabel: 'Keep original',
            commit: { eventId: event.id, targetIso },
          },
        },
      })
    }

    if (action.kind === 'confirm' && action.commit) {
      const { eventId, targetIso } = action.commit
      const result = rescheduleEvent(eventId, targetIso)
      if (!result.ok || !result.event) {
        return reply({ text: result.error ?? 'That change could not be applied.' })
      }
      return reply({
        payload: {
          type: 'receipt',
          data: {
            title: 'Appointment updated',
            message: `${result.event.label} has been moved.`,
            details: [{ label: 'New date', value: result.event.date }],
          },
        },
        followUps: ['Show the latest blood count', 'What else is scheduled?'],
      })
    }

    return reply({ text: 'I could not complete that action.' })
  }

  /* ---------------------------------------------------------------------- */
  /* Safety guardrails                                                       */
  /* ---------------------------------------------------------------------- */

  private adverseEvent(): ChatMessage {
    return reply({
      text:
        'It sounds like you may be describing an adverse event. I am not able to assess or ' +
        'triage that here.\n\nPlease report it through your organisation’s pharmacovigilance ' +
        'process so it reaches the safety team. If this is a medical emergency, contact ' +
        'emergency services immediately.',
      followUps: ['What can you help with?'],
    })
  }

  private clinicalDecision(): ChatMessage {
    return reply({
      text:
        'I can’t advise on treatment decisions — this is a demonstration assistant working on ' +
        'synthetic records, and clinical judgement stays with you.\n\nI can show you the ' +
        'underlying information instead: recent results, trends over cycles, logged side ' +
        'effects, or the monitoring schedule.',
      followUps: ['Show the latest blood count', 'Show hemoglobin over time'],
    })
  }

  /* ---------------------------------------------------------------------- */
  /* Informational flows                                                     */
  /* ---------------------------------------------------------------------- */

  private greeting(patientId?: string): ChatMessage {
    return reply({
      text:
        'I’m Connex. I can pull up monitoring results, show how values are trending, review ' +
        'logged side effects, and reschedule upcoming appointments.',
      followUps: this.defaultPrompts(patientId),
    })
  }

  private labPanel(patientId?: string): ChatMessage {
    if (!patientId) return this.needPatient()
    const snapshot = getMonitoringSnapshot(patientId)
    if (!snapshot) return reply({ text: 'I have no monitoring data for that patient.' })

    const analytes = evaluatePanel(snapshot.latestPanel.readings)
    const flaggedCount = analytes.filter((a) => a.flag !== 'normal').length

    return reply({
      text:
        flaggedCount > 0
          ? `Latest panel for ${snapshot.patient.name}, collected ${snapshot.latestPanel.collectedOn}. ${describeFlagged(analytes)}`
          : `Latest panel for ${snapshot.patient.name}, collected ${snapshot.latestPanel.collectedOn}. All values are within range.`,
      actionBar: [MONITORING_ACTION(patientId)],
      payload: { type: 'lab_panel', data: buildLabPanelPayload(snapshot) },
      followUps: ['Show hemoglobin over time', 'Any new side effects?'],
    })
  }

  private trend(patientId: string | undefined, message: string): ChatMessage {
    if (!patientId) return this.needPatient()
    const snapshot = getMonitoringSnapshot(patientId)
    if (!snapshot) return reply({ text: 'I have no monitoring data for that patient.' })

    const analyte = resolveAnalyte(message) ?? 'Hemoglobin'
    const payload = buildTrendPayload(snapshot, analyte)
    if (!payload) return reply({ text: `I have no recorded history for ${analyte}.` })

    const first = payload.points[0]
    const last = payload.points[payload.points.length - 1]
    const direction = last.value < first.value ? 'declined' : last.value > first.value ? 'risen' : 'held steady'

    return reply({
      text: `${analyte} has ${direction} from ${first.value} to ${last.value} ${payload.unit} across ${payload.points.length} cycles.`,
      actionBar: [MONITORING_ACTION(patientId)],
      payload: { type: 'trend', data: payload },
      followUps: ['Show the full blood count', 'Show platelet over time'],
    })
  }

  private sideEffects(patientId?: string): ChatMessage {
    if (!patientId) return this.needPatient()
    const snapshot = getMonitoringSnapshot(patientId)
    if (!snapshot) return reply({ text: 'I have no data for that patient.' })

    const items = snapshot.sideEffects.map((s) => ({
      primary: s.term,
      secondary: `Grade ${s.grade} · onset ${s.onsetDate} · ${s.ongoing ? 'ongoing' : 'resolved'}`,
      badge: s.ongoing ? 'Ongoing' : 'Resolved',
    }))

    if (items.length === 0) return reply({ text: 'No side effects have been logged.' })

    return reply({
      text: `${snapshot.sideEffects.filter((s) => s.ongoing).length} ongoing of ${items.length} logged.`,
      payload: { type: 'list', data: { title: 'Logged side effects', items } },
      followUps: ['Show the latest blood count'],
    })
  }

  private screening(patientId?: string): ChatMessage {
    if (!patientId) return this.needPatient()
    const snapshot = getMonitoringSnapshot(patientId)
    if (!snapshot) return reply({ text: 'I have no data for that patient.' })

    const items = snapshot.screenings.map((s) => ({
      primary: s.type,
      secondary: `Last screened ${s.lastScreenedOn} · next due ${s.nextDue}`,
      badge: s.outcome,
    }))
    if (items.length === 0) return reply({ text: 'No screening records on file.' })

    return reply({
      payload: { type: 'list', data: { title: 'Screening status', items } },
    })
  }

  private schedule(patientId?: string): ChatMessage {
    if (!patientId) return this.needPatient()
    const snapshot = getMonitoringSnapshot(patientId)
    if (!snapshot) return reply({ text: 'I have no data for that patient.' })
    if (snapshot.scheduledEvents.length === 0) {
      return reply({ text: 'Nothing is currently scheduled.' })
    }

    return reply({
      text: `${snapshot.scheduledEvents.length} upcoming for ${snapshot.patient.name}.`,
      payload: {
        type: 'lab_panel',
        data: {
          ...buildLabPanelPayload(snapshot),
          // Schedule-focused view: keep the card but lead with the dates.
        },
      },
      followUps: ['Reschedule the blood work'],
    })
  }

  private summary(patientId?: string): ChatMessage {
    if (!patientId) return this.needPatient()
    const snapshot = getMonitoringSnapshot(patientId)
    if (!snapshot) return reply({ text: 'I have no data for that patient.' })

    const { patient } = snapshot
    const analytes = evaluatePanel(snapshot.latestPanel.readings)
    const ongoing = snapshot.sideEffects.filter((s) => s.ongoing)

    return reply({
      text:
        `${patient.name}, ${patient.age}${patient.sex}, ${patient.diagnosis}. ` +
        `On ${patient.regimen}, cycle ${patient.cycleNumber} of ${patient.totalCycles}.\n\n` +
        `Latest panel ${snapshot.latestPanel.collectedOn}: ${describeFlagged(analytes)}\n` +
        `Ongoing side effects: ${ongoing.length > 0 ? ongoing.map((s) => s.term).join(', ') : 'none'}.\n` +
        `Next scheduled: ${snapshot.scheduledEvents[0]?.label ?? 'nothing'} on ${snapshot.scheduledEvents[0]?.date ?? '—'}.`,
      actionBar: [MONITORING_ACTION(patientId)],
      followUps: ['Show the blood count', 'Any new side effects?'],
    })
  }

  private lookup(message: string): ChatMessage {
    const cleaned = message
      .replace(/\b(show|open|find|pull up|look up|me|the|patient|record|for)\b/gi, ' ')
      .trim()
    const matches = findPatientsByName(cleaned)

    if (matches.length === 0) {
      return reply({
        text: 'I could not find a patient matching that. Try a surname, or browse the patient list.',
        actionBar: [{ label: 'Open patient list', href: '/patients' }],
      })
    }

    if (matches.length === 1) {
      const p = matches[0]
      const snapshot = getMonitoringSnapshot(p.id)
      const flagged = snapshot
        ? evaluatePanel(snapshot.latestPanel.readings).filter((a) => a.flag !== 'normal').length
        : 0
      return reply({
        actionBar: [MONITORING_ACTION(p.id)],
        payload: {
          type: 'patient_card',
          data: {
            patientId: p.id,
            name: p.name,
            age: p.age,
            sex: p.sex,
            diagnosis: p.diagnosis,
            regimen: p.regimen,
            cycleLabel: `Cycle ${p.cycleNumber} of ${p.totalCycles}`,
            flaggedCount: flagged,
          },
        },
        followUps: ['Show their latest blood count'],
      })
    }

    return reply({
      text: `${matches.length} patients match. Which did you mean?`,
      payload: {
        type: 'list',
        data: {
          title: 'Matching patients',
          items: matches.slice(0, 6).map((p) => ({
            primary: p.name,
            secondary: `${p.diagnosis} · ${p.regimen}`,
            href: `/patients/${p.id}/monitoring`,
          })),
        },
      },
    })
  }

  private cohort(): ChatMessage {
    const flagged = listPatients({ flaggedOnly: true, limit: 6 })
    const total = listPatients({ flaggedOnly: true }).length

    return reply({
      text: `${total} patients have at least one value outside range on their latest panel.`,
      actionBar: [{ label: 'Open patient list', href: '/patients' }],
      payload: {
        type: 'list',
        data: {
          title: 'Patients needing attention',
          items: flagged.map((p) => ({
            primary: p.name,
            secondary: `${p.diagnosis} · ${p.regimen}`,
            badge: `${p.flaggedCount} flagged`,
            href: `/patients/${p.id}/monitoring`,
          })),
        },
      },
    })
  }

  private glossary(message: string, patientId?: string): ChatMessage {
    const lower = message.toLowerCase()
    const entry = GLOSSARY.find((g) => lower.includes(g.term.toLowerCase()))
    if (!entry) return this.fallback(patientId)
    return reply({
      text: `**${entry.term}** — ${entry.definition}`,
      followUps: ['Show the latest blood count'],
    })
  }

  /* ---------------------------------------------------------------------- */
  /* Fallbacks                                                               */
  /* ---------------------------------------------------------------------- */

  private needPatient(): ChatMessage {
    return reply({
      text: 'Open a patient first, or tell me who you mean — for example “show me Marisol Vance”.',
      actionBar: [{ label: 'Open patient list', href: '/patients' }],
      followUps: ['Who has flagged results?'],
    })
  }

  private fallback(patientId?: string): ChatMessage {
    return reply({
      text: 'I’m not sure how to help with that yet. Here’s what I can do:',
      payload: {
        type: 'list',
        data: {
          title: 'Try asking',
          items: [
            { primary: 'Show the latest blood count', secondary: 'Full panel with flagged values' },
            { primary: 'Show hemoglobin over time', secondary: 'Trend across treatment cycles' },
            { primary: 'Any new side effects?', secondary: 'Logged toxicities and grades' },
            { primary: 'Who has flagged results?', secondary: 'Across the whole cohort' },
          ],
        },
      },
      followUps: this.defaultPrompts(patientId),
    })
  }

  private defaultPrompts(patientId?: string): string[] {
    return patientId
      ? ['Show the latest blood count', 'Any new side effects?', 'What’s scheduled next?']
      : ['Who has flagged results?', 'Show me Marisol Vance', 'What can you do?']
  }

  private inferPatient(message: string): string | undefined {
    const idMatch = message.match(/DEMO-P-\d+/i)
    if (idMatch) return idMatch[0].toUpperCase()
    const named = findPatientsByName(message.replace(/\b(show|me|the|patient)\b/gi, ' ').trim())
    if (named.length === 1) return named[0].id
    // Demo convenience: with no context at all, the hero patient is the subject.
    return undefined
  }
}

export { HERO_PATIENT_ID }
