import type { LabPanelPayload, TrendPayload } from '@/types/chat'
import type { MonitoringSnapshot } from '@/types/clinical'
import { evaluatePanel } from '@/lib/clinical/evaluate-analyte'
import { summarisePanel } from '@/lib/clinical/summarise-panel'

/**
 * Payload builders.
 *
 * These translate domain objects into the wire shapes the UI renders.
 * Flags and the alert banner come from lib/clinical — never hand-written —
 * so the chat card and the full-screen table always agree.
 */

export function buildLabPanelPayload(snapshot: MonitoringSnapshot): LabPanelPayload {
  const { latestPanel, sideEffects, screenings, scheduledEvents, patient } = snapshot
  const analytes = evaluatePanel(latestPanel.readings)
  const alert = summarisePanel(analytes)

  const ongoing = sideEffects.filter((s) => s.ongoing).map((s) => s.term)
  const sideEffectText = ongoing.length > 0 ? ongoing.join(', ') : 'None reported'

  const malignancy = screenings.find((s) => s.type === 'Secondary Malignancies')

  return {
    patientId: patient.id,
    panelId: latestPanel.id,
    title: latestPanel.title,
    collectedOn: latestPanel.collectedOn,
    alert,
    rows: analytes.map((a) => ({
      test: a.test,
      normalRange: a.displayRange,
      result: a.displayResult,
      flag: a.flag,
    })),
    narrativeFields: [
      { label: 'Side Effects', value: sideEffectText },
      { label: 'Secondary Malignancies', value: malignancy?.outcome ?? 'Not screened' },
    ],
    scheduledItems: scheduledEvents.slice(0, 3).map((e) => ({
      eventId: e.id,
      label: e.label,
      date: e.date,
      rescheduleable: e.rescheduleable,
    })),
  }
}

const ANALYTE_ALIASES: Record<string, string> = {
  hemoglobin: 'Hemoglobin',
  haemoglobin: 'Hemoglobin',
  hb: 'Hemoglobin',
  platelet: 'Platelet',
  platelets: 'Platelet',
  wbc: 'WBC',
  'white cell': 'WBC',
  rbc: 'RBC Count',
  'red cell': 'RBC Count',
  hematocrit: 'Hematocrit',
  haematocrit: 'Hematocrit',
}

/** Resolves a free-text analyte mention to its canonical test name. */
export function resolveAnalyte(text: string): string | null {
  const lower = text.toLowerCase()
  for (const [alias, canonical] of Object.entries(ANALYTE_ALIASES)) {
    if (lower.includes(alias)) return canonical
  }
  return null
}

export function buildTrendPayload(
  snapshot: MonitoringSnapshot,
  analyteName: string
): TrendPayload | null {
  const points: TrendPayload['points'] = []
  let unit = ''
  let refLow = 0
  let refHigh = 0

  for (const panel of snapshot.panelHistory) {
    const analytes = evaluatePanel(panel.readings)
    const match = analytes.find((a) => a.test === analyteName)
    if (!match) continue
    unit = match.unit
    refLow = match.refLow
    refHigh = match.refHigh
    points.push({
      label: `Cycle ${panel.cycleNumber}`,
      value: match.value,
      flag: match.flag,
    })
  }

  if (points.length === 0) return null
  return { analyte: analyteName, unit, refLow, refHigh, points }
}
