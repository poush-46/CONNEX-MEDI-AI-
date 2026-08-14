import { NextResponse } from 'next/server'
import { getMonitoringSnapshot } from '@/lib/repositories/patients'
import { buildLabPanelPayload } from '@/lib/ai/payloads'
import { evaluatePanel } from '@/lib/clinical/evaluate-analyte'
import { summarisePanel } from '@/lib/clinical/summarise-panel'
import { simulateLatency } from '@/lib/api/latency'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const snapshot = getMonitoringSnapshot(params.id)
  if (!snapshot) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'No monitoring data for that patient.' } },
      { status: 404 }
    )
  }
  await simulateLatency()
  const analytes = evaluatePanel(snapshot.latestPanel.readings)
  return NextResponse.json({
    snapshot,
    analytes,
    alert: summarisePanel(analytes),
    card: buildLabPanelPayload(snapshot),
  })
}
