import { describe, expect, it } from 'vitest'
import { evaluateAnalyte, evaluateFlag, evaluatePanel } from '@/lib/clinical/evaluate-analyte'
import { describeFlagged, summarisePanel } from '@/lib/clinical/summarise-panel'
import { heroPanel } from '@/data/fixtures/hero-patient'
import { buildLabPanelPayload } from '@/lib/ai/payloads'
import { getMonitoringSnapshot } from '@/lib/repositories/patients'
import { HERO_PATIENT_ID } from '@/data/fixtures/hero-patient'

describe('evaluateFlag', () => {
  it('flags values below the reference range', () => {
    expect(evaluateFlag(3.6, 4.2, 5.4)).toBe('low')
  })

  it('flags values above the reference range', () => {
    expect(evaluateFlag(6.0, 4.2, 5.4)).toBe('high')
  })

  it('treats the boundaries as normal', () => {
    expect(evaluateFlag(4.2, 4.2, 5.4)).toBe('normal')
    expect(evaluateFlag(5.4, 4.2, 5.4)).toBe('normal')
  })
})

describe('evaluateAnalyte', () => {
  it('formats the range and result for display', () => {
    const result = evaluateAnalyte({
      test: 'Hemoglobin',
      value: 9.8,
      unit: 'g/dL',
      refLow: 12.0,
      refHigh: 15.5,
    })
    expect(result.flag).toBe('low')
    expect(result.displayRange).toBe('12.0 – 15.5 g/dL')
    expect(result.displayResult).toBe('9.80 g/dL')
  })

  it('uses per-analyte precision, not per-unit', () => {
    const result = evaluateAnalyte({
      test: 'Platelet',
      value: 88,
      unit: 'x10³/µL',
      refLow: 150,
      refHigh: 450,
    })
    expect(result.displayResult).toBe('88 x10³/µL')
    expect(result.displayRange).toBe('150 – 450 x10³/µL')

    // WBC shares the unit but reports to 2dp — precision must not be
    // inferred from the unit string.
    const wbc = evaluateAnalyte({
      test: 'WBC',
      value: 2.9,
      unit: 'x10³/µL',
      refLow: 4.5,
      refHigh: 11.0,
    })
    expect(wbc.displayResult).toBe('2.90 x10³/µL')
    expect(wbc.displayRange).toBe('4.5 – 11.0 x10³/µL')
  })
})

describe('summarisePanel', () => {
  it('produces the mockup banner when every value is low', () => {
    const analytes = evaluatePanel(heroPanel.readings)
    const alert = summarisePanel(analytes)
    expect(alert).not.toBeNull()
    expect(alert!.message).toBe('All 5 values are below the normal reference range')
    expect(alert!.flaggedCount).toBe(5)
    expect(alert!.severity).toBe('critical')
  })

  it('returns null when nothing is flagged', () => {
    const analytes = evaluatePanel([
      { test: 'WBC', value: 6.0, unit: 'x10³/µL', refLow: 4.5, refHigh: 11.0 },
    ])
    expect(summarisePanel(analytes)).toBeNull()
  })

  it('counts a partial set correctly', () => {
    const analytes = evaluatePanel([
      { test: 'A', value: 1, unit: 'g/dL', refLow: 5, refHigh: 10 },
      { test: 'B', value: 7, unit: 'g/dL', refLow: 5, refHigh: 10 },
      { test: 'C', value: 2, unit: 'g/dL', refLow: 5, refHigh: 10 },
    ])
    const alert = summarisePanel(analytes)
    expect(alert!.message).toBe('2 of 3 values are below the normal reference range')
    expect(alert!.severity).toBe('warning')
  })

  it('describes mixed directions generically', () => {
    const analytes = evaluatePanel([
      { test: 'A', value: 1, unit: 'g/dL', refLow: 5, refHigh: 10 },
      { test: 'B', value: 20, unit: 'g/dL', refLow: 5, refHigh: 10 },
    ])
    expect(summarisePanel(analytes)!.message).toBe(
      '2 of 2 values are outside the normal reference range'
    )
  })
})

describe('describeFlagged', () => {
  it('lists flagged analytes in prose', () => {
    const analytes = evaluatePanel(heroPanel.readings)
    expect(describeFlagged(analytes)).toBe(
      'RBC Count, Hemoglobin, Hematocrit, Platelet and WBC are outside their reference ranges.'
    )
  })
})

describe('hero fixture reproduces the mockup', () => {
  it('builds the reference card exactly', () => {
    const snapshot = getMonitoringSnapshot(HERO_PATIENT_ID)
    expect(snapshot).toBeDefined()
    const card = buildLabPanelPayload(snapshot!)

    expect(card.title).toBe('Routine Blood Count')
    expect(card.alert?.message).toBe('All 5 values are below the normal reference range')

    expect(card.rows).toEqual([
      { test: 'RBC Count', normalRange: '4.20 – 5.40 M/µL', result: '3.60 M/µL', flag: 'low' },
      { test: 'Hemoglobin', normalRange: '12.0 – 15.5 g/dL', result: '9.80 g/dL', flag: 'low' },
      { test: 'Hematocrit', normalRange: '34.9 – 44.5 %', result: '29.5 %', flag: 'low' },
      { test: 'Platelet', normalRange: '150 – 450 x10³/µL', result: '88 x10³/µL', flag: 'low' },
      { test: 'WBC', normalRange: '4.5 – 11.0 x10³/µL', result: '2.90 x10³/µL', flag: 'low' },
    ])

    expect(card.narrativeFields).toEqual([
      { label: 'Side Effects', value: 'Headache, Fatigue, Mild diarrhea' },
      { label: 'Secondary Malignancies', value: 'None found' },
    ])

    expect(card.scheduledItems.map((s) => [s.label, s.date])).toEqual([
      ['Scheduled Blood Work', '17-Sep-2026'],
      ['Scheduled Specialist Check-in', '20-Sep-2026'],
    ])
  })
})
