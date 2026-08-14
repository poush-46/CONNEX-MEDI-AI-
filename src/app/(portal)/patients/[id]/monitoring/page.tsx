import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMonitoringSnapshot } from '@/lib/repositories/patients'
import { evaluatePanel } from '@/lib/clinical/evaluate-analyte'
import { summarisePanel } from '@/lib/clinical/summarise-panel'
import { PageHeader } from '@/components/layout/PageHeader'
import { WarningIcon } from '@/components/common/icons'
import { cn } from '@/lib/utils/cn'

/**
 * Clinical Monitoring — the target of the assistant's
 * "View Clinical Monitoring" action.
 *
 * Renders the same underlying data as the chat card, through the same
 * lib/clinical rules, at full width.
 */
export default function MonitoringPage({ params }: { params: { id: string } }) {
  const snapshot = getMonitoringSnapshot(params.id)
  if (!snapshot) notFound()

  const { patient, latestPanel, panelHistory, sideEffects, screenings, scheduledEvents } = snapshot
  const analytes = evaluatePanel(latestPanel.readings)
  const alert = summarisePanel(analytes)

  return (
    <div className="mx-auto max-w-5xl px-5 py-6">
      <PageHeader
        title={patient.name}
        subtitle={`${patient.age}${patient.sex} · ${patient.diagnosis} · ${patient.regimen}, cycle ${patient.cycleNumber} of ${patient.totalCycles}`}
        action={
          <Link
            href="/patients"
            className="rounded-md border border-hairline bg-white px-3 py-1.5 text-[12px] font-medium text-ink-700 transition hover:bg-panel"
          >
            All patients
          </Link>
        }
      />

      {patient.allergies.length > 0 && (
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-warning-50 px-3 py-1 text-[11.5px] font-medium text-warning-600">
          Allergies: {patient.allergies.join(', ')}
        </p>
      )}

      {/* Latest panel */}
      <section className="mt-6">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[15px] font-semibold text-ink-900">{latestPanel.title}</h2>
          <span className="text-[11.5px] text-ink-500">Collected {latestPanel.collectedOn}</span>
        </div>

        {alert && (
          <div className="mt-2.5 flex items-start gap-2 rounded-md bg-danger-50 px-3 py-2.5" role="status">
            <WarningIcon className="mt-0.5 h-4 w-4 shrink-0 text-danger-600" />
            <p className="text-[12.5px] font-medium text-danger-600">{alert.message}</p>
          </div>
        )}

        <div className="mt-3 overflow-hidden rounded-card border border-hairline bg-white shadow-card">
          <table className="w-full border-collapse text-left">
            <thead className="bg-panel/60">
              <tr>
                <th scope="col" className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                  Test
                </th>
                <th scope="col" className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                  Normal Range
                </th>
                <th scope="col" className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                  Result
                </th>
                <th scope="col" className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {analytes.map((a) => {
                const flagged = a.flag !== 'normal'
                return (
                  <tr key={a.test}>
                    <th scope="row" className="px-4 py-2.5 text-[12.5px] font-normal text-ink-700">
                      {a.test}
                    </th>
                    <td className="px-4 py-2.5 text-[12.5px] text-ink-500">{a.displayRange}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-[12.5px]',
                          flagged ? 'font-bold text-danger-600' : 'text-ink-700'
                        )}
                      >
                        {flagged && <WarningIcon className="h-3.5 w-3.5" />}
                        {a.displayResult}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10.5px] font-semibold',
                          flagged ? 'bg-danger-50 text-danger-600' : 'bg-success-50 text-success-700'
                        )}
                      >
                        {a.flag === 'low' ? 'Below range' : a.flag === 'high' ? 'Above range' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {/* Side effects */}
        <section>
          <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-ink-500">
            Side effects
          </h2>
          <ul className="divide-y divide-hairline overflow-hidden rounded-card border border-hairline bg-white shadow-card">
            {sideEffects.length === 0 && (
              <li className="px-4 py-3 text-[12.5px] text-ink-500">None logged.</li>
            )}
            {sideEffects.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div>
                  <p className="text-[12.5px] font-medium text-ink-900">{s.term}</p>
                  <p className="text-[11px] text-ink-500">
                    Grade {s.grade} · onset {s.onsetDate}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold',
                    s.ongoing ? 'bg-warning-50 text-warning-600' : 'bg-panel text-ink-500'
                  )}
                >
                  {s.ongoing ? 'Ongoing' : 'Resolved'}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Screening */}
        <section>
          <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-ink-500">
            Screening
          </h2>
          <ul className="divide-y divide-hairline overflow-hidden rounded-card border border-hairline bg-white shadow-card">
            {screenings.map((s) => (
              <li key={s.id} className="px-4 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[12.5px] font-medium text-ink-900">{s.type}</p>
                  <span className="shrink-0 rounded-full bg-success-50 px-2 py-0.5 text-[10.5px] font-semibold text-success-700">
                    {s.outcome}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-ink-500">
                  Last screened {s.lastScreenedOn} · next due {s.nextDue}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Schedule */}
      <section className="mt-6">
        <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-ink-500">
          Scheduled monitoring
        </h2>
        <ul className="divide-y divide-hairline overflow-hidden rounded-card border border-hairline bg-white shadow-card">
          {scheduledEvents.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-[12.5px] font-medium text-ink-900">{e.label}</p>
                <p className="text-[11px] text-ink-500">
                  {e.status === 'rescheduled' ? 'Rescheduled' : 'Scheduled'}
                </p>
              </div>
              <span className="text-[13px] font-bold text-ink-900">{e.date}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11.5px] text-ink-500">
          Use the Connex assistant to reschedule any of these.
        </p>
      </section>

      {/* Panel history */}
      <section className="mt-6 pb-8">
        <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-ink-500">
          Panel history
        </h2>
        <ul className="divide-y divide-hairline overflow-hidden rounded-card border border-hairline bg-white shadow-card">
          {[...panelHistory].reverse().map((panel) => {
            const flagged = evaluatePanel(panel.readings).filter((a) => a.flag !== 'normal').length
            return (
              <li key={panel.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div>
                  <p className="text-[12.5px] font-medium text-ink-900">Cycle {panel.cycleNumber}</p>
                  <p className="text-[11px] text-ink-500">{panel.collectedOn}</p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold',
                    flagged > 0 ? 'bg-danger-50 text-danger-600' : 'bg-success-50 text-success-700'
                  )}
                >
                  {flagged > 0 ? `${flagged} flagged` : 'All normal'}
                </span>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
