const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/**
 * The mockup renders dates as DD-MMM-YYYY (e.g. "17-Sep-2026").
 * All user-facing dates go through here.
 */
export function formatDisplayDate(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${day}-${MONTHS[d.getUTCMonth()]}-${d.getUTCFullYear()}`
}

export function formatDisplayDateTime(iso: string, time: string): string {
  return `${formatDisplayDate(iso)} at ${time}`
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function isPast(iso: string, now = new Date()): boolean {
  return new Date(iso).getTime() < new Date(now.toISOString().slice(0, 10)).getTime()
}
