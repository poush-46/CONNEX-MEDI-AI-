import { PageHeader } from '@/components/layout/PageHeader'

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-6">
      <PageHeader title="About this prototype" />
      <div className="mt-5 space-y-4 rounded-card border border-hairline bg-white p-5 text-[13px] leading-relaxed text-ink-700 shadow-card">
        <p>
          <strong className="text-ink-900">Connex</strong> is a demonstration of an AI assistant
          layer for a clinical monitoring portal. It exists to show interaction design, not to
          support real clinical work.
        </p>
        <div>
          <h2 className="mb-1 text-[13px] font-semibold text-ink-900">Synthetic data</h2>
          <p>
            Every patient, result, side effect and appointment in this application is fabricated.
            No real person is represented and no real medical record was used. Values are
            plausible but illustrative.
          </p>
        </div>
        <div>
          <h2 className="mb-1 text-[13px] font-semibold text-ink-900">No live AI model</h2>
          <p>
            Assistant replies come from a deterministic offline engine that runs entirely within
            this application. No request leaves the server, no API key is required, and no
            language model is connected. Responses are assembled from the demo dataset using
            fixed rules, so the same question always produces the same answer.
          </p>
        </div>
        <div>
          <h2 className="mb-1 text-[13px] font-semibold text-ink-900">Not for clinical use</h2>
          <p>
            Nothing here should be read as medical advice or used to inform care. The assistant
            declines treatment decisions by design, and routes any mention of an adverse event to
            the appropriate reporting process rather than attempting to assess it.
          </p>
        </div>
        <div>
          <h2 className="mb-1 text-[13px] font-semibold text-ink-900">Reference ranges</h2>
          <p>
            Blood count ranges are adult-typical and applied uniformly across the demo cohort.
            A production system would vary them by sex, age and laboratory.
          </p>
        </div>
      </div>
    </div>
  )
}
