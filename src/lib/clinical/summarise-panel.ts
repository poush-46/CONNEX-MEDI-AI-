import type { EvaluatedAnalyte, PanelAlert } from '@/types/clinical'

/**
 * Derives the aggregate alert banner shown above a results table.
 *
 * The mockup shows "All 5 values are below the normal reference range".
 * That sentence is COMPUTED from the rows, never authored in the dataset —
 * so edits to demo data can never desynchronise the banner from the table.
 */
export function summarisePanel(analytes: EvaluatedAnalyte[]): PanelAlert | null {
  const flagged = analytes.filter((a) => a.flag !== 'normal')
  if (flagged.length === 0) return null

  const total = analytes.length
  const lows = flagged.filter((a) => a.flag === 'low').length
  const highs = flagged.filter((a) => a.flag === 'high').length

  // Severity: everything out of range, or any severe depletion, reads critical.
  const severity: PanelAlert['severity'] = flagged.length === total ? 'critical' : 'warning'

  let message: string
  if (flagged.length === total && highs === 0) {
    message = `All ${total} values are below the normal reference range`
  } else if (flagged.length === total && lows === 0) {
    message = `All ${total} values are above the normal reference range`
  } else if (highs === 0) {
    message = `${lows} of ${total} values are below the normal reference range`
  } else if (lows === 0) {
    message = `${highs} of ${total} values are above the normal reference range`
  } else {
    message = `${flagged.length} of ${total} values are outside the normal reference range`
  }

  return { severity, message, flaggedCount: flagged.length }
}

/** Short human phrase naming the flagged analytes, for chat prose. */
export function describeFlagged(analytes: EvaluatedAnalyte[]): string {
  const flagged = analytes.filter((a) => a.flag !== 'normal')
  if (flagged.length === 0) return 'All values are within their reference ranges.'
  const names = flagged.map((a) => a.test)
  if (names.length === 1) return `${names[0]} is outside its reference range.`
  const last = names[names.length - 1]
  return `${names.slice(0, -1).join(', ')} and ${last} are outside their reference ranges.`
}
