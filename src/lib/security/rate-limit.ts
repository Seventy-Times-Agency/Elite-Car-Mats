import "server-only";

/**
 * Rate-limit gate for public endpoints.
 *
 * Two backends:
 *   1. Upstash REST  — used when UPSTASH_REDIS_REST_URL + _TOKEN are set.
 *      Counters are shared across every serverless instance, so brute-force
 *      protection actually works on Vercel.
 *   2. In-memory Map — fallback for local dev. Each lambda instance has its
 *      own Map, so this is *not* effective on Vercel — operators are urged
 *      to provision Upstash.
 */

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
}

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX = 5;

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const upstashEnabled = Boolean(upstashUrl && upstashToken);

if (
  !upstashEnabled &&
  process.env.NODE_ENV === "production" &&
  !globalThis.__rateLimitWarnLogged
) {
  console.warn(
    "[rate-limit] Upstash credentials not set — falling back to per-instance " +
      "in-memory Map. On a multi-instance deployment this provides effectively " +
      "no protection. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
  );
  // Avoid spamming the log on every cold start handler invocation.
  (globalThis as unknown as { __rateLimitWarnLogged: boolean }).__rateLimitWarnLogged = true;
}

declare global {
  var __rateLimitWarnLogged: boolean | undefined;
}

interface Bucket {
  count: number;
  resetAt: number;
}
const buckets: Map<string, Bucket> = new Map();

// Sweep expired buckets occasionally so the Map doesn't grow without
// bound on a long-lived process (dev server / self-hosted node).
const SWEEP_THRESHOLD = 1000;

function sweepExpired(now: number): void {
  if (buckets.size < SWEEP_THRESHOLD) return;
  for (const [k, b] of buckets) {
    if (b.resetAt < now) buckets.delete(k);
  }
}

async function inMemoryHit(
  key: string,
  windowMs: number,
  max: number,
): Promise<{ ok: boolean; retryAfter: number }> {
  const now = Date.now();
  sweepExpired(now);
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (bucket.count >= max) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count += 1;
  return { ok: true, retryAfter: 0 };
}

async function upstashHit(
  key: string,
  windowMs: number,
  max: number,
): Promise<{ ok: boolean; retryAfter: number }> {
  // Atomic INCR + EXPIRE via Upstash REST pipeline. Single round-trip.
  const url = `${upstashUrl}/pipeline`;
  const body = JSON.stringify([
    ["INCR", key],
    ["PEXPIRE", key, String(windowMs), "NX"],
    ["PTTL", key],
  ]);
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${upstashToken}`,
        "Content-Type": "application/json",
      },
      body,
      cache: "no-store",
    });
  } catch (err) {
    // Network blip — degrade to the per-instance in-memory limiter
    // instead of allowing unlimited traffic. Weaker than Redis (each
    // lambda counts separately) but it still blunts brute force during
    // an Upstash outage, and legitimate users stay under the limit
    // anyway. Sustained outages show up in logs.
    console.warn("[rate-limit:upstash] fetch failed, in-memory fallback", err);
    return inMemoryHit(key, windowMs, max);
  }
  if (!res.ok) {
    console.warn(
      "[rate-limit:upstash] non-OK response, in-memory fallback",
      res.status,
    );
    return inMemoryHit(key, windowMs, max);
  }
  type PipelineResult = Array<{ result?: number; error?: string }>;
  const data = (await res.json().catch(() => null)) as PipelineResult | null;
  if (!Array.isArray(data) || !data[0] || typeof data[0].result !== "number") {
    return inMemoryHit(key, windowMs, max);
  }
  const count = data[0].result;
  const ttlMs = typeof data[2]?.result === "number" ? data[2].result : windowMs;
  if (count > max) {
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil(ttlMs / 1000)),
    };
  }
  return { ok: true, retryAfter: 0 };
}

export async function rateLimit(
  key: string,
  opts: RateLimitOptions = {},
): Promise<{ ok: boolean; retryAfter: number }> {
  const windowMs = opts.windowMs ?? DEFAULT_WINDOW_MS;
  const max = opts.max ?? DEFAULT_MAX;
  if (upstashEnabled) {
    return upstashHit(`rl:${key}`, windowMs, max);
  }
  return inMemoryHit(key, windowMs, max);
}

/**
 * Pulls the client IP from request headers, preferring Vercel's signed
 * `x-vercel-forwarded-for` (which the platform rewrites and clients can't
 * spoof) over the generic `x-forwarded-for` (whose first entry is client-
 * controlled outside Vercel). Falls back to `x-real-ip` and finally
 * `"unknown"`.
 */
function pickIp(get: (name: string) => string | null): string {
  const vercel = get("x-vercel-forwarded-for");
  if (vercel) return vercel.split(",")[0]!.trim();
  const real = get("x-real-ip");
  if (real) return real.trim();
  const fwd = get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return "unknown";
}

export function getClientIp(request: Request): string {
  return pickIp((name) => request.headers.get(name));
}

/**
 * Headers-based IP lookup for server actions / RSCs that don't receive
 * a Request object directly.
 */
export function getClientIpFromHeaders(h: {
  get: (name: string) => string | null;
}): string {
  return pickIp((name) => h.get(name));
}
