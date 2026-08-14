import Link from 'next/link'
import { listPatients } from '@/lib/repositories/patients'
import { listEvents } from '@/lib/repositories/appointments'
import { PERSONAS, DEFAULT_PERSONA_ID } from '@/data/personas'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { ChevronRightIcon, WarningIcon } from '@/components/common/icons'

export default function DashboardPage() {
  const persona = PERSONAS.find((p) => p.id === DEFAULT_PERSONA_ID)!
  const all = listPatients()
  const flagged = all.filter((p) => p.flaggedCount > 0)
  const events = listEvents().slice(0, 6)
  const active = all.filter((p) => p.monitoringStatus === 'active')

  return (
    <div className="mx-auto max-w-5xl px-5 py-6">
      <PageHeader
        title={`Good morning, ${persona.name.split(' ').slice(-1)[0]}`}
        subtitle="Here is where your cohort stands today."
      />

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Patients on monitoring" value={active.length} />
        <StatCard label="With flagged results" value={flagged.length} tone="danger" />
        <StatCard label="Upcoming appointments" value={listEvents().length} />
        <StatCard label="Total in cohort" value={all.length} />
      </div>

      <section className="mt-7">
        <h2 className="mb-2.5 text-[13px] font-semibold uppercase tracking-wide text-ink-500">
          Needs attention
        </h2>
        <div className="space-y-2">
          {flagged.slice(0, 6).map((p) => (
            <Link
              key={p.id}
              href={`/patients/${p.id}/monitoring`}
              className="flex items-center gap-3 rounded-card border border-hairline border-l-4 border-l-warning-500 bg-white px-4 py-3 shadow-card transition hover:border-l-magenta-600"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-ink-900">{p.name}</p>
                <p className="truncate text-[11.5px] text-ink-500">
                  {p.diagnosis} · {p.regimen} · cycle {p.cycleNumber} of {p.totalCycles}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-danger-50 px-2 py-0.5 text-[10.5px] font-semibold text-danger-600">
                <WarningIcon className="h-3 w-3" />
                {p.flaggedCount} flagged
              </span>
              <ChevronRightIcon className="h-4 w-4 shrink-0 text-ink-400" />
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <h2 className="mb-2.5 text-[13px] font-semibold uppercase tracking-wide text-ink-500">
          Upcoming
        </h2>
        <ul className="divide-y divide-hairline overflow-hidden rounded-card border border-hairline bg-white shadow-card">
          {events.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-medium text-ink-900">{e.label}</p>
                <p className="truncate text-[11px] text-ink-500">
                  {all.find((p) => p.id === e.patientId)?.name ?? e.patientId}
                </p>
              </div>
              <span className="shrink-0 text-[12px] font-semibold text-ink-700">{e.date}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
