# Mockup Findings — Slide 1 (Connex AI Assistant chat panel)

**Source:** screenshot of one slide from `HCP Portal_AI Layer Mockup`. The PDF itself never reached the workspace; this was read visually from the attached image. Ten images were attached but all ten are the same slide, so **only one distinct view is documented here**.

This file records what is *observed* (high confidence) versus *inferred* (needs confirmation). It supersedes the guesswork in earlier drafts of `PLAN.md` wherever the two disagree.

---

## 1. What the slide shows

The slide has two halves: a **UI screenshot** on the left and an **annotation list** on the right. The annotation list is the author's own spec for the card, with arrows pointing at the results table and the scheduled-items block.

### 1.1 Annotation text (the author's written spec)

- Routine Blood Count: (**flagged for below normal range**)
  - RBC
  - Hemoglobin
  - Hematocrit
  - Platelet
  - WBC
- Side Effects: **headache, fatigue, mild diarrhea**
- Secondary Malignancies: **None found**
- Scheduled Blood Work : DD:MM:YYYY **Reschedule**
- Scheduled specialist check-in: DD:MM:YYYY **Reschedule**

The `DD:MM:YYYY` placeholders confirm these dates are **dynamic data**, not fixed copy.

### 1.2 UI screenshot anatomy (top → bottom)

| Region | Observed detail |
|---|---|
| **Panel header** | Deep plum/maroon bar. Circular avatar with letter **"C"**, title **"Connex"**, subtitle **"Your AI Assistant"** preceded by a small **green dot** (online/active status). **"×"** close button, right-aligned. |
| **Action bar** | A right-aligned magenta pill button: **"View Clinical Monitoring"**. Sits above the message, on the panel background — a deep-link out of chat into a full screen. |
| **Assistant message** | Dark navy circular avatar badge **"C"** at the left, with a white rounded card to its right. Left-aligned = assistant turn. |
| **Card title** | **"Routine Blood Count"** |
| **Alert banner** | Light pink background, red text, ⚠ icon: **"All 5 values are below the normal reference range"**. A dynamic summary — the count "5" is computed from the flagged rows. |
| **Results table** | Three columns: **Test / Normal Range / Result**. Result cells carry a **⚠ icon and red bold text** when abnormal. |
| **Narrative fields** | **"Side Effects:"** Headache, fatigue, mild diarrhea · **"Secondary Malignancies:"** None found. Bold labels, regular values, stacked. |
| **Scheduled items** | Two bordered rows, each: small grey label + bold date on the left, **green "Reschedule" button** on the right. |
| **Composer** | Pill-shaped input, placeholder **"Ask a follow-up question…"**, circular magenta send button with a ▶ glyph. |
| **Background page** | Partially occluded behind the panel: an **orange/amber vertical accent bar** at the far left, a stack of cards with **orange/amber left borders**, and a warm orange/red band across the top. Suggests the underlying portal page uses amber-accented list cards. |

### 1.3 Table data (verbatim)

| Test | Normal Range | Result | Flagged |
|---|---|---|---|
| RBC Count | 4.20 – 5.40 M/µL | 3.60 M/µL | ⚠ low |
| Hemoglobin | 12.0 – 15.5 g/dL | 9.80 g/dL | ⚠ low |
| Hematocrit | 34.9 – 44.5 % | 29.5 % | ⚠ low |
| Platelet | 150 – 450 x10³/µL | 88 x10³/µL | ⚠ low |
| WBC | 4.5 – 11.0 x10³/µL | 2.90 x10³/µL | ⚠ low |

Scheduled items: **Scheduled Blood Work — 17-Sep-2026**; **Scheduled Specialist Check-in — 20-Sep-2026**.

> Date format in the UI is **`DD-MMM-YYYY`** (`17-Sep-2026`), not the `DD:MM:YYYY` written in the annotation. Use the UI form.
>
> The reference ranges shown are female-adult-typical. Whether ranges vary by patient sex/age in the data model is an open question.

---

## 2. What this tells us about the product

### 2.1 High confidence

1. **"Connex" is the name of the AI assistant itself**, not just the portal. The panel header brands it "Connex — Your AI Assistant".
2. **The assistant is a docked side panel**, closable via "×", overlaying a portal page that continues to exist behind it. This settles the earlier open question: **side panel**, with a full-page view still plausible as a secondary surface.
3. **Chat answers are rich, structured cards — not prose.** This is the single most important architectural finding. The response payload must be a typed object (title, alert, table rows with ranges and flags, labelled narrative fields, scheduled items with actions), rendered by dedicated components.
4. **Cards contain interactive write-actions.** "Reschedule" buttons live *inside* an assistant message. Chat is transactional, not just informational.
5. **Cards contain navigation actions.** "View Clinical Monitoring" deep-links to a dedicated screen, so a **Clinical Monitoring** screen exists in the portal.
6. **Abnormal-value flagging is a first-class rule**, driving three coordinated UI signals: the ⚠ icon, red bold text, and the aggregate banner with a computed count.
7. **Conversation continues after a card** — "Ask a follow-up question…" implies follow-up turns scoped to the card's context.
8. **The clinical domain is treatment monitoring / long-term follow-up.** "Secondary Malignancies" screening plus pancytopenia (all five counts low) plus scheduled specialist check-ins is the signature of **oncology / haematology therapy follow-up** — e.g. post-chemotherapy, immunomodulator, or cell-therapy surveillance. This is far more specific than the generic "diabetes/cardiology" demo data assumed earlier.

### 2.2 Inferred, needs confirmation

- The panel is roughly **380–420 px wide**, right-docked, full height.
- The card is scoped to **one patient**, but the slide shows no patient name/ID header — either the panel inherits patient context from the page behind it, or the name is cropped.
- "Routine Blood Count" is one of **several monitoring panels** (others might be liver function, renal function, imaging).
- The green "Reschedule" buttons likely open a date picker or hand off to a booking sub-flow.

---

## 3. Extracted design tokens

Colours read from the screenshot — **approximate, to be replaced with your real brand values**.

| Token | Approx. hex | Usage |
|---|---|---|
| `--brand-plum-900` | `#5A0B2E` | Panel header (dark end of gradient) |
| `--brand-plum-800` | `#7A1246` | Panel header (light end) |
| `--brand-magenta-600` | `#A0185F` | Primary buttons, send button |
| `--accent-navy-800` | `#1F2A5A` | Assistant avatar badge |
| `--success-600` | `#2E9E5B` | "Reschedule" buttons |
| `--danger-600` | `#C62828` | Flagged values, ⚠ icons |
| `--danger-50` | `#FDECEF` | Alert banner background |
| `--warning-500` | `#E8792B` | Amber card borders / top band on page behind |
| `--status-online` | `#3DDC84` | Green dot next to "Your AI Assistant" |
| `--surface` | `#FFFFFF` | Card background |
| `--panel-bg` | `#F5F6F8` | Panel body behind cards |

Shape language: **generously rounded** — pill buttons and inputs, ~8–12 px card radius, thin hairline borders, subtle shadow on the card.

---

## 4. Direct impact on the plan

| Area | Change |
|---|---|
| **Screens** | Add **Clinical Monitoring** as a first-class screen (target of "View Clinical Monitoring"). |
| **Chat flows** | Add a **lab/monitoring review** flow that emits this card, plus a **reschedule** sub-flow launched from inside a card, plus **card-scoped follow-up Q&A**. |
| **Components** | Add `LabPanelCard`, `LabResultTable`, `FlaggedValue`, `RangeCell`, `MonitoringAlertBanner`, `NarrativeField`, `ScheduledItemRow`, `RescheduleButton`, `DeepLinkActionBar`, `AssistantAvatar`, `OnlineDot`. |
| **Demo data** | Add lab panels with per-analyte reference ranges + units + flag logic, side-effect logs, secondary-malignancy screening status, and scheduled monitoring events. Re-theme the cohort to **oncology/haematology follow-up**. |
| **Backend** | Add `/api/patients/[id]/monitoring` and `/api/monitoring/panels/[id]`; reschedule hits the existing appointments endpoints. |
| **Payload contract** | Formalise a `lab_panel` payload type with `{ title, alertSummary, rows[], narrativeFields[], scheduledItems[], deepLink }`. |

---

## 5. Still needed

The remaining slides of the mockup. Specifically:

1. The **portal page behind the panel** — the amber-bordered card list and the orange top band.
2. The **Clinical Monitoring** screen the button links to.
3. The assistant's **opening/idle state** and any suggested prompts.
4. Any **other card types** (this is clearly one of a family).
5. The **closed/launcher state** of the panel.
6. Whether a **patient context header** appears in the panel.
