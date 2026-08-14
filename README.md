# Connex

An AI-assisted clinical monitoring portal for healthcare professionals, built as a working prototype.

A clinician opens a patient under active treatment monitoring and asks the **Connex** assistant about their status. Connex replies not with a paragraph but with a structured clinical card: the latest blood count with every out-of-range value flagged, current side effects, screening status, and upcoming appointments — each with a **Reschedule** button that works without leaving the conversation.

> **Prototype.** All patient data is synthetic. No live AI model is connected. Not for clinical use.

---

## Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. No environment file is needed — the app runs entirely offline out of the box.

| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm test` | Unit tests |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint |

---

## What works today

- **Connex assistant panel** — right-docked, closable, present on every screen, inheriting the patient you are viewing from the URL.
- **Structured card replies** — lab panels, trends, patient cards, lists, slot pickers, confirmations and receipts. Never plain-text dumps.
- **Reschedule, end to end** — tap Reschedule inside a card → pick a slot → confirm → the appointment actually changes and the next card reflects it.
- **Real flag logic** — out-of-range detection and the aggregate banner are computed, not authored.
- **Safety guardrails** — adverse-event mentions route to pharmacovigilance; requests for treatment decisions are declined.
- **Clinical Monitoring screen** — full-width view of the same data, reached from the card's deep link.
- **Dashboard and patient list** — cohort overview sorted by who needs attention.

Try asking: *"show the latest blood count"*, *"show hemoglobin over time"*, *"any new side effects?"*, *"who has flagged results?"*

---

## Architecture

Three seams carry the design. Each is the only place that knows a given thing is simulated, so each can be replaced independently.

```
src/lib/ai/           ← swap point 1: mock engine → real language model
src/lib/repositories/ ← swap point 2: in-memory fixtures → database
src/lib/clinical/     ← NOT a swap point: real rules, used by every surface
```

### The response contract

Assistant replies are typed objects, never strings:

```ts
type ChatMessage = {
  text?: string           // optional lead-in prose
  actionBar?: ActionRef[] // deep links, e.g. "View Clinical Monitoring"
  payload?: ChatPayload   // the structured card
  followUps?: string[]    // suggested next questions
  provenance: 'mock' | 'model'
}
```

`ChatPayload` is a discriminated union (`lab_panel`, `trend`, `patient_card`, `slot_picker`, `confirmation`, `receipt`, `list`). A component maps each variant to a renderer.

This matters because it is exactly what a real model will emit later via structured output. Swapping engines changes no component.

### Why clinical rules are real

`src/lib/clinical/` decides whether a value is out of range and derives the banner text — *"All 5 values are below the normal reference range"* — by counting flagged rows. Only the **data** is synthetic; the **rules** are genuine.

Consequences:
- The in-chat card and the full-screen table can never disagree.
- Editing a fixture cannot desynchronise the banner from the table.
- Reporting precision is defined **per analyte**, not per unit. Platelet and WBC share `x10³/µL` but report as `88` and `2.90` — inferring precision from the unit produces wrong output, and a test pins this.

### Project layout

```
src/
├── app/
│   ├── (portal)/          dashboard, patients, monitoring, about
│   └── api/               chat, patients, monitoring, appointments, health
├── components/
│   ├── connex/            assistant panel + payload renderers
│   ├── layout/            app shell
│   └── common/            shared UI
├── lib/
│   ├── ai/                provider interface, mock engine, intents
│   ├── clinical/          flag + alert rules  ← real logic
│   ├── repositories/      data access
│   └── store/             mutable demo state
├── data/                  synthetic datasets + hero fixture
├── types/                 domain and chat contracts
└── tests/unit/            clinical rules + mockup snapshot
```

---

## Synthetic data

Every record is fabricated. No real person is represented and no real medical record was used anywhere.

- Every patient carries `isSynthetic: true`; IDs are prefixed `DEMO-`.
- Generated from a **fixed seed**, so the dataset is identical on every run and in every environment.
- One **hero fixture** (`src/data/fixtures/hero-patient.ts`) reproduces the reference design exactly and is pinned by a snapshot test — changing it is an intentional change to the reference.
- Reference ranges are adult-typical and applied uniformly. Production would vary them by sex, age and laboratory.

Demo mutations (reschedules) live in memory. On serverless platforms each instance holds its own copy and state resets on cold start — acceptable, and honest, for a prototype.

---

## Configuration

Copy `.env.example` to `.env.local` if you want to change defaults. **No secrets are required and none are committed.**

| Variable | Default | Purpose |
|---|---|---|
| `AI_PROVIDER` | `mock` | Which engine answers chat. Only `mock` is implemented. |
| `AI_API_KEY` | — | Reserved for a real provider. Server-side only. |
| `DEMO_LATENCY_MIN_MS` / `_MAX_MS` | `180` / `520` | Artificial latency so loading states are exercised. |
| `DEBUG_LOGGING` | `false` | Verbose server logging. |

An unknown `AI_PROVIDER` falls back to the mock engine with a warning rather than crashing.

---

## Deploying to Vercel

1. Push this repository to GitHub.
2. Import it in Vercel — the Next.js preset is detected automatically.
3. Deploy. No environment variables are needed for the current build.

Security headers are set in `next.config.mjs`. `/api/health` reports liveness and which engine is active.

---

## Connecting a real model later

1. Implement `AIProvider` in `src/lib/ai/` (one `respond()` method).
2. Return it from the factory in `provider.ts` when `AI_PROVIDER` matches.
3. Set `AI_API_KEY` in the Vercel dashboard — never in the repository.

The model must emit the same `ChatPayload` shapes via structured output, validated with the existing Zod schemas. Tool calls should invoke the same service functions the mock engine calls, so there is no second code path. Keep the guardrails: adverse-event detection and refusal of clinical decisions belong in the system prompt as well as the router.

Before any real patient data: HIPAA/GDPR review, a BAA/DPA with the model vendor, HCP verification, and an audit log. Until then the application stays synthetic-only by design.

---

## Documentation

- [`docs/PLAN.md`](docs/PLAN.md) — full development plan, screens, flows, roadmap
- [`docs/MOCKUP-FINDINGS.md`](docs/MOCKUP-FINDINGS.md) — extraction from the reference design
