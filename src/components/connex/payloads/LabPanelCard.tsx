'use client'

import type { LabPanelPayload } from '@/types/chat'
import { WarningIcon } from '@/components/common/icons'
import { cn } from '@/lib/utils/cn'

/**
 * THE HERO COMPONENT.
 *
 * Reproduces the reference card from the product mockup: title, computed
 * alert banner, three-column results table with flagged values, bold-labelled
 * narrative fields, and scheduled items each with a Reschedule button.
 *
 * Accessibility: flags are never conveyed by colour alone — every flagged
 * result carries a warning icon and a visually-hidden "out of range" label.
 */
export function LabPanelCard({
  data,
  onReschedule,
  busy,
}: {
  data: LabPanelPayload
  onReschedule?: (eventId: string) => void
  busy?: boolean
}) {
  return (
    <div className="overflow-hidden rounded-card border border-hairline bg-white shadow-card">
      <div className="px-3.5 pt-3.5">
        <h3 className="text-[13px] font-semibold text-ink-900">{data.title}</h3>

        {data.alert && (
          <div
            className="mt-2.5 flex items-start gap-2 rounded-md bg-danger-50 px-2.5 py-2"
            role="status"
          >
            <WarningIcon className="mt-[1px] h-3.5 w-3.5 shrink-0 text-danger-600" />
            <p className="text-[11.5px] font-medium leading-snug text-danger-600">
              {data.alert.message}
            </p>
          </div>
        )}
      </div>

      {/* Results table */}
      <div className="px-3.5 pt-3">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            {data.title} collected {data.collectedOn}
          </caption>
          <thead>
            <tr className="border-b border-hairline">
              <th scope="col" className="pb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-ink-500">
                Test
              </th>
              <th scope="col" className="pb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-ink-500">
                Normal Range
              </th>
              <th scope="col" className="pb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-ink-500">
                Result
              </th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => {
              const flagged = row.flag !== 'normal'
              return (
                <tr key={row.test} className="border-b border-hairline/70 last:border-0">
                  <th
                    scope="row"
                    className="py-[7px] text-[11.5px] font-normal text-ink-700"
                  >
                    {row.test}
                  </th>
                  <td className="py-[7px] text-[11.5px] text-ink-500">{row.normalRange}</td>
                  <td className="py-[7px]">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 text-[11.5px]',
                        flagged ? 'font-bold text-danger-600' : 'text-ink-700'
                      )}
                    >
                      {flagged && <WarningIcon className="h-3 w-3 shrink-0" />}
                      {row.result}
                      {flagged && (
                        <span className="sr-only">
                          {row.flag === 'low' ? ' below reference range' : ' above reference range'}
                        </span>
                      )}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Narrative fields */}
      {data.narrativeFields.length > 0 && (
        <dl className="px-3.5 pt-3 text-[11.5px] leading-relaxed">
          {data.narrativeFields.map((field) => (
            <div key={field.label} className="flex gap-1.5">
              <dt className="font-bold text-ink-900">{field.label}:</dt>
              <dd className="text-ink-700">{field.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* Scheduled items */}
      {data.scheduledItems.length > 0 && (
        <div className="space-y-2 p-3.5">
          {data.scheduledItems.map((item) => (
            <div
              key={item.eventId}
              className="flex items-center justify-between gap-3 rounded-md border border-hairline px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-[10.5px] text-ink-500">{item.label}</p>
                <p className="text-[12px] font-bold text-ink-900">{item.date}</p>
              </div>
              {item.rescheduleable && onReschedule && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onReschedule(item.eventId)}
                  className="shrink-0 rounded-md bg-success-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-success-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reschedule
                  <span className="sr-only"> {item.label}, currently {item.date}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
