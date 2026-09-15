type Entry = { count: number; resetAt: number }

const buckets = new Map<string, Entry>()
const WINDOW_MS = 60_000
const MAX_ENTRIES = 5000

export function rateLimit(key: string, limit: number) {
  const now = Date.now()
  if (buckets.size > MAX_ENTRIES) {
    for (const [k, entry] of buckets) if (entry.resetAt <= now) buckets.delete(k)
  }

  const current = buckets.get(key)
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { ok: true, remaining: limit - 1, retryAfter: 0 }
  }

  current.count += 1
  if (current.count > limit) {
    return { ok: false, remaining: 0, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) }
  }

  return { ok: true, remaining: Math.max(0, limit - current.count), retryAfter: 0 }
}

export function clientKey(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const real = request.headers.get('x-real-ip')?.trim()
  return forwarded || real || 'unknown'
}
