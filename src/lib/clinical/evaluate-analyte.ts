import type { AnalyteFlag, AnalyteReading, EvaluatedAnalyte } from '@/types/clinical'
import { rangeFor } from '@/data/reference-ranges'

/**
 * Flag evaluation — the single source of truth for whether a value is
 * out of range.
 *
 * This is deliberately REAL logic, not a mock. Only the underlying data is
 * synthetic. Every surface that renders a result (the in-chat card, the
 * full-screen monitoring table, the API) calls through here, so the clinical
 * presentation can never drift between them.
 */

/**
 * Display precision comes from the analyte definition, never from the unit:
 * Platelet and WBC share "x10³/µL" but report as "88" and "2.90".
 * Falls back to 2dp for any analyte not in the catalogue.
 */
function precisionFor(test: string): number {
  return rangeFor(test)?.resultDp ?? 2
}

export function formatValue(value: number, test: string): string {
  return value.toFixed(precisionFor(test))
}

/**
 * Renders the reference range. Uses the laboratory's own notation where the
 * analyte is catalogued, so "4.5 – 11.0" is not silently normalised to
 * "4.50 – 11.00".
 */
export function formatRange(reading: AnalyteReading): string {
  const known = rangeFor(reading.test)
  if (known) return `${known.rangeText} ${reading.unit}`
  const dp = precisionFor(reading.test)
  return `${reading.refLow.toFixed(dp)} – ${reading.refHigh.toFixed(dp)} ${reading.unit}`
}

/** Compares a value against its reference range. */
export function evaluateFlag(value: number, refLow: number, refHigh: number): AnalyteFlag {
  if (value < refLow) return 'low'
  if (value > refHigh) return 'high'
  return 'normal'
}

/** Enriches a raw reading with its flag and display strings. */
export function evaluateAnalyte(reading: AnalyteReading): EvaluatedAnalyte {
  return {
    ...reading,
    flag: evaluateFlag(reading.value, reading.refLow, reading.refHigh),
    displayRange: formatRange(reading),
    displayResult: `${formatValue(reading.value, reading.test)} ${reading.unit}`,
  }
}

export function evaluatePanel(readings: AnalyteReading[]): EvaluatedAnalyte[] {
  return readings.map(evaluateAnalyte)
}
