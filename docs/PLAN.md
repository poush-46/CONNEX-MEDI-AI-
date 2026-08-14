# Connex — Development Plan (Stage 1)

**Status:** Draft for review. No application code has been written yet.
**Target:** Standalone Next.js web app, deployed from this GitHub repo to Vercel.
**Scope of this document:** screens, chatbot flows, components, demo data, backend, project structure, mock strategy, and future integration requirements.

---

## 0. Spec source & assumption log

> **Important:** The uploaded PDF (`HCP Portal_AI Layer Mockup - Copy.pdf`) did not reach the build workspace — the upload directory never materialised on the filesystem, so I could not read it. This plan is therefore reconstructed from: the filename, the repository description ("AI-powered HCP engagement prototype for Connex"), and conventional HCP (Healthcare Professional) portal patterns.
>
> **Every assumption below is numbered. Please confirm, correct, or strike each one.** Once the PDF is readable, this document gets revised to match it exactly before any implementation begins.

| # | Assumption | Impact if wrong |
|---|---|---|
| A1 | **Connex is a portal for Healthcare Professionals** (doctors, pharmacists, nurses) — not a patient-facing app. Patients appear only as *data the HCP reviews*. | Reverses the entire IA and tone. |
| A2 | The **"AI Layer"** in the title is an assistive layer *on top of* an existing portal: a chatbot plus AI affordances (summaries, suggestions, search) embedded in existing screens. | Changes whether AI is a feature or the product. |
| A3 | The sponsor is a **pharmaceutical / medical-affairs organisation** engaging HCPs with product info, medical content, and rep/MSL interactions. | Changes domain vocabulary and compliance needs. |
| A4 | Core HCP jobs: review assigned patients, look up drug/clinical information, request samples or medical information, book meetings with reps/MSLs, consume educational content. | Add/remove whole screens. |
| A5 | Single-tenant demo, one logged-in persona (a physician). No real auth in v1 — a persona switcher instead. | Adds an auth stage. |
| A6 | Desktop-first, responsive down to tablet/mobile. | Changes layout priorities. |
| A7 | English only in v1. | Adds i18n scaffolding. |
| A8 | The chatbot is a **docked side panel + floating launcher**, available on every screen and context-aware of the current page. | Changes chat surface to full-page. |

**What I need from the PDF to lock this down:** the exact screen list and their names, the visual style (colour, typography, density, light/dark), the chat panel's placement and states, any named AI features, and any specific data fields shown in tables/cards.

---

## 1. Product summary

**Connex** is a standalone HCP engagement portal with an integrated AI assistant layer. An HCP signs in, sees a personalised dashboard of their patient cohort and pending actions, browses medical/product content, and uses a conversational assistant to ask clinical-adjacent questions, summarise patient records, find content, and complete transactional tasks (request medical information, book a rep meeting, order samples) without leaving the page they are on.

**Stage-1 principle:** every AI response is produced by a deterministic local mock engine behind a stable interface, so a real model can be dropped in later by swapping one module — no UI changes required.

**Non-negotiables (from the brief):**
- Standalone; no Arena runtime dependency, no Arena branding, badges, or watermarks anywhere in the UI.
- No hard-coded API keys or secrets; all config through environment variables with a committed `.env.example`.
- Synthetic/demo patient data only — clearly fake names, no real PHI.
- No external AI API connected in this stage.

---

## 2. Required screens

Grouped by area. Each entry lists purpose, key content, AI touchpoints, and states to design.

### 2.1 Entry & shell

| # | Screen | Route | Purpose |
|---|--------|-------|---------|
| S1 | **Sign in / Persona select** | `/login` | Demo-only gate. Pick from 3 synthetic HCP personas (e.g. Cardiologist, Endocrinologist, GP). No password. Clearly labelled "Demo environment — synthetic data". |
| S2 | **App shell** | — | Persistent frame: top bar (logo, global search, notifications, profile menu), left nav, main content slot, docked AI panel on the right. Not a route; wraps all authed routes. |

### 2.2 Core

| # | Screen | Route | Purpose & key content | AI touchpoints |
|---|--------|-------|----------------------|----------------|
| S3 | **Dashboard / Home** | `/` | Greeting; KPI stat cards (patients under care, pending actions, unread messages, upcoming meetings); "Needs attention" patient list; recent content; upcoming appointments; activity feed. | "AI daily brief" card summarising the day; suggested next actions. |
| S4 | **Patient list** | `/patients` | Sortable/filterable/searchable table of synthetic patients: name, ID, age/sex, condition, risk band, last visit, next appointment, adherence, assigned status. Bulk filters by condition/risk. Pagination. | Natural-language filter bar ("show high-risk diabetics overdue for review"); AI cohort summary. |
| S5 | **Patient detail** | `/patients/[id]` | Header (demographics, risk badge, allergies); tabs: **Overview** (problem list, vitals trend, recent labs), **Medications** (current + history, adherence), **Timeline** (encounters, notes), **Documents**. | "Summarise this patient" panel; drug-interaction flag; suggested talking points. |
| S6 | **AI Assistant (full page)** | `/assistant` | Expanded chat with conversation history sidebar, suggested prompts, and a wider canvas for tabular/card answers. Same engine as the docked panel. | The whole screen. |
| S7 | **Content / Resource library** | `/content` | Grid of medical & product resources: clinical papers, product monographs, webinars, videos, guidelines. Filter by therapy area, type, date. Bookmarks. | Semantic "find me content about…"; AI abstract summaries. |
| S8 | **Content detail** | `/content/[id]` | Reader view: metadata, abstract, body/asset, related items, download, "discuss with assistant". | "Explain this in 3 bullets"; Q&A grounded on the document. |
| S9 | **Messages / Requests** | `/messages` | Inbox of threads with medical information teams and reps: medical information requests (MIRs), sample requests, general enquiries. Status chips (Open / In review / Answered). | AI draft reply; auto-classification of request type. |
| S10 | **Appointments / Meetings** | `/appointments` | Calendar + list of meetings with reps/MSLs and patient consults. Book, reschedule, cancel. | Conversational booking; slot suggestions. |
| S11 | **Requests: Medical Information** | `/requests/medical-info` | Structured form to submit an MIR: product, question, urgency, preferred response channel. Submission list with status. | Chat-driven form fill; question refinement. |
| S12 | **Requests: Samples** | `/requests/samples` | Order samples: product, quantity, delivery address, signature acknowledgement. History table. | Chat-driven ordering. |
| S13 | **Notifications** | `/notifications` | Full list of alerts: new content, request answered, appointment reminders, patient alerts. Mark read/unread. | Grouping/prioritisation. |
| S14 | **Profile & preferences** | `/profile` | HCP details, specialty, therapy-area interests, notification and consent preferences. | Content-interest suggestions. |
| S15 | **Settings** | `/settings` | Theme, density, AI assistant settings (tone, verbosity, show-sources toggle), demo-data reset. | — |

### 2.3 Supporting / system

| # | Screen | Route | Purpose |
|---|--------|-------|---------|
| S16 | **Global search results** | `/search?q=` | Unified results across patients, content, messages. |
| S17 | **About / Demo disclaimer** | `/about` | States clearly: prototype, synthetic data, not for clinical use, no real AI connected in this build. |
| S18 | **404 / Error / Offline** | `not-found`, `error` | Graceful failures. |

**Per-screen states to design and build:** loading (skeleton), empty, error, and populated. This is listed once here and applies to S3–S16.

---

## 3. Required chatbot conversation flows

### 3.1 Architecture

A deterministic **intent router** in v1:

```
user message
  → normalise
  → intent classifier (keyword + regex + scored patterns; pluggable)
  → slot extraction (entities: patient, drug, therapy area, date, product, quantity)
  → flow handler (may ask follow-up questions to fill missing slots)
  → response composer → { text, citations?, cards?, actions?, followUps? }
```

Every response is a structured object, not a bare string, so the UI can render rich cards, action buttons, and source chips. **This contract is identical to what a real LLM will later return**, which is what makes the swap non-breaking.

Conversation state per session: `messages[]`, `activeFlow`, `slots{}`, `pageContext` (current route + entity id).

### 3.2 Flows

| # | Flow | Trigger examples | Behaviour |
|---|------|-----------------|-----------|
| F1 | **Greeting & capability** | "hi", "what can you do" | Welcome, persona-aware, 4 suggested prompt chips. |
| F2 | **Patient lookup** | "show me Aarav Sharma", "open patient P-1042" | Disambiguate if multiple matches → return patient card + deep link. |
| F3 | **Patient summary** | "summarise this patient", "what's changed since last visit" | Template-composed summary from demo record: problems, meds, recent labs, risks, suggested actions. Requires patient context or asks for one. |
| F4 | **Cohort query** | "how many high-risk diabetics", "who is overdue for review" | Filters demo dataset → count + table card + "open in patient list" action. |
| F5 | **Drug information** | "dosing for Metformin", "contraindications for X" | Returns monograph excerpt from demo drug data with source chip + safety disclaimer. |
| F6 | **Drug interaction check** | "can I combine A and B" | Looks up demo interaction matrix → severity badge, mechanism, recommendation, disclaimer. |
| F7 | **Content discovery** | "papers on SGLT2 in CKD" | Keyword-scored search over demo content → 3 result cards + "see all" action. |
| F8 | **Document Q&A** | asked from S8 | Answers from the demo document body with quoted passage. |
| F9 | **Medical information request** | "I need info from medical affairs" | Multi-turn slot fill: product → question → urgency → channel → confirm → creates a demo MIR, returns reference number. |
| F10 | **Sample request** | "order samples of X" | Slot fill: product → quantity → address → confirm. Creates demo order. |
| F11 | **Appointment booking** | "book a meeting with my MSL next week" | Slot fill: attendee type → date/time (offers 3 slots) → topic → confirm → creates appointment. |
| F12 | **Appointment management** | "reschedule Thursday's meeting", "cancel it" | Resolve target → confirm → update. |
| F13 | **Message triage / draft reply** | "draft a reply to thread 3" | Produces an editable draft; user can insert into the message composer. |
| F14 | **Navigation** | "take me to my appointments" | Returns a navigate action; UI routes. |
| F15 | **Explain / define** | "what is eGFR" | Glossary lookup from demo data. |
| F16 | **Adverse event mention** | detects AE-like phrasing | **Safety interlock:** does not attempt clinical advice; shows the pharmacovigilance reporting notice and a "Report AE" action. Always takes priority over other intents. |
| F17 | **Out-of-scope / clinical-decision request** | "should I prescribe X to this patient" | Declines decision-making, restates it is a non-clinical demo assistant, offers information alternatives. |
| F18 | **Fallback & clarification** | unmatched | Low-confidence path: apologises, offers the 4 nearest capabilities. Two consecutive fallbacks → offer human handoff (F19). |
| F19 | **Human handoff** | "talk to a person" | Creates a demo enquiry thread in Messages. |
| F20 | **Session utilities** | "clear chat", "start over" | Resets flow and slots. |

### 3.3 Cross-cutting conversation rules

- **Context awareness:** the panel passes the current route/entity, so "summarise this patient" works on S5 without naming anyone.
- **Confirmation before any write:** F9–F13 always show a summary card with Confirm / Edit / Cancel before mutating demo data.
- **Interruption handling:** a new high-confidence intent mid-flow prompts "Pause the sample request and do X instead?".
- **Every AI message carries a provenance chip** (`Demo response — no live AI model connected`) and, where applicable, source links.
- **Streaming simulation:** typed-out rendering so the later switch to real token streaming needs no UI change.

---

## 4. Required components

### 4.1 Layout & shell
`AppShell`, `TopBar`, `SideNav`, `NavItem`, `PageHeader`, `Breadcrumbs`, `ContentContainer`, `RightPanel` (dockable/resizable/collapsible), `MobileNavDrawer`, `Footer` (demo disclaimer).

### 4.2 Chat / AI layer
`ChatLauncher` (FAB), `ChatPanel`, `ChatFullPage`, `MessageList`, `MessageBubble` (user/assistant/system variants), `TypingIndicator`, `StreamingText`, `SuggestedPrompts`, `ChatComposer` (textarea, send, attach-context, mic placeholder), `QuickActionChips`, `SourceChip`, `ProvenanceBadge`, `ConfirmationCard`, `SlotFillPrompt`, `ConversationHistoryList`, `AIInsightCard` (embeds AI output inside non-chat screens), `AISummaryBlock`, `AIDisclaimerBanner`.

### 4.3 Rich chat payload renderers
`PatientCard`, `PatientTableCard`, `ContentResultCard`, `DrugInfoCard`, `InteractionWarningCard`, `AppointmentSlotPicker`, `RequestReceiptCard`, `ChartCard`, `ActionButtonRow`. A single `ChatPayloadRenderer` maps `payload.type → component`.

### 4.4 Data display
`StatCard`, `DataTable` (sort/filter/paginate/select), `FilterBar`, `SearchInput`, `RiskBadge`, `StatusChip`, `Timeline`, `TimelineEvent`, `VitalsChart`, `LabResultTable`, `MedicationList`, `AdherenceMeter`, `Avatar`, `EmptyState`, `SkeletonBlock`, `ErrorState`, `Pagination`, `TabBar`.

### 4.5 Forms & primitives
`Button`, `IconButton`, `Input`, `Textarea`, `Select`, `Combobox`, `DatePicker`, `TimeSlotGrid`, `Checkbox`, `RadioGroup`, `Switch`, `Slider`, `FormField` (label/help/error), `Modal`, `Drawer`, `Popover`, `Tooltip`, `Toast`, `AlertBanner`, `Card`, `Badge`, `Separator`, `Spinner`.

> Primitives come from **shadcn/ui** (copied into the repo, so no runtime UI-vendor lock-in); domain components are hand-built on top.

### 4.6 Providers & hooks
`ThemeProvider`, `DemoDataProvider`, `ChatProvider`, `ToastProvider`, `PersonaProvider`; hooks `useChat`, `usePageContext`, `usePatients`, `useContent`, `useAppointments`, `useNotifications`, `useLocalPersistence`.

---

## 5. Required demo data

All synthetic, generated with a **fixed seed** for reproducibility, stored as typed JSON/TS modules under `src/data/`. Names drawn from an invented pool; a `DEMO DATA` marker field on every patient record.

| Dataset | Volume | Key fields |
|---------|--------|-----------|
| **HCP personas** | 3 | id, name, credentials, specialty, institution, therapy interests, avatar |
| **Patients** | 40–60 | id, name, age, sex, conditions[], riskBand, allergies[], lastVisit, nextAppointment, adherenceScore, assignedHcpId |
| **Vitals** | ~12 points/patient | date, bp, hr, weight, bmi, temp |
| **Lab results** | 6–10/patient | date, panel, analyte, value, unit, refRange, flag |
| **Medications** | 2–6/patient | drug, dose, frequency, startDate, status, prescriber |
| **Encounters / timeline** | 5–15/patient | date, type, summary, author |
| **Drug catalogue** | 25–40 | name, generic, class, indications, dosing, contraindications, warnings, monograph excerpt |
| **Interaction matrix** | ~60 pairs | drugA, drugB, severity, mechanism, recommendation |
| **Content library** | 30–50 | title, type, therapyArea, abstract, body, authors, date, readTime, thumbnail |
| **Messages / threads** | 8–12 | subject, type (MIR/sample/general), status, participants, messages[] |
| **Appointments** | 10–15 | title, attendeeType, datetime, duration, location/virtual, status, notes |
| **Available slots** | rolling 14 days | for the booking flow |
| **Notifications** | 10–15 | type, title, body, timestamp, read |
| **Glossary** | 40–60 | term, definition |
| **Canned AI responses** | per flow | templates + variable interpolation for F1–F20 |
| **Suggested prompts** | per route | context-aware chips |

**Mutations** (new requests, bookings, read flags) are written to an in-memory store on the server, mirrored to `localStorage` on the client, with a **Reset demo data** control in Settings. Nothing persists to a real database in v1.

---

## 6. Required backend functionality

Next.js **Route Handlers** under `src/app/api/`. Thin HTTP layer → service layer → repository layer. Only the repository layer knows the data is mock, so a real DB replaces it without touching routes.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/session` | GET/POST | Current persona; switch persona. |
| `/api/patients` | GET | List with `q`, `condition`, `risk`, `sort`, `page`. |
| `/api/patients/[id]` | GET | Full record incl. vitals, labs, meds, timeline. |
| `/api/patients/[id]/summary` | POST | AI summary (mock engine). |
| `/api/content` | GET | Search/filter library. |
| `/api/content/[id]` | GET | Single resource. |
| `/api/drugs` | GET | Drug lookup. |
| `/api/drugs/interactions` | POST | Interaction check. |
| `/api/messages` | GET/POST | Threads; create/reply. |
| `/api/appointments` | GET/POST | List; book. |
| `/api/appointments/[id]` | PATCH/DELETE | Reschedule / cancel. |
| `/api/appointments/slots` | GET | Available slots. |
| `/api/requests/medical-info` | GET/POST | MIRs. |
| `/api/requests/samples` | GET/POST | Sample orders. |
| `/api/notifications` | GET/PATCH | List; mark read. |
| `/api/search` | GET | Cross-entity search. |
| `/api/chat` | POST | **Core AI endpoint.** Body `{ messages, context, sessionId }` → structured response. Streamed via SSE from day one, backed by the mock engine. |
| `/api/chat/sessions` | GET/DELETE | History; clear. |
| `/api/demo/reset` | POST | Reset mutable demo state. |
| `/api/health` | GET | Liveness. |

**Cross-cutting backend concerns:** Zod validation on every input, typed error envelope `{ error: { code, message } }`, simulated latency (150–600 ms, configurable) so the UI's loading states are real, basic in-memory rate limiting on `/api/chat`, and request logging behind a debug flag.

---

## 7. Recommended project structure

```
CONNEX-MEDI-AI-/
├── README.md                        # setup, scripts, deploy, demo-data notice
├── LICENSE
├── .env.example                     # documented vars, NO real values
├── .gitignore
├── .nvmrc
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
├── components.json                  # shadcn/ui config
├── eslint.config.mjs
├── .prettierrc
├── vitest.config.ts
├── playwright.config.ts
├── vercel.json                      # optional: region/headers
│
├── .github/workflows/ci.yml         # typecheck, lint, test, build
│
├── docs/
│   ├── PLAN.md                      # this document
│   ├── SPEC-MAPPING.md              # PDF page → screen/component traceability
│   ├── CHAT-FLOWS.md                # full conversation trees
│   ├── DATA-MODEL.md                # entity diagrams + field dictionary
│   ├── API.md                       # endpoint contracts
│   └── ROADMAP.md                   # staged delivery
│
├── public/
│   ├── favicon.ico
│   ├── logo.svg                     # Connex mark (no third-party branding)
│   └── images/                      # synthetic avatars, content thumbnails
│
└── src/
    ├── app/
    │   ├── layout.tsx                # root: providers, fonts, metadata
    │   ├── globals.css
    │   ├── page.tsx                  # S3 Dashboard
    │   ├── not-found.tsx
    │   ├── error.tsx
    │   ├── login/page.tsx            # S1
    │   ├── (portal)/                 # authed group, wraps AppShell
    │   │   ├── layout.tsx
    │   │   ├── patients/
    │   │   │   ├── page.tsx          # S4
    │   │   │   └── [id]/page.tsx     # S5
    │   │   ├── assistant/page.tsx    # S6
    │   │   ├── content/
    │   │   │   ├── page.tsx          # S7
    │   │   │   └── [id]/page.tsx     # S8
    │   │   ├── messages/page.tsx     # S9
    │   │   ├── appointments/page.tsx # S10
    │   │   ├── requests/
    │   │   │   ├── medical-info/page.tsx  # S11
    │   │   │   └── samples/page.tsx       # S12
    │   │   ├── notifications/page.tsx     # S13
    │   │   ├── profile/page.tsx           # S14
    │   │   ├── settings/page.tsx          # S15
    │   │   ├── search/page.tsx            # S16
    │   │   └── about/page.tsx             # S17
    │   └── api/                      # route handlers (§6)
    │       ├── chat/route.ts
    │       ├── patients/…
    │       └── …
    │
    ├── components/
    │   ├── ui/                       # shadcn primitives (§4.5)
    │   ├── layout/                   # §4.1
    │   ├── chat/                     # §4.2
    │   │   └── payloads/             # §4.3
    │   ├── patients/
    │   ├── content/
    │   ├── messages/
    │   ├── appointments/
    │   ├── requests/
    │   └── common/                   # §4.4
    │
    ├── lib/
    │   ├── ai/                       # ★ the swap point
    │   │   ├── provider.ts           # AIProvider interface
    │   │   ├── mock-provider.ts      # v1 deterministic engine
    │   │   ├── openai-provider.ts    # later, env-gated stub
    │   │   ├── index.ts              # factory reads AI_PROVIDER env
    │   │   ├── intents/              # classifier + per-intent handlers
    │   │   ├── slots/                # entity extraction
    │   │   ├── prompts/              # system prompts (future-ready)
    │   │   └── templates/            # canned response templates
    │   ├── api/                      # typed client-side fetchers
    │   ├── repositories/             # ★ data-access seam (mock → DB)
    │   ├── services/                 # business logic
    │   ├── validation/               # Zod schemas
    │   ├── config/env.ts             # validated env access, no literals
    │   ├── store/                    # in-memory mutable demo state
    │   └── utils/
    │
    ├── data/                         # synthetic datasets (§5)
    │   ├── seed.ts
    │   ├── personas.ts
    │   ├── patients.ts
    │   ├── drugs.ts
    │   ├── interactions.ts
    │   ├── content.ts
    │   ├── messages.ts
    │   ├── appointments.ts
    │   ├── notifications.ts
    │   ├── glossary.ts
    │   └── chat-templates.ts
    │
    ├── types/                        # shared TS types & payload contracts
    ├── hooks/                        # §4.6
    ├── styles/                       # design tokens
    └── tests/
        ├── unit/
        └── e2e/
```

**Why this shape:** the two starred directories — `lib/ai/` and `lib/repositories/` — are the only places that know anything is mocked. Real AI and a real database are drop-in replacements behind those interfaces.

---

## 8. Features that initially use mock responses

| Feature | v1 mock behaviour | Later replacement |
|---------|------------------|-------------------|
| Chat responses | Intent router + templates, simulated streaming | LLM via `AIProvider` |
| Patient summaries | Template composition from record fields | LLM summarisation |
| Cohort NL queries | Keyword → filter predicates | LLM → structured query |
| Content search | Lexical scoring | Vector/semantic search |
| Document Q&A | Passage matching | RAG over embeddings |
| Drug info / interactions | Static demo catalogue + matrix | Licensed clinical data source |
| Draft replies | Templates | LLM generation |
| Suggested actions | Rule-based | Model-ranked |
| Auth | Persona switcher, no password | Real identity provider |
| Persistence | In-memory + localStorage | Database |
| Notifications | Static seeded | Event-driven |
| File upload | UI only, no storage | Blob storage |
| Analytics | No-op logger | Real analytics |

The mock provider is **deterministic** (seeded) so demos and tests are repeatable.

---

## 9. What we will need later

### 9.1 Real AI API
- Choose provider (OpenAI / Anthropic / Azure OpenAI / self-hosted) and model.
- `openai-provider.ts` implementing the same `AIProvider` interface; factory selects via `AI_PROVIDER`.
- Env: `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`, `AI_BASE_URL`, `AI_MAX_TOKENS` — **server-side only**, never `NEXT_PUBLIC_*`, never committed.
- System prompts with strict scope guardrails, AE-detection interlock, and refusal of clinical decision-making.
- Function/tool calling mapped to the existing service layer so the model can trigger the same booking/request actions.
- Token streaming over the existing SSE endpoint; token budgeting, cost logging, retries with backoff, timeouts, and a circuit breaker that falls back to the mock provider.
- Abuse controls: per-session rate limits, input length caps, PII scrubbing before egress.
- Evaluation set of ~50 prompts per flow with expected behaviours.

### 9.2 Database
- **Recommended:** Postgres (Vercel Postgres / Neon / Supabase) + **Prisma** or **Drizzle**.
- Schema mirroring `src/types/`; migrations checked into the repo.
- Repository implementations swapped from mock to DB; seed script reusing `src/data/` so demo mode still works.
- If RAG is adopted: `pgvector` for content embeddings, plus an ingestion job.
- Env: `DATABASE_URL`, `DIRECT_URL`. Connection pooling for serverless.
- Backups, and a documented data-retention position for chat logs.

### 9.3 Auth & compliance
- NextAuth/Auth.js or Clerk; HCP verification is a real-world requirement in pharma contexts.
- Role model (HCP / admin), session hardening, audit log of AI interactions.
- Consent capture, cookie notice, and — before any real patient data — a formal HIPAA/GDPR review and a BAA/DPA with the AI vendor. **Until then the app stays synthetic-only.**

### 9.4 Deployment (Vercel)
- Import the GitHub repo; framework preset auto-detected as Next.js.
- Env vars set per environment (Production / Preview / Development) in the Vercel dashboard — never in the repo.
- Preview deployments on PRs; production on `main`.
- Custom domain + HTTPS; security headers (CSP, HSTS, X-Frame-Options) in `next.config.mjs`.
- GitHub Actions CI: typecheck → lint → unit tests → build, required before merge.
- Optional: Vercel Analytics/Speed Insights, Sentry, uptime check on `/api/health`.
- Node version pinned via `.nvmrc` and `engines`.

---

## 10. Proposed delivery stages

| Stage | Deliverable |
|-------|-------------|
| **0** | ✅ This plan + assumption sign-off (and PDF reconciliation) |
| **1** | Scaffold: Next.js + TS + Tailwind + shadcn, design tokens, app shell, nav, routing, CI |
| **2** | Demo data layer + repositories + typed API client + all route handlers with mock data |
| **3** | Core screens: dashboard, patient list, patient detail |
| **4** | AI layer: provider interface, mock engine, chat panel, full-page assistant, flows F1–F8 |
| **5** | Transactional flows: messages, appointments, requests + chat flows F9–F14 |
| **6** | Content library + document Q&A |
| **7** | Safety flows F16–F19, settings, profile, notifications, about |
| **8** | Polish: responsive, a11y (WCAG 2.1 AA, keyboard, ARIA live regions for streaming), empty/error states, tests |
| **9** | Deployment: Vercel setup, env docs, README, handover |

---

## 11. Open questions for you

1. **The PDF** — please re-attach; if it fails again, exporting the pages as PNG/JPG images or pasting the text will work.
2. Is **A1** right — HCP-facing, with patients as reviewed data?
3. Which screens in the PDF are **must-have for v1** versus nice-to-have?
4. Is the chatbot a **docked side panel**, a **full page**, or both?
5. Any **named AI features** in the mockup I should match exactly (naming matters for a demo)?
6. **Brand:** do you have Connex colours, fonts, and a logo, or should I propose a clean medical-professional palette?
7. **Therapy area focus** for the demo data (diabetes? cardiology? oncology? general)?
8. Is there a **specific audience/date** for the demo that should shape scope?
