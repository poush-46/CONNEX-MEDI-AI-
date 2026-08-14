/**
 * Deterministic pseudo-random source.
 *
 * A fixed seed means demos, screenshots and snapshot tests are reproducible:
 * the same patient always has the same history.
 */
export function createRng(seed: number) {
  let state = seed >>> 0
  return function next(): number {
    // mulberry32
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Random float in [min, max], rounded to `dp` decimals. */
export function rngFloat(next: () => number, min: number, max: number, dp = 2): number {
  const v = min + next() * (max - min)
  return Number(v.toFixed(dp))
}

export function rngInt(next: () => number, min: number, max: number): number {
  return Math.floor(min + next() * (max - min + 1))
}

export function rngPick<T>(next: () => number, items: readonly T[]): T {
  return items[Math.floor(next() * items.length)]
}
