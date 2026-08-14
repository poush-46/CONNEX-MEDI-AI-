import { cn } from '@/lib/utils/cn'

export function StatCard({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: number | string
  tone?: 'default' | 'danger'
}) {
  return (
    <div className="rounded-card border border-hairline bg-white px-4 py-3 shadow-card">
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">{label}</p>
      <p
        className={cn(
          'mt-1 text-[24px] font-semibold leading-none',
          tone === 'danger' ? 'text-danger-600' : 'text-ink-900'
        )}
      >
        {value}
      </p>
    </div>
  )
}
