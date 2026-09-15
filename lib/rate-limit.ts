type Entry = { count: number; resetAt: number }

type Store = Map<string, Entry>

const globalStore = globalThis as typeof globalThis & { __ayushpicksRateLimit?: Store }
const store: Store = globalStore.__ayushpicksRateLimit ?? new Map()
globalStore.__ayushpicksRateLimit = store

/**
 * Best-effort per-instance limiter for serverless functions.
 * It deliberately fails open if the process store is unavailable.
 * A shared Vercel/Redis limiter should replace this when traffic grows.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const current = store.get(key)
  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: Math.max(0, limit - 1), resetAt: now + windowMs }
  }

  current.count += 1
  if (current.count > limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt }
  }

  return { allowed: true, remaining: Math.max(0, limit - current.count), resetAt: current.resetAt }
}

export function clientKey(request: Request, scope: string) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const real = request.headers.get('x-real-ip')?.trim()
  return `${scope}:${forwarded || real || 'unknown'}`
}
