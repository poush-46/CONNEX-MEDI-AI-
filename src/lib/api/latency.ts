/**
 * Artificial latency so loading states are exercised in development and in
 * the demo. Configurable via DEMO_LATENCY_MIN_MS / DEMO_LATENCY_MAX_MS.
 */
export async function simulateLatency(): Promise<void> {
  const min = Number(process.env.DEMO_LATENCY_MIN_MS ?? 180)
  const max = Number(process.env.DEMO_LATENCY_MAX_MS ?? 520)
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= 0) return
  const ms = min + Math.random() * Math.max(0, max - min)
  await new Promise((resolve) => setTimeout(resolve, ms))
}
