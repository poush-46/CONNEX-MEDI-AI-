'use client'

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 px-5 py-20 text-center">
      <h1 className="text-[20px] font-semibold text-ink-900">Something went wrong</h1>
      <p className="max-w-sm text-[13px] text-ink-500">
        The page failed to render. This is a prototype, so state may be incomplete.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 rounded-md bg-magenta-600 px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-magenta-700"
      >
        Try again
      </button>
    </div>
  )
}
