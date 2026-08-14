import type { LabPanel, MonitoringSnapshot, Patient } from '@/types/clinical'
import { LAB_PANELS, PATIENTS, SCREENINGS, SIDE_EFFECTS } from '@/data/patients'
import { evaluatePanel } from '@/lib/clinical/evaluate-analyte'
import { getScheduledEvents } from '@/lib/store/demo-store'

/**
 * Data access for patients and monitoring.
 *
 * SWAP POINT: this module is the only thing that knows data comes from
 * in-memory fixtures. Swapping in Postgres means reimplementing these
 * functions — nothing above this layer changes.
 */

export function listPatients(options: {
  query?: string
  flaggedOnly?: boolean
  limit?: number
} = {}): Array<Patient & { flaggedCount: number; latestPanelDate: string | null }> {
  const { query, flaggedOnly, limit } = options
  const q = query?.trim().toLowerCase()

  let rows = PATIENTS.map((p) => {
    const latest = latestPanelFor(p.id)
    const flaggedCount = latest
      ? evaluatePanel(latest.readings).filter((a) => a.flag !== 'normal').length
      : 0
    return { ...p, flaggedCount, latestPanelDate: latest?.collectedOn ?? null }
  })

  if (q) {
    rows = rows.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.diagnosis.toLowerCase().includes(q) ||
        p.regimen.toLowerCase().includes(q)
    )
  }
  if (flaggedOnly) rows = rows.filter((p) => p.flaggedCount > 0)

  rows.sort((a, b) => b.flaggedCount - a.flaggedCount || a.name.localeCompare(b.name))
  return typeof limit === 'number' ? rows.slice(0, limit) : rows
}

export function getPatient(id: string): Patient | undefined {
  return PATIENTS.find((p) => p.id === id)
}

/** Case-insensitive name/id search used by the chat engine. */
export function findPatientsByName(term: string): Patient[] {
  const q = term.trim().toLowerCase()
  if (!q) return []
  return PATIENTS.filter(
    (p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase() === q
  )
}

export function panelsFor(patientId: string): LabPanel[] {
  return LAB_PANELS.filter((p) => p.patientId === patientId).sort((a, b) =>
    a.collectedOnIso.localeCompare(b.collectedOnIso)
  )
}

export function latestPanelFor(patientId: string): LabPanel | undefined {
  const panels = panelsFor(patientId)
  return panels[panels.length - 1]
}

export function getPanel(panelId: string): LabPanel | undefined {
  return LAB_PANELS.find((p) => p.id === panelId)
}

export function getMonitoringSnapshot(patientId: string): MonitoringSnapshot | undefined {
  const patient = getPatient(patientId)
  if (!patient) return undefined
  const panelHistory = panelsFor(patientId)
  const latestPanel = panelHistory[panelHistory.length - 1]
  if (!latestPanel) return undefined

  return {
    patient,
    latestPanel,
    panelHistory,
    sideEffects: SIDE_EFFECTS.filter((s) => s.patientId === patientId),
    screenings: SCREENINGS.filter((s) => s.patientId === patientId),
    scheduledEvents: getScheduledEvents()
      .filter((e) => e.patientId === patientId && e.status !== 'cancelled')
      .sort((a, b) => a.dateIso.localeCompare(b.dateIso)),
  }
}
