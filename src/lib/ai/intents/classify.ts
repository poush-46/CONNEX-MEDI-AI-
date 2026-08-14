/**
 * Intent classification.
 *
 * A scored keyword/regex matcher. Deliberately simple and deterministic:
 * the same input always produces the same intent, which keeps demos and
 * tests reproducible.
 *
 * Later this is replaced by a model call — the Intent union and the handler
 * signatures stay the same.
 */

export type Intent =
  | 'greeting'
  | 'capability'
  | 'lab_panel'
  | 'trend'
  | 'side_effects'
  | 'screening'
  | 'schedule_view'
  | 'patient_summary'
  | 'patient_lookup'
  | 'cohort_flagged'
  | 'glossary'
  | 'adverse_event'
  | 'clinical_decision'
  | 'navigate_monitoring'
  | 'reset'
  | 'fallback'

interface Rule {
  intent: Intent
  /** Each pattern that matches adds to the score. */
  patterns: RegExp[]
  weight?: number
}

/**
 * Safety rules are evaluated first and short-circuit everything else.
 * Order matters: adverse events outrank all informational intents.
 */
const SAFETY_RULES: Rule[] = [
  {
    intent: 'adverse_event',
    patterns: [
      /\b(adverse event|serious reaction|anaphyla\w*|hospitali[sz]ed|life[- ]threatening)\b/i,
      /\b(report (an? )?(side effect|reaction|ae)\b)/i,
      /\b(collapsed|severe bleeding|emergency)\b/i,
    ],
  },
  {
    intent: 'clinical_decision',
    patterns: [
      /\b(should i|shall i|do i)\b.*\b(prescribe|stop|start|switch|increase|reduce|discontinue|treat|dose)\b/i,
      /\bwhat (dose|treatment) should\b/i,
      /\b(is it safe to|can i give)\b/i,
      /\b(diagnos(e|is) (this|the) patient)\b/i,
    ],
  },
]

const RULES: Rule[] = [
  {
    intent: 'greeting',
    patterns: [/^\s*(hi|hello|hey|good (morning|afternoon|evening))\b/i],
  },
  {
    intent: 'capability',
    patterns: [/\bwhat can you (do|help)\b/i, /\byour capabilities\b/i, /\bhelp me with\b/i],
  },
  {
    intent: 'lab_panel',
    patterns: [
      /\b(blood count|cbc|full blood|routine blood|blood work|bloods)\b/i,
      /\b(lab|labs|panel|results?)\b/i,
      /\b(counts?)\b/i,
      /\bhow are (they|their|the patient)\b/i,
      /\blatest (results?|panel|labs?)\b/i,
    ],
    weight: 2,
  },
  {
    intent: 'trend',
    patterns: [
      /\b(trend|over time|history|across cycles|progression|chart|graph)\b/i,
      /\b(hemoglobin|haemoglobin|platelet|wbc|rbc|hematocrit|haematocrit)\b.*\b(time|trend|cycles?)\b/i,
    ],
    weight: 2,
  },
  {
    intent: 'side_effects',
    patterns: [/\bside[- ]effects?\b/i, /\btoxicit(y|ies)\b/i, /\bhow are they tolerating\b/i],
    weight: 2,
  },
  {
    intent: 'screening',
    patterns: [/\bsecondary malignanc\w*/i, /\bscreening\b/i, /\bsecond cancer\b/i],
    weight: 2,
  },
  {
    intent: 'schedule_view',
    patterns: [
      /\b(appointments?|scheduled?|upcoming|calendar|next visit|check[- ]?in)\b/i,
      /\bwhen (is|are) (their|the)\b/i,
    ],
    weight: 2,
  },
  {
    intent: 'patient_summary',
    patterns: [/\bsummar(y|ise|ize)\b/i, /\boverview of (this|the) patient\b/i, /\bbrief me\b/i],
    weight: 2,
  },
  {
    intent: 'patient_lookup',
    patterns: [/\b(show|open|find|pull up|look up)\b.*\b(patient|record)\b/i, /\bpatient\s+DEMO-P-\d+/i],
    weight: 2,
  },
  {
    intent: 'cohort_flagged',
    patterns: [
      /\bwho (has|have|is)\b.*\b(flagged|abnormal|out of range|low)\b/i,
      /\b(which|list|show me) patients?\b/i,
      /\bhow many patients\b/i,
    ],
    weight: 3,
  },
  {
    intent: 'glossary',
    patterns: [/\bwhat (is|are|does)\b(?!.*\bshould\b)/i, /\bdefine\b/i, /\bexplain\b.*\bmean\b/i],
  },
  {
    intent: 'navigate_monitoring',
    patterns: [/\b(open|go to|take me to|view)\b.*\b(clinical )?monitoring\b/i],
    weight: 3,
  },
  {
    intent: 'reset',
    patterns: [/\b(clear|reset|start over|new conversation)\b/i],
    weight: 3,
  },
]

export interface Classification {
  intent: Intent
  confidence: number
}

export function classify(input: string): Classification {
  const text = input.trim()
  if (!text) return { intent: 'fallback', confidence: 0 }

  for (const rule of SAFETY_RULES) {
    if (rule.patterns.some((p) => p.test(text))) {
      return { intent: rule.intent, confidence: 1 }
    }
  }

  let best: Classification = { intent: 'fallback', confidence: 0 }
  for (const rule of RULES) {
    const hits = rule.patterns.filter((p) => p.test(text)).length
    if (hits === 0) continue
    const score = hits * (rule.weight ?? 1)
    if (score > best.confidence) best = { intent: rule.intent, confidence: score }
  }

  return best
}
