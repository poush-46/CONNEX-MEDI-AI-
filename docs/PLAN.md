# Connex — Development Plan (Stage 1)

**Status:** Draft for review. No application code has been written yet.
**Target:** Standalone Next.js web app, deployed from this GitHub repo to Vercel.
**Scope of this document:** screens, chatbot flows, components, demo data, backend, project structure, mock strategy, and future integration requirements.

---

## 0. Spec source & assumption log

**Revision 2 — reconciled against the mockup screenshot.**

The PDF never reached the workspace, but you attached a screenshot of one slide, which I have read in detail. Full extraction lives in **[`MOCKUP-FINDINGS.md`](./MOCKUP-FINDINGS.md)** — read that alongside this plan. Ten images were attached but all ten are the same slide, so **one distinct view is confirmed**; the rest of this plan remains inferred.

### Confirmed by the mockup

| # | Finding |
|---|---|
| C1 | **"Connex" is the AI assistant's own name** — the panel header reads "Connex · Your AI Assistant" with a green online dot. |
| C2 | The assistant is a **right-docked side panel** with a "×" close control, overlaying a portal page that persists behind it. |
| C3 | **Assistant replies are rich structured cards, not prose.** The reference card is a lab-results panel with a title, an aggregate alert, a 3-column table, labelled narrative fields, and scheduled-item rows. |
| C4 | **Cards embed write-actions** — green "Reschedule" buttons sit inside the assistant message. |
| C5 | **Cards embed navigation** — a "View Clinical Monitoring" pill deep-links to a dedicated **Clinical Monitoring** screen. |
| C6 | **Abnormal-value flagging is a core rule**, driving a ⚠ icon, red bold text, and a computed aggregate banner ("All 5 values are below the normal reference range"). |
| C7 | The composer reads "Ask a follow-up question…" — **follow-up turns are scoped to the card just shown**. |
| C8 | The clinical domain is **oncology / haematology treatment follow-up**: pancytopenia across all five counts, side-effect tracking, secondary-malignancy screening, and scheduled specialist check-ins. |
| C9 | Brand palette is **plum/magenta** (header, primary buttons) with **green** for scheduling actions, **red** for flags, and **amber** accents on the page behind. Dates render as `DD-MMM-YYYY`. |

### Superseded assumptions

- ~~A1 (HCP-facing with patients as reviewed data)~~ → **still open, and now genuinely ambiguous.** The card's tone ("Side Effects", "Reschedule") reads as though it could be shown to *either* a clinician reviewing a patient *or* a patient reviewing themselves. The file is named "HCP Portal", so I proceed as HCP-facing — **please confirm**.
- ~~A8 (chat surface unknown)~~ → **confirmed: docked side panel.**
- ~~Generic diabetes/cardiology demo data~~ → **replaced with oncology/haematology follow-up.**

### Still assumed

| # | Assumption |
|---|---|
| A2 | The AI layer sits on top of an existing portal rather than being the whole product. |
| A3 | Sponsor is a pharma / medical-affairs organisation. |
| A5 | Demo has no real auth; a persona switcher stands in. |
| A6 | Desktop-first, responsive to tablet/mobile. |
| A7 | English only in v1. |
| A9 | The panel inherits patient context from the page behind it (no patient header visible in the panel). |
| A10 | "Routine Blood Count" is one of a family of monitoring panels. |

**To lock the rest down I need the remaining slides** — see §11.

## 1. Product summary

**Connex** is a standalone HCP portal with an integrated AI assistant — itself named **Connex** — presented as a right-docked side panel available on every screen.

The demo centres on **oncology / haematology treatment follow-up**. A clinician opens a patient under active therapy monitoring and asks the assistant about their status. Connex replies not with a paragraph but with a **structured clinical card**: the latest blood count panel with every out-of-range value flagged, an aggregate alert, current side effects, secondary-malignancy screening status, and the patient's upcoming monitoring appointments — each with a **Reschedule** button the clinician can press without leaving the conversation. A **View Clinical Monitoring** action deep-links to the full monitoring screen, and the composer invites a follow-up question scoped to what was just shown.

That single interaction defines the product: **the assistant is a structured-data surface with embedded actions, not a text chatbot.**

**Stage-1 principle:** every AI response is produced by a deterministic local mock engine behind a stable interface, so a real model can be dropped in later by swapping one module — no UI changes required.

**Non-negotiables (from the brief):**
- Standalone; no Arena runtime dependency, no Arena branding, badges, or watermarks anywhere in the UI.
- No hard-coded API keys or secrets; all config through environment variables with a committed `.env.example`.
- Synthetic/demo patient data only — clearly fake names, no real PHI.
- No external AI API connected in this stage.

---

## 2. Required screens

Priority reflects the mockup: anything the confirmed slide touches is **P0**.

### 2.1 Entry & shell

| # | Screen | Route | Purpose | Pri |
|---|--------|-------|---------|-----|
| S1 | **Sign in / Persona select** | `/login` | Demo-only gate. Pick a synthetic HCP persona (oncologist, haematologist, nurse navigator). No password. Banner: "Demo environment — synthetic data". | P1 |
| S2 | **App shell** | — | Persistent frame wrapping all authed routes: top bar, left nav, content slot, and the **right-docked Connex panel**. Panel open/closed state is global and persisted. | **P0** |

### 2.2 Core

| # | Screen | Route | Purpose & key content | AI touchpoints | Pri |
|---|--------|-------|----------------------|----------------|-----|
| S3 | **Dashboard / Home** | `/` | Greeting; stat cards (patients on active monitoring, flagged results, upcoming appointments, unread alerts); **"Needs attention" list of patients with out-of-range results** — rendered as the amber-left-border cards seen behind the panel. | Daily brief; suggested next actions. | **P0** |
| S4 | **Patient list** | `/patients` | Table of synthetic patients: name, ID, age/sex, regimen, cycle, monitoring status, last panel date, flagged-count badge, next appointment. Filter by regimen/flag status. | NL filter ("who has flagged counts this week"); cohort summary. | **P0** |
| S5 | **Patient detail** | `/patients/[id]` | Header (demographics, regimen, cycle, allergies). Tabs: **Overview**, **Clinical Monitoring**, **Medications**, **Timeline**, **Documents**. | "Summarise this patient"; opens the panel with patient context. | **P0** |
| **S6** | **Clinical Monitoring** ⭐ | `/patients/[id]/monitoring` | **Confirmed by the mockup — the target of "View Clinical Monitoring".** Full-screen view of all monitoring panels: latest blood count with reference ranges and flags, trend charts per analyte across cycles, side-effect log, secondary-malignancy screening history, and the schedule of upcoming monitoring events with reschedule controls. | Panel summary; explain-a-result; reschedule. | **P0** |
| S7 | **AI Assistant (full page)** | `/assistant` | Wider canvas for the same engine, with conversation history. Secondary surface — the docked panel is primary. | Whole screen. | P2 |
| S8 | **Appointments / Scheduling** | `/appointments` | Calendar + list of blood work, specialist check-ins, infusions. Book, **reschedule**, cancel. Receives the reschedule sub-flow from chat cards. | Conversational booking; slot suggestions. | **P0** |
| S9 | **Content / Resource library** | `/content` | Clinical papers, regimen guides, patient-support materials. Filter by therapy area/type. | Semantic search; abstract summaries. | P2 |
| S10 | **Content detail** | `/content/[id]` | Reader view + "discuss with assistant". | Grounded Q&A. | P2 |
| S11 | **Messages / Requests** | `/messages` | Threads with medical information teams. Status chips. | Draft reply; classification. | P2 |
| S12 | **Requests: Medical Information** | `/requests/medical-info` | Structured MIR form + submission history. | Chat-driven fill. | P2 |
| S13 | **Notifications** | `/notifications` | Alerts: flagged results, appointment reminders, new content. | Prioritisation. | P1 |
| S14 | **Profile & preferences** | `/profile` | HCP details, specialty, notification preferences. | — | P2 |
| S15 | **Settings** | `/settings` | Theme, density, assistant settings, **reset demo data**. | — | P1 |

### 2.3 Supporting / system

| # | Screen | Route | Purpose | Pri |
|---|--------|-------|---------|-----|
| S16 | **Global search** | `/search?q=` | Across patients, content, messages. | P2 |
| S17 | **About / Demo disclaimer** | `/about` | Prototype; synthetic data; not for clinical use; no live AI connected. | P1 |
| S18 | **404 / Error** | `not-found`, `error` | Graceful failures. | P1 |

**Every screen S3–S16 ships four states:** loading (skeleton), empty, error, populated.

### 2.4 The Connex panel — states (from the mockup)

The panel is a screen in its own right and needs its own state machine:

1. **Closed / launcher** — floating circular "C" button, bottom-right.
2. **Open / idle** — header, greeting, suggested prompt chips, empty composer.
3. **Thinking** — typing indicator while the mock engine "works".
4. **Card response** ⭐ — the confirmed state: optional deep-link action bar, assistant avatar, structured card, composer reading "Ask a follow-up question…".
5. **Follow-up context** — subsequent turns scoped to the last card.
6. **Confirming an action** — reschedule picker / confirm–cancel.
7. **Action complete** — success receipt with updated date.
8. **Error / fallback**.

---

## 3. Required chatbot conversation flows

### 3.1 Architecture

Deterministic **intent router** in v1:

```
user message
  → normalise
  → intent classifier (scored keyword/regex patterns; pluggable)
  → slot extraction (patient, analyte, panel, date, appointment, drug)
  → flow handler (asks follow-ups to fill missing slots)
  → response composer → ChatResponse
```

**The response contract is the heart of the system.** The mockup proves replies are structured cards, so the engine returns typed objects — never raw strings:

```ts
type ChatResponse = {
  id: string
  role: 'assistant'
  text?: string                 // optional lead-in prose
  actionBar?: ActionRef[]       // e.g. "View Clinical Monitoring"
  payload?: ChatPayload         // the rich card
  followUps?: string[]          // suggested next questions
  provenance: 'mock' | 'model'
}

type ChatPayload =
  | { type: 'lab_panel';    data: LabPanelPayload }      // ⭐ confirmed
  | { type: 'patient_card'; data: PatientSummary }
  | { type: 'appointment_slots'; data: SlotPicker }
  | { type: 'confirmation'; data: ConfirmationCard }
  | { type: 'receipt';      data: ActionReceipt }
  | { type: 'trend_chart';  data: SeriesPayload }
  | { type: 'content_results'; data: ContentHit[] }

// Modelled directly on the mockup card:
type LabPanelPayload = {
  title: string                    // "Routine Blood Count"
  collectedOn: string              // DD-MMM-YYYY
  alert?: { severity: 'warning'|'critical'; message: string }  // computed
  rows: Array<{
    test: string                   // "Hemoglobin"
    normalRange: string            // "12.0 – 15.5 g/dL"
    result: string                 // "9.80 g/dL"
    flag: 'low' | 'high' | 'normal'
  }>
  narrativeFields: Array<{ label: string; value: string }>     // Side Effects, Secondary Malignancies
  scheduledItems: Array<{
    id: string
    label: string                  // "Scheduled Blood Work"
    date: string                   // "17-Sep-2026"
    action: { type: 'reschedule'; appointmentId: string }
  }>
}
```

This object is exactly what a real LLM will later emit via structured output / tool calls — **so the UI never changes when we swap engines.**

State per session: `messages[]`, `activeFlow`, `slots{}`, `pageContext` (route + patient id), `lastPayload` (for card-scoped follow-ups).

### 3.2 Flows

⭐ = directly evidenced by the mockup.

| # | Flow | Trigger examples | Behaviour |
|---|------|-----------------|-----------|
| F1 | **Greeting & capability** | panel opens, "hi" | Persona-aware welcome + 4 suggested chips. |
| F2 | **Patient lookup** | "show me Patient A", "open P-1042" | Disambiguate → patient card + deep link. |
| F3 | ⭐ **Lab / monitoring panel review** | "how are their counts", "latest blood work", "routine blood count" | **The mockup flow.** Emits `lab_panel`: flags every out-of-range analyte, computes the aggregate banner, appends side effects + malignancy screening, lists scheduled items with Reschedule, and surfaces the "View Clinical Monitoring" action bar. |
| F4 | ⭐ **Reschedule from a card** | tapping **Reschedule** inside a card | Sub-flow: show 3 candidate slots → confirm → update demo appointment → success receipt with the new date → the originating card re-renders updated. Cancellable at every step. |
| F5 | ⭐ **Card-scoped follow-up Q&A** | "why is the platelet low", "which one is worst", "when was the last panel" | Resolves pronouns against `lastPayload`; answers from the card's own data, with a "results only — not clinical advice" guard. |
| F6 | **Analyte trend** | "show hemoglobin over time" | `trend_chart` across cycles with reference band. |
| F7 | **Side-effect review** | "any new side effects" | Lists logged side effects with onset/severity/grade. |
| F8 | **Screening status** | "any secondary malignancies" | Returns screening status + last screening date. |
| F9 | **Patient summary** | "summarise this patient" | Template-composed: regimen, cycle, flagged results, side effects, upcoming events. |
| F10 | **Cohort query** | "who has flagged counts this week" | Filters dataset → count + table card + "open in patient list". |
| F11 | **Appointment booking** | "book a follow-up" | Slot fill → confirm → create. |
| F12 | **Appointment management** | "cancel Thursday's blood work" | Resolve → confirm → update. |
| F13 | **Drug / regimen information** | "dosing for X" | Monograph excerpt + source chip + disclaimer. |
| F14 | **Drug interaction check** | "can I combine A and B" | Severity badge, mechanism, recommendation, disclaimer. |
| F15 | **Content discovery** | "papers on febrile neutropenia" | Scored search → 3 cards + "see all". |
| F16 | **Document Q&A** | from S10 | Answer + quoted passage. |
| F17 | **Medical information request** | "ask medical affairs" | Slot fill → confirm → MIR reference number. |
| F18 | **Navigation** | "open clinical monitoring" | Emits a navigate action. |
| F19 | **Explain / define** | "what is hematocrit" | Glossary lookup. |
| F20 | **Adverse event interlock** | AE-like phrasing detected | **Highest priority — pre-empts all other intents.** No clinical advice; shows the pharmacovigilance notice + "Report AE" action. |
| F21 | **Clinical-decision refusal** | "should I stop their treatment" | Declines; restates it is a non-clinical demo; offers information alternatives. |
| F22 | **Fallback & clarification** | unmatched | Nearest 4 capabilities. Two consecutive fallbacks → offer handoff. |
| F23 | **Human handoff** | "talk to a person" | Creates a demo enquiry thread. |
| F24 | **Session utilities** | "clear chat", "start over" | Resets flow, slots, and `lastPayload`. |

### 3.3 Cross-cutting rules

- **Context inheritance** — the panel reads the current route/patient, so "how are their counts" works on S5/S6 with no name given (assumption A9).
- **Confirm before every write** — F4, F11, F12, F17 all show a confirmation card with Confirm / Edit / Cancel.
- **Flagging is computed, never authored** — the banner text and its count derive from the rows, so demo data stays the single source of truth.
- **Interruption handling** — a new high-confidence intent mid-flow asks before abandoning the current one.
- **Provenance on every assistant turn** — a `Demo response — no live AI model connected` chip, plus source links where relevant.
- **Simulated streaming** — cards render progressively (text → skeleton → populated) so switching to real token streaming needs no UI change.
- **Accessibility** — flags are never colour-only (⚠ icon + text label); the message list is an ARIA live region.

---

## 4. Required components

⭐ = visible in the mockup, so needed for the hero interaction.

### 4.1 Layout & shell
`AppShell`, `TopBar`, `SideNav`, `NavItem`, `PageHeader`, `Breadcrumbs`, `ContentContainer`, ⭐`RightDockPanel` (docked/resizable/collapsible, persisted state), `MobileNavDrawer`, `Footer` (demo disclaimer), ⭐`AccentCard` (amber left-border card seen behind the panel).

### 4.2 Connex panel / chat layer
⭐`ChatLauncher` (floating "C" FAB) · ⭐`ConnexPanel` (the docked shell) · ⭐`PanelHeader` (gradient plum bar: avatar, "Connex", "Your AI Assistant", ⭐`OnlineDot`, ⭐`CloseButton`) · ⭐`DeepLinkActionBar` (right-aligned pill row, e.g. "View Clinical Monitoring") · ⭐`MessageList` · ⭐`AssistantAvatar` (navy "C" badge) · ⭐`MessageRow` (user / assistant / system) · `TypingIndicator` · `StreamingText` · `SuggestedPrompts` · ⭐`ChatComposer` (pill input, "Ask a follow-up question…", ⭐`SendButton` magenta circle) · `ProvenanceBadge` · `SourceChip` · `SlotFillPrompt` · `ConversationHistoryList` · `AIDisclaimerBanner` · `AIInsightCard` (embeds assistant output into normal screens).

### 4.3 Chat payload renderers
`ChatPayloadRenderer` maps `payload.type → component`:

- ⭐**`LabPanelCard`** — the hero component. Composes:
  - ⭐`CardTitle` ("Routine Blood Count")
  - ⭐`MonitoringAlertBanner` (pink bg, ⚠, computed "All N values are below the normal reference range")
  - ⭐`LabResultTable` — columns Test / Normal Range / Result; rows via ⭐`RangeCell` and ⭐`FlaggedValue` (⚠ + red bold, with an accessible text label)
  - ⭐`NarrativeField` × n (bold label + value: Side Effects, Secondary Malignancies)
  - ⭐`ScheduledItemRow` × n (label + `DD-MMM-YYYY` date + ⭐`RescheduleButton`, green)
- `PatientCard`, `PatientTableCard`, `TrendChartCard`, `AppointmentSlotPicker`, `ConfirmationCard`, `ActionReceiptCard`, `ContentResultCard`, `DrugInfoCard`, `InteractionWarningCard`, `ActionButtonRow`.

### 4.4 Data display
`StatCard`, `DataTable` (sort/filter/paginate), `FilterBar`, `SearchInput`, `StatusChip`, `FlagBadge`, `Timeline`, `TimelineEvent`, `AnalyteTrendChart` (with shaded reference band), `LabPanelTable` (full-screen variant of the card table), `SideEffectLog`, `ScreeningStatusBlock`, `MedicationList`, `CycleIndicator`, `Avatar`, `EmptyState`, `SkeletonBlock`, `ErrorState`, `Pagination`, `TabBar`.

> `LabResultTable` (compact, in-chat) and `LabPanelTable` (full-screen) share one `useLabFlags` hook so flag logic exists in exactly one place.

### 4.5 Forms & primitives
`Button` (variants: primary-magenta, success-green, ghost), `IconButton`, `Input`, `Textarea`, `Select`, `Combobox`, `DatePicker`, `TimeSlotGrid`, `Checkbox`, `RadioGroup`, `Switch`, `FormField`, `Modal`, `Drawer`, `Popover`, `Tooltip`, `Toast`, `AlertBanner`, `Card`, `Badge`, `Separator`, `Spinner`.

> Primitives from **shadcn/ui**, copied into the repo — no runtime UI-vendor lock-in. Domain components hand-built on top.

### 4.6 Providers & hooks
Providers: `ThemeProvider`, `PersonaProvider`, `DemoDataProvider`, `ChatProvider` (messages, activeFlow, slots, lastPayload), `PageContextProvider` (feeds route + patient id to the panel), `ToastProvider`.

Hooks: `useChat`, `usePageContext`, `usePatients`, `useMonitoring`, `useLabFlags`, `useAppointments`, `useContent`, `useNotifications`, `useLocalPersistence`.

---

## 5. Required demo data

All synthetic, **seeded for reproducibility**, stored as typed modules under `src/data/`. Therapy area re-scoped to **oncology / haematology treatment follow-up** per finding C8.

**Safety conventions:** invented names from a fixed pool, no real-person resemblance; every patient record carries `isSynthetic: true`; IDs use a `DEMO-` prefix; a persistent UI disclaimer. Values are plausible but illustrative and must never be read as clinical guidance.

| Dataset | Volume | Key fields |
|---|---|---|
| **HCP personas** | 3 | id, name, credentials, specialty (medical oncology / haematology / nurse navigator), institution, avatar |
| **Patients** | 30–40 | id, name, age, sex, diagnosis, regimen, cycleNumber, startDate, allergies[], monitoringStatus, assignedHcpId, `isSynthetic` |
| ⭐ **Lab panels** | 6–12 per patient (one per cycle) | id, patientId, panelType ("Routine Blood Count"), collectedOn, results[] |
| ⭐ **Lab results (analytes)** | 5 per panel | test, value, unit, refLow, refHigh, displayRange, flag (`low`/`high`/`normal`) — **flag is computed, not stored by hand** |
| ⭐ **Reference ranges** | per analyte | RBC 4.20–5.40 M/µL · Hemoglobin 12.0–15.5 g/dL · Hematocrit 34.9–44.5 % · Platelet 150–450 ×10³/µL · WBC 4.5–11.0 ×10³/µL (see open question on sex/age variance) |
| ⭐ **Side-effect log** | 2–6 per patient | term (headache, fatigue, mild diarrhea), grade, onsetDate, ongoing, notes |
| ⭐ **Screening records** | 1–3 per patient | type ("Secondary Malignancies"), lastScreenedOn, outcome ("None found"), nextDue |
| ⭐ **Scheduled monitoring events** | 2–4 per patient | id, label ("Scheduled Blood Work", "Scheduled Specialist Check-in"), date (`DD-MMM-YYYY`), type, status, rescheduleable |
| **Appointment slots** | rolling 30 days | for the reschedule sub-flow |
| **Medications** | 2–6 per patient | drug, dose, frequency, route, startDate, status |
| **Encounters / timeline** | 5–15 per patient | date, type, summary, author |
| **Drug catalogue** | 20–30 | name, generic, class, indications, dosing, warnings, monograph excerpt |
| **Interaction matrix** | ~40 pairs | drugA, drugB, severity, mechanism, recommendation |
| **Content library** | 20–30 | title, type, therapyArea, abstract, body, authors, date, readTime |
| **Messages / threads** | 8–12 | subject, type, status, participants, messages[] |
| **Notifications** | 10–15 | type, title, body, timestamp, read |
| **Glossary** | 40–60 | term, definition (hematocrit, neutropenia, nadir…) |
| **Response templates** | per flow | interpolated copy for F1–F24 |
| **Suggested prompts** | per route | context-aware chips |

### 5.1 The hero fixture

One patient must reproduce the mockup **exactly** — all five counts low, those side effects, "None found" screening, and blood work / specialist check-in on 17-Sep-2026 and 20-Sep-2026. This doubles as the demo's opening scene and as a snapshot test.

```ts
// src/data/fixtures/hero-patient.ts  (illustrative)
{
  id: 'DEMO-P-1042', isSynthetic: true,
  panel: {
    title: 'Routine Blood Count', collectedOn: '12-Sep-2026',
    results: [
      { test: 'RBC Count',  value: 3.60, unit: 'M/µL',     refLow: 4.20, refHigh: 5.40 },
      { test: 'Hemoglobin', value: 9.80, unit: 'g/dL',     refLow: 12.0, refHigh: 15.5 },
      { test: 'Hematocrit', value: 29.5, unit: '%',        refLow: 34.9, refHigh: 44.5 },
      { test: 'Platelet',   value: 88,   unit: 'x10³/µL',  refLow: 150,  refHigh: 450  },
      { test: 'WBC',        value: 2.90, unit: 'x10³/µL',  refLow: 4.5,  refHigh: 11.0 },
    ],
  },
  sideEffects: ['Headache', 'Fatigue', 'Mild diarrhea'],
  screening: { type: 'Secondary Malignancies', outcome: 'None found' },
  scheduled: [
    { label: 'Scheduled Blood Work',            date: '17-Sep-2026' },
    { label: 'Scheduled Specialist Check-in',   date: '20-Sep-2026' },
  ],
}
```

The banner "All 5 values are below the normal reference range" is **derived** at render time: count flagged rows, and if all are `low` use "All N values are below…", otherwise "N values are outside…".

### 5.2 Mutable state

Reschedules, bookings, and read flags write to an in-memory server store mirrored to `localStorage`, with **Reset demo data** in Settings. No database in v1.

---

## 6. Required backend functionality

Next.js **Route Handlers** under `src/app/api/`. Three layers: thin HTTP handler → service (business logic) → repository (data access). **Only the repository layer knows the data is mock**, so a real database replaces it without touching routes.

| Endpoint | Method | Purpose | Pri |
|---|---|---|---|
| `/api/session` | GET/POST | Current persona; switch persona. | P1 |
| `/api/patients` | GET | List: `q`, `regimen`, `flagged`, `sort`, `page`. | **P0** |
| `/api/patients/[id]` | GET | Full record. | **P0** |
| ⭐ `/api/patients/[id]/monitoring` | GET | All monitoring data: panels, side effects, screening, scheduled events. Powers S6 **and** flow F3. | **P0** |
| ⭐ `/api/monitoring/panels/[panelId]` | GET | One lab panel with computed flags + alert summary. | **P0** |
| `/api/monitoring/trends` | GET | Analyte series across cycles (`patientId`, `analyte`). | P1 |
| `/api/patients/[id]/summary` | POST | AI summary (mock engine). | P1 |
| ⭐ `/api/appointments` | GET/POST | List; book. | **P0** |
| ⭐ `/api/appointments/[id]` | PATCH/DELETE | **Reschedule** / cancel — target of the card button. | **P0** |
| ⭐ `/api/appointments/slots` | GET | Candidate slots for the reschedule sub-flow. | **P0** |
| ⭐ `/api/chat` | POST | **Core endpoint.** `{ messages, context: { route, patientId }, sessionId }` → `ChatResponse` with structured payload. **SSE-streamed from day one**, backed by the mock engine. | **P0** |
| `/api/chat/sessions` | GET/DELETE | History; clear. | P1 |
| `/api/content` | GET | Search/filter library. | P2 |
| `/api/content/[id]` | GET | Single resource. | P2 |
| `/api/drugs` | GET | Drug lookup. | P2 |
| `/api/drugs/interactions` | POST | Interaction check. | P2 |
| `/api/messages` | GET/POST | Threads; create/reply. | P2 |
| `/api/requests/medical-info` | GET/POST | MIRs. | P2 |
| `/api/notifications` | GET/PATCH | List; mark read. | P1 |
| `/api/search` | GET | Cross-entity search. | P2 |
| `/api/demo/reset` | POST | Reset mutable demo state. | P1 |
| `/api/health` | GET | Liveness probe for uptime checks. | P1 |

### 6.1 Domain logic that belongs on the server

- **Flag computation** — `evaluateAnalyte(value, refLow, refHigh) → 'low' | 'high' | 'normal'`, in one shared module used by the API, the chat engine, and both table components. Never hand-authored in fixtures.
- **Alert summarisation** — derive the banner text and count from flagged rows.
- **Reschedule validation** — slot availability, no past dates, no double-booking; returns the updated event so the originating card can re-render.
- **Context resolution** — turn `{ route, patientId }` into the entity the chat engine reasons over.

### 6.2 Cross-cutting

Zod validation on every input · typed error envelope `{ error: { code, message } }` · configurable simulated latency (150–600 ms) so loading states are exercised · in-memory rate limiting on `/api/chat` · debug-flagged request logging · all responses typed end-to-end from `src/types/`.

---

## 7. Recommended project structure

```
CONNEX-MEDI-AI-/
├── README.md                       # setup, scripts, deploy, demo-data notice
├── LICENSE
├── .env.example                    # documented vars, NO real values
├── .gitignore  .nvmrc  .prettierrc
├── package.json  tsconfig.json
├── next.config.mjs                 # security headers
├── tailwind.config.ts              # Connex brand tokens
├── postcss.config.mjs
├── components.json                 # shadcn/ui config
├── eslint.config.mjs
├── vitest.config.ts  playwright.config.ts
├── vercel.json                     # optional: region/headers
│
├── .github/workflows/ci.yml        # typecheck → lint → test → build
│
├── docs/
│   ├── PLAN.md                     # this document
│   ├── MOCKUP-FINDINGS.md          # extraction from the mockup slide
│   ├── SPEC-MAPPING.md             # slide → screen/component traceability
│   ├── CHAT-FLOWS.md               # full conversation trees
│   ├── DATA-MODEL.md               # entities + field dictionary
│   ├── API.md                      # endpoint contracts
│   └── ROADMAP.md                  # staged delivery
│
├── public/
│   ├── favicon.ico
│   ├── logo.svg                    # Connex mark
│   └── images/                     # synthetic avatars, thumbnails
│
└── src/
    ├── app/
    │   ├── layout.tsx              # providers, fonts, metadata
    │   ├── globals.css
    │   ├── not-found.tsx  error.tsx
    │   ├── login/page.tsx                      # S1
    │   ├── (portal)/                           # authed group → AppShell + ConnexPanel
    │   │   ├── layout.tsx
    │   │   ├── page.tsx                        # S3  Dashboard
    │   │   ├── patients/
    │   │   │   ├── page.tsx                    # S4  Patient list
    │   │   │   └── [id]/
    │   │   │       ├── page.tsx                # S5  Patient detail
    │   │   │       └── monitoring/page.tsx     # S6  ⭐ Clinical Monitoring
    │   │   ├── assistant/page.tsx              # S7
    │   │   ├── appointments/page.tsx           # S8
    │   │   ├── content/
    │   │   │   ├── page.tsx                    # S9
    │   │   │   └── [id]/page.tsx               # S10
    │   │   ├── messages/page.tsx               # S11
    │   │   ├── requests/medical-info/page.tsx  # S12
    │   │   ├── notifications/page.tsx          # S13
    │   │   ├── profile/page.tsx                # S14
    │   │   ├── settings/page.tsx               # S15
    │   │   ├── search/page.tsx                 # S16
    │   │   └── about/page.tsx                  # S17
    │   └── api/                                # §6 route handlers
    │       ├── chat/route.ts                   # ⭐ SSE
    │       ├── patients/[id]/monitoring/route.ts
    │       ├── monitoring/panels/[panelId]/route.ts
    │       ├── appointments/[id]/route.ts      # ⭐ reschedule
    │       └── …
    │
    ├── components/
    │   ├── ui/                     # shadcn primitives
    │   ├── layout/                 # AppShell, TopBar, SideNav, RightDockPanel
    │   ├── connex/                 # ⭐ the assistant panel
    │   │   ├── ConnexPanel.tsx
    │   │   ├── PanelHeader.tsx
    │   │   ├── ChatLauncher.tsx
    │   │   ├── MessageList.tsx
    │   │   ├── ChatComposer.tsx
    │   │   ├── DeepLinkActionBar.tsx
    │   │   └── payloads/           # ⭐ card renderers
    │   │       ├── ChatPayloadRenderer.tsx
    │   │       ├── LabPanelCard.tsx            # ⭐ hero component
    │   │       ├── LabResultTable.tsx
    │   │       ├── MonitoringAlertBanner.tsx
    │   │       ├── NarrativeField.tsx
    │   │       ├── ScheduledItemRow.tsx
    │   │       ├── AppointmentSlotPicker.tsx
    │   │       ├── ConfirmationCard.tsx
    │   │       └── ActionReceiptCard.tsx
    │   ├── monitoring/             # S6 full-screen views
    │   ├── patients/  appointments/  content/  messages/
    │   └── common/                 # StatCard, DataTable, EmptyState, …
    │
    ├── lib/
    │   ├── ai/                     # ★ SWAP POINT 1 — mock → real model
    │   │   ├── provider.ts         # AIProvider interface
    │   │   ├── mock-provider.ts    # v1 deterministic engine
    │   │   ├── openai-provider.ts  # later, env-gated
    │   │   ├── index.ts            # factory reads AI_PROVIDER
    │   │   ├── intents/            # classifier + F1–F24 handlers
    │   │   ├── slots/              # entity extraction
    │   │   ├── prompts/            # system prompts (future-ready)
    │   │   └── templates/          # response copy
    │   ├── repositories/           # ★ SWAP POINT 2 — mock → database
    │   ├── services/               # business logic
    │   ├── clinical/               # ⭐ flag + alert rules (single source of truth)
    │   │   ├── evaluate-analyte.ts
    │   │   └── summarise-panel.ts
    │   ├── api/                    # typed client fetchers
    │   ├── validation/             # Zod schemas
    │   ├── config/env.ts           # validated env access, no literals
    │   ├── store/                  # in-memory mutable demo state
    │   └── utils/                  # date fmt (DD-MMM-YYYY), cn, …
    │
    ├── data/                       # §5 synthetic datasets
    │   ├── seed.ts
    │   ├── fixtures/hero-patient.ts   # ⭐ reproduces the mockup exactly
    │   ├── personas.ts  patients.ts
    │   ├── lab-panels.ts  reference-ranges.ts
    │   ├── side-effects.ts  screenings.ts
    │   ├── appointments.ts  drugs.ts  interactions.ts
    │   ├── content.ts  messages.ts  notifications.ts
    │   ├── glossary.ts  chat-templates.ts
    │   └── suggested-prompts.ts
    │
    ├── types/                      # shared types & ChatPayload contracts
    ├── hooks/                      # useChat, useLabFlags, usePageContext, …
    ├── styles/                     # design tokens from the mockup
    └── tests/
        ├── unit/                   # flag logic, alert summary, intent router
        └── e2e/                    # the hero journey
```

**Why this shape.** Three directories carry the architectural weight:

- **`lib/ai/`** — the only place that knows responses are mocked. Swapping in a real model is one new file plus an env var.
- **`lib/repositories/`** — the only place that knows data is in-memory. Swapping in Postgres touches nothing above it.
- **`lib/clinical/`** — flag and alert rules live once and are consumed by the API, the chat engine, the in-chat table, and the full-screen table. This is what stops the mockup's red ⚠ styling from drifting between surfaces.

---

## 8. Features that initially use mock responses

| Feature | v1 mock behaviour | Later replacement |
|---|---|---|
| ⭐ Chat responses | Intent router + templates emitting **typed payloads**; simulated streaming | LLM via `AIProvider`, structured output |
| ⭐ Lab panel card | Composed from seeded fixtures; **flags computed by real rule code** | Same rules, data from EHR/LIS |
| ⭐ Reschedule action | Writes to in-memory store; returns updated event | Real scheduling system |
| Patient summaries | Template composition from record fields | LLM summarisation |
| Card-scoped follow-ups | Pattern matching over `lastPayload` | LLM with payload in context |
| Cohort NL queries | Keyword → filter predicates | LLM → structured query |
| Content search | Lexical scoring | Vector / semantic search |
| Document Q&A | Passage matching | RAG over embeddings |
| Drug info / interactions | Static demo catalogue + matrix | Licensed clinical data source |
| Suggested prompts | Route-based rules | Model-ranked |
| Auth | Persona switcher, no password | Real identity provider + HCP verification |
| Persistence | In-memory + `localStorage` | Postgres |
| Notifications | Static seeded | Event-driven |
| Analytics | No-op logger | Real analytics |

**Note the deliberate exception:** flag evaluation and alert summarisation are **real logic from day one**, not mocked. Only the *data* is synthetic. That keeps the clinical presentation layer honest and means the swap to real data changes nothing in the rules.

The mock provider is **deterministic** (fixed seed) so demos and snapshot tests are repeatable.

---

## 9. What we will need later

### 9.1 Real AI API
- Choose provider (OpenAI / Anthropic / Azure OpenAI / self-hosted) and model.
- `openai-provider.ts` implementing the same `AIProvider` interface; the factory selects via `AI_PROVIDER`.
- Env — **server-side only**, never `NEXT_PUBLIC_*`, never committed: `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`, `AI_BASE_URL`, `AI_MAX_TOKENS`.
- **Structured output is mandatory** — the model must emit the same `ChatPayload` shapes (JSON schema / tool calling), or the card UI breaks. Validate every model response with the existing Zod schemas and fall back to the mock renderer on a schema miss.
- **Tool calling** mapped to the existing service layer, so the model triggers the *same* reschedule/booking functions the mock engine calls. No parallel code path.
- System prompts with strict scope guardrails, the AE interlock (F20), and refusal of clinical decision-making (F21).
- Token streaming over the existing SSE endpoint; token budgeting, cost logging, retries with backoff, timeouts, and a circuit breaker that falls back to the mock provider.
- Abuse controls: per-session rate limits, input length caps, PII scrubbing before egress.
- Evaluation set (~50 prompts across flows) with expected payload types and guardrail assertions.

### 9.2 Database
- **Recommended:** Postgres (Vercel Postgres / Neon / Supabase) with **Prisma** or **Drizzle**.
- Schema mirrors `src/types/`; migrations committed. Key tables: patients, lab_panels, lab_results, reference_ranges, side_effects, screenings, appointments, messages, content, chat_sessions.
- Repository implementations swap from mock to DB; the seed script reuses `src/data/` so demo mode survives.
- If RAG is adopted: `pgvector` for content embeddings + an ingestion job.
- Env: `DATABASE_URL`, `DIRECT_URL`. Connection pooling for serverless.
- Backups and a documented retention position for chat logs.

### 9.3 Auth & compliance
- Auth.js or Clerk; **HCP verification** is a real-world requirement in pharma contexts.
- Roles (HCP / admin), session hardening, and an **audit log of AI interactions** — expected wherever AI output touches patient care.
- Consent capture and cookie notice.
- **Before any real patient data:** formal HIPAA/GDPR review, a BAA/DPA with the AI vendor, and a decision on whether AI output near clinical data triggers medical-device/CDS regulation. **Until all of that is settled the app stays synthetic-only** — which is exactly why v1 is built this way.

### 9.4 Deployment (Vercel)
- Import the GitHub repo; Next.js preset auto-detected.
- Env vars per environment (Production / Preview / Development) in the Vercel dashboard — never in the repo.
- Preview deployments on PRs; production on `main`.
- Custom domain + HTTPS; security headers (CSP, HSTS, X-Frame-Options) in `next.config.mjs`.
- GitHub Actions CI: typecheck → lint → test → build, required before merge.
- Optional: Vercel Analytics, Sentry, uptime check on `/api/health`.
- Node pinned via `.nvmrc` and `engines`.

---

## 10. Proposed delivery stages

Reordered so the **mockup's hero interaction works end-to-end as early as possible** — that is the thing worth demoing.

| Stage | Deliverable |
|---|---|
| **0** | ✅ This plan + `MOCKUP-FINDINGS.md` — awaiting your sign-off |
| **1** | Scaffold: Next.js + TS + Tailwind + shadcn, **brand tokens from the mockup**, app shell, nav, routing, CI |
| **2** | Data layer: types, hero fixture, seeded datasets, `lib/clinical/` flag rules **with unit tests**, repositories |
| **3** | ⭐ **The hero slice** — `ConnexPanel` + `LabPanelCard` pixel-matched to the mockup, `/api/chat` SSE, mock engine with F1/F3, rendering the hero patient. *This is the first demoable milestone.* |
| **4** | ⭐ Interactivity: reschedule sub-flow (F4), appointments API, card-scoped follow-ups (F5), Clinical Monitoring screen (S6) + the "View Clinical Monitoring" deep link |
| **5** | Portal context: dashboard (S3), patient list (S4), patient detail (S5) — the amber-accented pages behind the panel |
| **6** | Broader flows: trends, side effects, screening, summaries, cohort queries, booking (F6–F12) |
| **7** | Safety & settings: AE interlock (F20), refusal (F21), fallback/handoff (F22–F23), settings, about, notifications |
| **8** | Secondary surfaces: content library, document Q&A, messages, MIRs, full-page assistant |
| **9** | Polish: responsive, a11y (WCAG 2.1 AA — flags never colour-only, ARIA live regions), all four states per screen, e2e tests |
| **10** | Deployment: Vercel, env docs, README, handover |

Stages 1–4 constitute a credible demo on their own.

---

## 11. Open questions

**Blocking-ish — these shape architecture:**

1. **The remaining slides.** I have one view of what is clearly a multi-slide deck. Most valuable next: the page *behind* the panel, the **Clinical Monitoring** screen, the panel's idle/empty state, and any other card types. Screenshots work fine — the PDF itself has failed to upload twice.
2. **Audience — HCP or patient?** The file says "HCP Portal", but the card's tone ("Side Effects", "Reschedule") could equally be patient-facing. This changes vocabulary, data visibility, and safety guardrails throughout. *My working assumption: HCP-facing.*
3. **Patient context in the panel** — does the panel show a patient name/ID header, or does it silently inherit from the page behind (assumption A9)?

**Important, not blocking:**

4. **Brand values** — do you have real Connex hex codes, fonts, and a logo? I have estimated the plum/magenta/green palette from the screenshot (see `MOCKUP-FINDINGS.md` §3) and will use those placeholders otherwise.
5. **Reference ranges** — fixed for all patients, or varying by sex/age? The mockup's values look female-adult-typical.
6. **Other monitoring panels** besides "Routine Blood Count" — liver function, renal, imaging?
7. **Reschedule behaviour** — pick from offered slots, free date picker, or request-and-confirm?
8. **Regimen/diagnosis** for the demo cohort — should the synthetic patients be on a specific named therapy, or kept generic?
9. **Demo date/audience** — anything that should shape scope or the priority ordering above?
