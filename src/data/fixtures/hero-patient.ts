import type {
  LabPanel,
  Patient,
  ScheduledEvent,
  ScreeningRecord,
  SideEffect,
} from '@/types/clinical'

/**
 * THE HERO FIXTURE.
 *
 * This record reproduces the product mockup exactly: all five blood-count
 * values below range, those three side effects, "None found" on secondary
 * malignancy screening, and blood work / specialist check-in on 17-Sep-2026
 * and 20-Sep-2026.
 *
 * It is both the opening scene of the demo and the basis of a snapshot test,
 * so changes here are intentional changes to the reference design.
 *
 * SYNTHETIC DEMO DATA — fictional patient, illustrative values only.
 */

export const HERO_PATIENT_ID = 'DEMO-P-1042'

export const heroPatient: Patient = {
  id: HERO_PATIENT_ID,
  isSynthetic: true,
  name: 'Marisol Vance',
  age: 54,
  sex: 'F',
  diagnosis: 'Diffuse large B-cell lymphoma',
  regimen: 'R-CHOP',
  cycleNumber: 4,
  totalCycles: 6,
  startDate: '2026-05-18',
  allergies: ['Penicillin'],
  monitoringStatus: 'active',
  assignedHcpId: 'DEMO-HCP-01',
}

export const heroPanel: LabPanel = {
  id: 'DEMO-PANEL-1042-04',
  patientId: HERO_PATIENT_ID,
  title: 'Routine Blood Count',
  collectedOn: '12-Sep-2026',
  collectedOnIso: '2026-09-12',
  cycleNumber: 4,
  readings: [
    { test: 'RBC Count', value: 3.6, unit: 'M/µL', refLow: 4.2, refHigh: 5.4 },
    { test: 'Hemoglobin', value: 9.8, unit: 'g/dL', refLow: 12.0, refHigh: 15.5 },
    { test: 'Hematocrit', value: 29.5, unit: '%', refLow: 34.9, refHigh: 44.5 },
    { test: 'Platelet', value: 88, unit: 'x10³/µL', refLow: 150, refHigh: 450 },
    { test: 'WBC', value: 2.9, unit: 'x10³/µL', refLow: 4.5, refHigh: 11.0 },
  ],
}

/** Earlier cycles, so trend views have history to plot. */
export const heroPanelHistory: LabPanel[] = [
  {
    id: 'DEMO-PANEL-1042-01',
    patientId: HERO_PATIENT_ID,
    title: 'Routine Blood Count',
    collectedOn: '18-May-2026',
    collectedOnIso: '2026-05-18',
    cycleNumber: 1,
    readings: [
      { test: 'RBC Count', value: 4.55, unit: 'M/µL', refLow: 4.2, refHigh: 5.4 },
      { test: 'Hemoglobin', value: 13.2, unit: 'g/dL', refLow: 12.0, refHigh: 15.5 },
      { test: 'Hematocrit', value: 39.8, unit: '%', refLow: 34.9, refHigh: 44.5 },
      { test: 'Platelet', value: 268, unit: 'x10³/µL', refLow: 150, refHigh: 450 },
      { test: 'WBC', value: 6.4, unit: 'x10³/µL', refLow: 4.5, refHigh: 11.0 },
    ],
  },
  {
    id: 'DEMO-PANEL-1042-02',
    patientId: HERO_PATIENT_ID,
    title: 'Routine Blood Count',
    collectedOn: '19-Jun-2026',
    collectedOnIso: '2026-06-19',
    cycleNumber: 2,
    readings: [
      { test: 'RBC Count', value: 4.18, unit: 'M/µL', refLow: 4.2, refHigh: 5.4 },
      { test: 'Hemoglobin', value: 11.9, unit: 'g/dL', refLow: 12.0, refHigh: 15.5 },
      { test: 'Hematocrit', value: 36.1, unit: '%', refLow: 34.9, refHigh: 44.5 },
      { test: 'Platelet', value: 194, unit: 'x10³/µL', refLow: 150, refHigh: 450 },
      { test: 'WBC', value: 4.9, unit: 'x10³/µL', refLow: 4.5, refHigh: 11.0 },
    ],
  },
  {
    id: 'DEMO-PANEL-1042-03',
    patientId: HERO_PATIENT_ID,
    title: 'Routine Blood Count',
    collectedOn: '24-Jul-2026',
    collectedOnIso: '2026-07-24',
    cycleNumber: 3,
    readings: [
      { test: 'RBC Count', value: 3.92, unit: 'M/µL', refLow: 4.2, refHigh: 5.4 },
      { test: 'Hemoglobin', value: 10.7, unit: 'g/dL', refLow: 12.0, refHigh: 15.5 },
      { test: 'Hematocrit', value: 32.4, unit: '%', refLow: 34.9, refHigh: 44.5 },
      { test: 'Platelet', value: 131, unit: 'x10³/µL', refLow: 150, refHigh: 450 },
      { test: 'WBC', value: 3.6, unit: 'x10³/µL', refLow: 4.5, refHigh: 11.0 },
    ],
  },
  heroPanel,
]

export const heroSideEffects: SideEffect[] = [
  {
    id: 'DEMO-SE-1042-01',
    patientId: HERO_PATIENT_ID,
    term: 'Headache',
    grade: 1,
    onsetDate: '2026-08-02',
    ongoing: true,
  },
  {
    id: 'DEMO-SE-1042-02',
    patientId: HERO_PATIENT_ID,
    term: 'Fatigue',
    grade: 2,
    onsetDate: '2026-06-28',
    ongoing: true,
  },
  {
    id: 'DEMO-SE-1042-03',
    patientId: HERO_PATIENT_ID,
    term: 'Mild diarrhea',
    grade: 1,
    onsetDate: '2026-08-21',
    ongoing: true,
  },
]

export const heroScreenings: ScreeningRecord[] = [
  {
    id: 'DEMO-SCR-1042-01',
    patientId: HERO_PATIENT_ID,
    type: 'Secondary Malignancies',
    lastScreenedOn: '2026-09-05',
    outcome: 'None found',
    nextDue: '2027-03-05',
  },
]

export const heroScheduledEvents: ScheduledEvent[] = [
  {
    id: 'DEMO-EVT-1042-01',
    patientId: HERO_PATIENT_ID,
    label: 'Scheduled Blood Work',
    type: 'blood-work',
    date: '17-Sep-2026',
    dateIso: '2026-09-17',
    status: 'scheduled',
    rescheduleable: true,
  },
  {
    id: 'DEMO-EVT-1042-02',
    patientId: HERO_PATIENT_ID,
    label: 'Scheduled Specialist Check-in',
    type: 'specialist-check-in',
    date: '20-Sep-2026',
    dateIso: '2026-09-20',
    status: 'scheduled',
    rescheduleable: true,
  },
]
