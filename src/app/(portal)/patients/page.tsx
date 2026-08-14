import Link from 'next/link'
import { listPatients } from '@/lib/repositories/patients'
import { PageHeader } from '@/components/layout/PageHeader'
import { ChevronRightIcon, WarningIcon } from '@/components/common/icons'

export default function PatientsPage({
  searchParams,
}: {
  searchParams: { q?: string; flagged?: string }
}) {
  const patients = listPatients({
    query: searchParams.q,
    flaggedOnly: searchParams.flagged === 'true',
  })
  const flaggedOnly = searchParams.flagged === 'true'

  return (
    <div className="mx-auto max-w-5xl px-5 py-6">
      <PageHeader title="Patients" subtitle={`${patients.length} synthetic records`} />

      <form className="mt-4 flex flex-wrap items-center gap-2" action="/patients">
        <input
          name="q"
          defaultValue={searchParams.q ?? ''}
          placeholder="Search name, diagnosis or regimen"
          aria-label="Search patients"
          className="min-w-0 flex-1 rounded-md border border-hairline bg-white px-3 py-2 text-[12.5px] placeholder:text-ink-400 focus:border-magenta-600 focus:outline-none"
        />
        <label className="flex items-center gap-1.5 rounded-md border border-hairline bg-white px-3 py-2 text-[12px] text-ink-700">
          <input
            type="checkbox"
            name="flagged"
            value="true"
            defaultChecked={flaggedOnly}
            className="accent-magenta-600"
          />
          Flagged only
        </label>
        <button
          type="submit"
          className="rounded-md bg-magenta-600 px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-magenta-700"
        >
          Search
        </button>
      </form>

      {patients.length === 0 ? (
        <p className="mt-8 rounded-card border border-dashed border-hairline bg-white px-4 py-10 text-center text-[13px] text-ink-500">
          No patients match that search.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-hairline overflow-hidden rounded-card border border-hairline bg-white shadow-card">
          {patients.map((p) => (
            <li key={p.id}>
              <Link
                href={`/patients/${p.id}/monitoring`}
                className="flex items-center gap-3 px-4 py-3 transition hover:bg-panel/60"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-ink-900">{p.name}</p>
                  <p className="truncate text-[11.5px] text-ink-500">
                    {p.age}
                    {p.sex} · {p.diagnosis} · {p.regimen} · cycle {p.cycleNumber}/{p.totalCycles}
                  </p>
                </div>
                {p.flaggedCount > 0 && (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-danger-50 px-2 py-0.5 text-[10.5px] font-semibold text-danger-600">
                    <WarningIcon className="h-3 w-3" />
                    {p.flaggedCount}
                  </span>
                )}
                <ChevronRightIcon className="h-4 w-4 shrink-0 text-ink-400" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
