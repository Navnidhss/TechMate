type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/** Allow `limit` requests per `windowMs` per key. Returns false when blocked. */
export function rateLimit(key: string, limit = 5, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count += 1;
  return true;
}
