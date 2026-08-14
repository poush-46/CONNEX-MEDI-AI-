/**
 * Reference ranges and display conventions for the Routine Blood Count panel.
 *
 * Values match those shown in the product mockup. They are adult-typical and
 * applied uniformly to all demo patients — whether ranges should vary by sex
 * and age is an open product question (see docs/PLAN.md §11).
 *
 * Display precision is defined PER ANALYTE, not inferred from the unit:
 * Platelet and WBC share "x10³/µL" but report at different precision
 * (88 vs 2.90). Real laboratories define reporting precision per analyte, and
 * so do we — inferring it from the unit produces wrong output.
 *
 * SYNTHETIC DEMO DATA — illustrative only, not clinical guidance.
 */
export interface ReferenceRange {
  test: string
  unit: string
  refLow: number
  refHigh: number
  /** Decimal places used when reporting a result. */
  resultDp: number
  /** The range exactly as the laboratory writes it, unit appended separately. */
  rangeText: string
}

export const BLOOD_COUNT_RANGES: ReferenceRange[] = [
  { test: 'RBC Count', unit: 'M/µL', refLow: 4.2, refHigh: 5.4, resultDp: 2, rangeText: '4.20 – 5.40' },
  { test: 'Hemoglobin', unit: 'g/dL', refLow: 12.0, refHigh: 15.5, resultDp: 2, rangeText: '12.0 – 15.5' },
  { test: 'Hematocrit', unit: '%', refLow: 34.9, refHigh: 44.5, resultDp: 1, rangeText: '34.9 – 44.5' },
  { test: 'Platelet', unit: 'x10³/µL', refLow: 150, refHigh: 450, resultDp: 0, rangeText: '150 – 450' },
  { test: 'WBC', unit: 'x10³/µL', refLow: 4.5, refHigh: 11.0, resultDp: 2, rangeText: '4.5 – 11.0' },
]

const BY_TEST = new Map(BLOOD_COUNT_RANGES.map((r) => [r.test, r]))

export function rangeFor(test: string): ReferenceRange | undefined {
  return BY_TEST.get(test)
}
