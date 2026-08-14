/**
 * Chat transport contract.
 *
 * This is the most important contract in the codebase. Assistant replies are
 * structured objects, never raw strings — the UI renders cards from `payload`.
 *
 * A real language model will later emit these same shapes via structured
 * output / tool calling, which is what allows the engine to be swapped without
 * touching a single component.
 */

import type {
  AlertSeverity,
  AnalyteFlag,
  AppointmentSlot,
  EvaluatedAnalyte,
} from './clinical'

export type ChatRole = 'user' | 'assistant' | 'system'

/** Where a response came from. Surfaced in the UI for honesty. */
export type Provenance = 'mock' | 'model'

/** A button rendered above a message, deep-linking into the portal. */
export interface ActionRef {
  label: string
  /** Internal route to navigate to. */
  href: string
}

/* -------------------------------------------------------------------------- */
/* Payload variants                                                            */
/* -------------------------------------------------------------------------- */

/** Bold-label / value pair, e.g. "Side Effects: Headache, fatigue". */
export interface NarrativeField {
  label: string
  value: string
}

/** A scheduled item row with its reschedule affordance. */
export interface ScheduledItemView {
  eventId: string
  label: string
  date: string
  rescheduleable: boolean
}

/** The hero card: a lab panel with flagged results and scheduled follow-ups. */
export interface LabPanelPayload {
  patientId: string
  panelId: string
  title: string
  collectedOn: string
  alert: {
    severity: AlertSeverity
    message: string
    flaggedCount: number
  } | null
  rows: Array<{
    test: string
    normalRange: string
    result: string
    flag: AnalyteFlag
  }>
  narrativeFields: NarrativeField[]
  scheduledItems: ScheduledItemView[]
}

export interface PatientCardPayload {
  patientId: string
  name: string
  age: number
  sex: 'F' | 'M'
  diagnosis: string
  regimen: string
  cycleLabel: string
  flaggedCount: number
}

export interface SlotPickerPayload {
  eventId: string
  eventLabel: string
  currentDate: string
  slots: AppointmentSlot[]
}

export interface ConfirmationPayload {
  /** Machine-readable description of what will happen if confirmed. */
  intent: 'reschedule'
  eventId: string
  summary: string
  details: NarrativeField[]
  confirmLabel: string
  cancelLabel: string
  /** Opaque data echoed back to the server on confirm. */
  commit: Record<string, string>
}

export interface ReceiptPayload {
  title: string
  message: string
  details: NarrativeField[]
}

export interface TrendPayload {
  analyte: string
  unit: string
  refLow: number
  refHigh: number
  points: Array<{ label: string; value: number; flag: AnalyteFlag }>
}

export interface ListPayload {
  title: string
  items: Array<{ primary: string; secondary?: string; badge?: string; href?: string }>
}

export type ChatPayload =
  | { type: 'lab_panel'; data: LabPanelPayload }
  | { type: 'patient_card'; data: PatientCardPayload }
  | { type: 'slot_picker'; data: SlotPickerPayload }
  | { type: 'confirmation'; data: ConfirmationPayload }
  | { type: 'receipt'; data: ReceiptPayload }
  | { type: 'trend'; data: TrendPayload }
  | { type: 'list'; data: ListPayload }

/* -------------------------------------------------------------------------- */
/* Messages                                                                    */
/* -------------------------------------------------------------------------- */

export interface ChatMessage {
  id: string
  role: ChatRole
  /** Optional lead-in prose shown above any payload. */
  text?: string
  actionBar?: ActionRef[]
  payload?: ChatPayload
  followUps?: string[]
  provenance?: Provenance
  createdAt: string
}

/** Context the panel passes so the engine knows what the user is looking at. */
export interface ChatContext {
  route: string
  patientId?: string
  /** Set when the user clicks a button inside a card rather than typing. */
  action?: {
    kind: 'reschedule' | 'select-slot' | 'confirm' | 'cancel'
    eventId?: string
    slotId?: string
    commit?: Record<string, string>
  }
}

export interface ChatRequest {
  message: string
  context: ChatContext
  sessionId: string
}

export interface ChatResponse {
  message: ChatMessage
}

/** Contract every engine must satisfy — mock today, a real model later. */
export interface AIProvider {
  readonly name: Provenance
  respond(request: ChatRequest): Promise<ChatMessage>
}

/** Helper for evaluated analytes crossing into a payload. */
export type { EvaluatedAnalyte }
