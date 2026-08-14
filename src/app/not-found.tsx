import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 px-5 py-20 text-center">
      <p className="text-[13px] font-semibold uppercase tracking-wide text-ink-500">404</p>
      <h1 className="text-[20px] font-semibold text-ink-900">Page not found</h1>
      <p className="max-w-sm text-[13px] text-ink-500">
        That page does not exist in this prototype.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-md bg-magenta-600 px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-magenta-700"
      >
        Back to dashboard
      </Link>
    </div>
  )
}
