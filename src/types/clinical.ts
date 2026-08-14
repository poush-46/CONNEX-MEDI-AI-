/**
 * Clinical domain types.
 *
 * All data in this application is synthetic. See src/data/ — every patient
 * record carries `isSynthetic: true` and IDs are prefixed `DEMO-`.
 */

/** Result of comparing a measured value against its reference range. */
export type AnalyteFlag = 'low' | 'high' | 'normal'

/** A single measured analyte within a lab panel, before flag evaluation. */
export interface AnalyteReading {
  /** Display name, e.g. "Hemoglobin". */
  test: string
  value: number
  unit: string
  refLow: number
  refHigh: number
}

/** An analyte reading with its computed flag and display strings. */
export interface EvaluatedAnalyte extends AnalyteReading {
  flag: AnalyteFlag
  /** e.g. "12.0 – 15.5 g/dL" */
  displayRange: string
  /** e.g. "9.80 g/dL" */
  displayResult: string
}

/** Severity of the aggregate banner shown above a panel's table. */
export type AlertSeverity = 'critical' | 'warning' | 'info' | 'none'

export interface PanelAlert {
  severity: AlertSeverity
  /** e.g. "All 5 values are below the normal reference range" */
  message: string
  flaggedCount: number
}

/** A lab panel as stored in the demo dataset. */
export interface LabPanel {
  id: string
  patientId: string
  /** e.g. "Routine Blood Count" */
  title: string
  /** Display format DD-MMM-YYYY, e.g. "12-Sep-2026". */
  collectedOn: string
  /** ISO date, used for sorting. */
  collectedOnIso: string
  cycleNumber: number
  readings: AnalyteReading[]
}

/** A logged treatment side effect. */
export interface SideEffect {
  id: string
  patientId: string
  term: string
  grade: 1 | 2 | 3 | 4
  onsetDate: string
  ongoing: boolean
}

/** A surveillance screening record, e.g. secondary malignancies. */
export interface ScreeningRecord {
  id: string
  patientId: string
  type: string
  lastScreenedOn: string
  outcome: string
  nextDue: string
}

export type ScheduledEventType = 'blood-work' | 'specialist-check-in' | 'infusion' | 'imaging'
export type ScheduledEventStatus = 'scheduled' | 'rescheduled' | 'cancelled' | 'completed'

/** An upcoming monitoring appointment. */
export interface ScheduledEvent {
  id: string
  patientId: string
  /** e.g. "Scheduled Blood Work" */
  label: string
  type: ScheduledEventType
  /** Display format DD-MMM-YYYY. */
  date: string
  /** ISO date, used for sorting and validation. */
  dateIso: string
  status: ScheduledEventStatus
  rescheduleable: boolean
}

/** A bookable slot offered by the reschedule flow. */
export interface AppointmentSlot {
  id: string
  date: string
  dateIso: string
  time: string
  available: boolean
}

export interface Patient {
  id: string
  isSynthetic: true
  name: string
  age: number
  sex: 'F' | 'M'
  diagnosis: string
  regimen: string
  cycleNumber: number
  totalCycles: number
  startDate: string
  allergies: string[]
  monitoringStatus: 'active' | 'on-hold' | 'surveillance'
  assignedHcpId: string
}

/** Everything the Clinical Monitoring screen and the lab-panel chat flow need. */
export interface MonitoringSnapshot {
  patient: Patient
  latestPanel: LabPanel
  panelHistory: LabPanel[]
  sideEffects: SideEffect[]
  screenings: ScreeningRecord[]
  scheduledEvents: ScheduledEvent[]
}

export interface HcpPersona {
  id: string
  name: string
  credentials: string
  specialty: string
  institution: string
  initials: string
}
