'use client'

import Link from 'next/link'
import type {
  ChatPayload,
  ConfirmationPayload,
  ListPayload,
  PatientCardPayload,
  ReceiptPayload,
  SlotPickerPayload,
  TrendPayload,
} from '@/types/chat'
import { CheckIcon, ChevronRightIcon } from '@/components/common/icons'
import { cn } from '@/lib/utils/cn'
import { LabPanelCard } from './LabPanelCard'

export interface PayloadHandlers {
  onReschedule?: (eventId: string) => void
  onSelectSlot?: (eventId: string, slotId: string) => void
  onConfirm?: (commit: Record<string, string>) => void
  onCancel?: () => void
  busy?: boolean
}

/** Maps a payload variant to its renderer. */
export function ChatPayloadRenderer({
  payload,
  handlers,
}: {
  payload: ChatPayload
  handlers: PayloadHandlers
}) {
  switch (payload.type) {
    case 'lab_panel':
      return (
        <LabPanelCard
          data={payload.data}
          onReschedule={handlers.onReschedule}
          busy={handlers.busy}
        />
      )
    case 'patient_card':
      return <PatientCard data={payload.data} />
    case 'slot_picker':
      return <SlotPicker data={payload.data} handlers={handlers} />
    case 'confirmation':
      return <ConfirmationCard data={payload.data} handlers={handlers} />
    case 'receipt':
      return <ReceiptCard data={payload.data} />
    case 'trend':
      return <TrendCard data={payload.data} />
    case 'list':
      return <ListCard data={payload.data} />
    default:
      return null
  }
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-card border border-hairline bg-white p-3.5 shadow-card">
      {children}
    </div>
  )
}

function PatientCard({ data }: { data: PatientCardPayload }) {
  return (
    <CardShell>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[13px] font-semibold text-ink-900">{data.name}</h3>
          <p className="text-[11.5px] text-ink-500">
            {data.age}
            {data.sex} · {data.diagnosis}
          </p>
        </div>
        {data.flaggedCount > 0 && (
          <span className="shrink-0 rounded-full bg-danger-50 px-2 py-0.5 text-[10.5px] font-semibold text-danger-600">
            {data.flaggedCount} flagged
          </span>
        )}
      </div>
      <dl className="mt-2.5 space-y-1 text-[11.5px]">
        <div className="flex gap-1.5">
          <dt className="font-bold text-ink-900">Regimen:</dt>
          <dd className="text-ink-700">{data.regimen}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="font-bold text-ink-900">Progress:</dt>
          <dd className="text-ink-700">{data.cycleLabel}</dd>
        </div>
      </dl>
      <Link
        href={`/patients/${data.patientId}/monitoring`}
        className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-semibold text-magenta-600 hover:underline"
      >
        View clinical monitoring
        <ChevronRightIcon className="h-3.5 w-3.5" />
      </Link>
    </CardShell>
  )
}

function SlotPicker({
  data,
  handlers,
}: {
  data: SlotPickerPayload
  handlers: PayloadHandlers
}) {
  return (
    <CardShell>
      <h3 className="text-[13px] font-semibold text-ink-900">{data.eventLabel}</h3>
      <p className="mt-0.5 text-[11.5px] text-ink-500">Currently {data.currentDate}</p>
      <div className="mt-3 space-y-2">
        {data.slots.map((slot) => (
          <button
            key={slot.id}
            type="button"
            disabled={handlers.busy}
            onClick={() => handlers.onSelectSlot?.(data.eventId, slot.id)}
            className="flex w-full items-center justify-between rounded-md border border-hairline px-3 py-2 text-left transition hover:border-magenta-600 hover:bg-magenta-600/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-[12px] font-semibold text-ink-900">{slot.date}</span>
            <span className="text-[11.5px] text-ink-500">{slot.time}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={handlers.onCancel}
        className="mt-2.5 text-[11.5px] font-medium text-ink-500 hover:text-ink-700 hover:underline"
      >
        Keep the current date
      </button>
    </CardShell>
  )
}

function ConfirmationCard({
  data,
  handlers,
}: {
  data: ConfirmationPayload
  handlers: PayloadHandlers
}) {
  return (
    <CardShell>
      <h3 className="text-[13px] font-semibold text-ink-900">{data.summary}</h3>
      <dl className="mt-2.5 space-y-1 text-[11.5px]">
        {data.details.map((d) => (
          <div key={d.label} className="flex gap-1.5">
            <dt className="font-bold text-ink-900">{d.label}:</dt>
            <dd className="text-ink-700">{d.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={handlers.busy}
          onClick={() => handlers.onConfirm?.(data.commit)}
          className="rounded-md bg-success-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-success-700 disabled:opacity-50"
        >
          {data.confirmLabel}
        </button>
        <button
          type="button"
          disabled={handlers.busy}
          onClick={handlers.onCancel}
          className="rounded-md border border-hairline px-3 py-1.5 text-[11px] font-semibold text-ink-700 transition hover:bg-panel disabled:opacity-50"
        >
          {data.cancelLabel}
        </button>
      </div>
    </CardShell>
  )
}

function ReceiptCard({ data }: { data: ReceiptPayload }) {
  return (
    <div className="overflow-hidden rounded-card border border-success-600/30 bg-success-50 p-3.5">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success-600 text-white">
          <CheckIcon className="h-3 w-3" />
        </span>
        <div>
          <h3 className="text-[13px] font-semibold text-ink-900">{data.title}</h3>
          <p className="text-[11.5px] text-ink-700">{data.message}</p>
          <dl className="mt-1.5 space-y-0.5 text-[11.5px]">
            {data.details.map((d) => (
              <div key={d.label} className="flex gap-1.5">
                <dt className="font-bold text-ink-900">{d.label}:</dt>
                <dd className="text-ink-700">{d.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}

/** Lightweight inline bar chart — no charting dependency. */
function TrendCard({ data }: { data: TrendPayload }) {
  const values = data.points.map((p) => p.value)
  const max = Math.max(...values, data.refHigh)
  const min = Math.min(...values, data.refLow) * 0.9

  return (
    <CardShell>
      <h3 className="text-[13px] font-semibold text-ink-900">
        {data.analyte} <span className="font-normal text-ink-500">({data.unit})</span>
      </h3>
      <p className="mt-0.5 text-[11px] text-ink-500">
        Reference {data.refLow} – {data.refHigh}
      </p>
      <div className="mt-3 space-y-1.5">
        {data.points.map((point) => {
          const pct = ((point.value - min) / (max - min)) * 100
          const flagged = point.flag !== 'normal'
          return (
            <div key={point.label} className="flex items-center gap-2">
              <span className="w-14 shrink-0 text-[10.5px] text-ink-500">{point.label}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-panel">
                <div
                  className={cn('h-full rounded-full', flagged ? 'bg-danger-600' : 'bg-success-600')}
                  style={{ width: `${Math.max(4, Math.min(100, pct))}%` }}
                />
              </div>
              <span
                className={cn(
                  'w-12 shrink-0 text-right text-[11px]',
                  flagged ? 'font-bold text-danger-600' : 'text-ink-700'
                )}
              >
                {point.value}
              </span>
            </div>
          )
        })}
      </div>
    </CardShell>
  )
}

function ListCard({ data }: { data: ListPayload }) {
  return (
    <CardShell>
      <h3 className="text-[13px] font-semibold text-ink-900">{data.title}</h3>
      <ul className="mt-2 divide-y divide-hairline">
        {data.items.map((item, i) => {
          const content = (
            <div className="flex items-center justify-between gap-2 py-2">
              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium text-ink-900">{item.primary}</p>
                {item.secondary && (
                  <p className="truncate text-[11px] text-ink-500">{item.secondary}</p>
                )}
              </div>
              {item.badge && (
                <span className="shrink-0 rounded-full bg-panel px-2 py-0.5 text-[10.5px] font-semibold text-ink-700">
                  {item.badge}
                </span>
              )}
            </div>
          )
          return (
            <li key={`${item.primary}-${i}`}>
              {item.href ? (
                <Link href={item.href} className="block rounded transition hover:bg-panel/70">
                  {content}
                </Link>
              ) : (
                content
              )}
            </li>
          )
        })}
      </ul>
    </CardShell>
  )
}
