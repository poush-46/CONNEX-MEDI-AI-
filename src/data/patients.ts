import type {
  LabPanel,
  Patient,
  ScheduledEvent,
  ScreeningRecord,
  SideEffect,
} from '@/types/clinical'
import { formatDisplayDate } from '@/lib/utils/date'
import { BLOOD_COUNT_RANGES } from './reference-ranges'
import { createRng, rngFloat, rngInt, rngPick } from './seed'
import {
  heroPanelHistory,
  heroPatient,
  heroScheduledEvents,
  heroScreenings,
  heroSideEffects,
} from './fixtures/hero-patient'

/**
 * Synthetic oncology / haematology cohort.
 *
 * Generated from a fixed seed so every run produces an identical dataset.
 * The hero patient (see fixtures/hero-patient.ts) is prepended unchanged.
 *
 * SYNTHETIC DEMO DATA — fictional people, illustrative values only.
 * Not clinical guidance. Never to be interpreted as real patient records.
 */

const FIRST_NAMES = [
  'Priya', 'Tomas', 'Ingrid', 'Nadia', 'Owen', 'Selma', 'Kofi', 'Rosa',
  'Emeka', 'Yuki', 'Dmitri', 'Farah', 'Callum', 'Beatriz', 'Hassan', 'Lucia',
  'Anders', 'Mira', 'Jonah', 'Aiko', 'Rafael', 'Noor', 'Elena', 'Bruno',
  'Sasha', 'Idris', 'Greta', 'Malik', 'Wren', 'Otto', 'Zara', 'Pia',
] as const

const LAST_NAMES = [
  'Halloran', 'Nkemdirim', 'Bergström', 'Castellanos', 'Whitfield', 'Adeyemi',
  'Kowalski', 'Fontaine', 'Marchetti', 'Sørensen', 'Okafor', 'Lindqvist',
  'Villanueva', 'Draganov', 'Achebe', 'Rosenthal', 'Moreau', 'Tanaka',
  'Barros', 'Vukovic', 'Ferreira', 'Novak', 'Delacroix', 'Ibarra',
] as const

const DIAGNOSES = [
  'Diffuse large B-cell lymphoma',
  'Hodgkin lymphoma',
  'Multiple myeloma',
  'Chronic lymphocytic leukaemia',
  'Acute myeloid leukaemia',
  'Follicular lymphoma',
] as const

const REGIMENS = ['R-CHOP', 'ABVD', 'VRd', 'FCR', 'CHOP', 'BR'] as const

const SIDE_EFFECT_TERMS = [
  'Fatigue', 'Nausea', 'Headache', 'Peripheral neuropathy', 'Mild diarrhea',
  'Mucositis', 'Appetite loss', 'Myalgia', 'Insomnia',
] as const

const EVENT_TEMPLATES: Array<{ label: string; type: ScheduledEvent['type'] }> = [
  { label: 'Scheduled Blood Work', type: 'blood-work' },
  { label: 'Scheduled Specialist Check-in', type: 'specialist-check-in' },
  { label: 'Scheduled Infusion', type: 'infusion' },
  { label: 'Scheduled Imaging', type: 'imaging' },
]

/** Anchor date for the demo timeline, aligned with the mockup's Sept 2026. */
const TODAY_ISO = '2026-09-14'

interface GeneratedPatient {
  patient: Patient
  panels: LabPanel[]
  sideEffects: SideEffect[]
  screenings: ScreeningRecord[]
  events: ScheduledEvent[]
}

function isoAddDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function generatePatient(index: number): GeneratedPatient {
  const next = createRng(9000 + index * 137)
  const id = `DEMO-P-${1100 + index * 7}`
  const name = `${rngPick(next, FIRST_NAMES)} ${rngPick(next, LAST_NAMES)}`
  const totalCycles = rngPick(next, [4, 6, 8])
  const cycleNumber = rngInt(next, 1, totalCycles)
  // Depletion deepens with cycle number, so later cycles show more flags.
  const depletion = (cycleNumber / totalCycles) * rngFloat(next, 0.45, 1.0)

  const startDate = isoAddDays(TODAY_ISO, -(cycleNumber * 28 + rngInt(next, 2, 20)))

  const patient: Patient = {
    id,
    isSynthetic: true,
    name,
    age: rngInt(next, 29, 79),
    sex: next() > 0.5 ? 'F' : 'M',
    diagnosis: rngPick(next, DIAGNOSES),
    regimen: rngPick(next, REGIMENS),
    cycleNumber,
    totalCycles,
    startDate,
    allergies: next() > 0.7 ? [rngPick(next, ['Penicillin', 'Sulfa drugs', 'Latex'])] : [],
    monitoringStatus: rngPick(next, ['active', 'active', 'active', 'surveillance', 'on-hold']),
    assignedHcpId: rngPick(next, ['DEMO-HCP-01', 'DEMO-HCP-02', 'DEMO-HCP-03']),
  }

  // Build one panel per completed cycle.
  const panels: LabPanel[] = []
  for (let c = 1; c <= cycleNumber; c++) {
    const progress = (c / totalCycles) * depletion
    const collectedOnIso = isoAddDays(startDate, (c - 1) * 28 + 2)
    panels.push({
      id: `DEMO-PANEL-${id.slice(-4)}-${String(c).padStart(2, '0')}`,
      patientId: id,
      title: 'Routine Blood Count',
      collectedOn: formatDisplayDate(collectedOnIso),
      collectedOnIso,
      cycleNumber: c,
      readings: BLOOD_COUNT_RANGES.map((r) => {
        const span = r.refHigh - r.refLow
        // Start mid-range, drift downward as treatment progresses.
        const baseline = r.refLow + span * rngFloat(next, 0.45, 0.85)
        const value = baseline - span * progress * rngFloat(next, 0.6, 1.35)
        return {
          test: r.test,
          value: Number(Math.max(value, r.refLow * 0.35).toFixed(r.resultDp)),
          unit: r.unit,
          refLow: r.refLow,
          refHigh: r.refHigh,
        }
      }),
    })
  }

  const sideEffectCount = rngInt(next, 1, 4)
  const usedTerms = new Set<string>()
  const sideEffects: SideEffect[] = []
  for (let i = 0; i < sideEffectCount; i++) {
    const term = rngPick(next, SIDE_EFFECT_TERMS)
    if (usedTerms.has(term)) continue
    usedTerms.add(term)
    sideEffects.push({
      id: `DEMO-SE-${id.slice(-4)}-${String(i + 1).padStart(2, '0')}`,
      patientId: id,
      term,
      grade: rngPick(next, [1, 1, 2, 2, 3]) as SideEffect['grade'],
      onsetDate: isoAddDays(startDate, rngInt(next, 5, 60)),
      ongoing: next() > 0.35,
    })
  }

  const lastScreenedOn = isoAddDays(TODAY_ISO, -rngInt(next, 10, 120))
  const screenings: ScreeningRecord[] = [
    {
      id: `DEMO-SCR-${id.slice(-4)}-01`,
      patientId: id,
      type: 'Secondary Malignancies',
      lastScreenedOn,
      outcome: 'None found',
      nextDue: isoAddDays(lastScreenedOn, 180),
    },
  ]

  const eventCount = rngInt(next, 2, 3)
  const events: ScheduledEvent[] = []
  for (let i = 0; i < eventCount; i++) {
    const template = EVENT_TEMPLATES[i % EVENT_TEMPLATES.length]
    const dateIso = isoAddDays(TODAY_ISO, rngInt(next, 3, 45))
    events.push({
      id: `DEMO-EVT-${id.slice(-4)}-${String(i + 1).padStart(2, '0')}`,
      patientId: id,
      label: template.label,
      type: template.type,
      date: formatDisplayDate(dateIso),
      dateIso,
      status: 'scheduled',
      rescheduleable: true,
    })
  }

  return { patient, panels, sideEffects, screenings, events }
}

const GENERATED: GeneratedPatient[] = Array.from({ length: 23 }, (_, i) => generatePatient(i))

/** The hero patient always leads the cohort. */
const HERO: GeneratedPatient = {
  patient: heroPatient,
  panels: heroPanelHistory,
  sideEffects: heroSideEffects,
  screenings: heroScreenings,
  events: heroScheduledEvents,
}

export const ALL: GeneratedPatient[] = [HERO, ...GENERATED]

export const PATIENTS: Patient[] = ALL.map((g) => g.patient)
export const LAB_PANELS: LabPanel[] = ALL.flatMap((g) => g.panels)
export const SIDE_EFFECTS: SideEffect[] = ALL.flatMap((g) => g.sideEffects)
export const SCREENINGS: ScreeningRecord[] = ALL.flatMap((g) => g.screenings)
export const SCHEDULED_EVENTS: ScheduledEvent[] = ALL.flatMap((g) => g.events)
export const DEMO_TODAY_ISO = TODAY_ISO
