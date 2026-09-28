import "server-only";
import { redisEnabled, redisPipeline } from "@/lib/redis-rest";

/**
 * Own-side conversion funnel: how many people reach each step on the way
 * from landing page to paid order.
 *
 * WHY NOT POSTGRES. The obvious design — one row per event — is the exact
 * pattern that took the shop down for four days on 2026-08-29. Neon
 * suspends its compute after 5 minutes of inactivity, so a write every
 * few minutes means it never sleeps: at this traffic a per-visitor insert
 * works out to roughly 65 CU-hours a month on its own, on top of
 * everything else, against a 100 CU-hour free allowance. Analytics that
 * takes the store offline is not analytics.
 *
 * So the counters live in Redis instead, as plain per-day integers that
 * INCR atomically. Postgres is not touched at all by this feature — the
 * two bottom steps of the funnel (orders placed, orders paid) are read
 * from tables the admin dashboard already queries anyway.
 *
 * NO FALLBACK ON PURPOSE. Unlike the rate limiter, there is no in-memory
 * degradation here. On serverless each lambda has its own memory, so
 * in-memory counters would show a different, arbitrary fraction of
 * reality on every request — numbers that look real and are not. Without
 * Upstash configured, writes are dropped and reads return null, and the
 * admin panel says the funnel is not configured rather than lying.
 */

/** Ordered funnel steps, top to bottom. Order drives the admin display. */
export const FUNNEL_STEPS = [
  "visit",
  "catalog",
  "product",
  "configured",
  "add_to_cart",
  "checkout",
  "pay_click",
] as const;

export type FunnelStep = (typeof FUNNEL_STEPS)[number];

const STEP_SET = new Set<string>(FUNNEL_STEPS);

export function isFunnelStep(v: unknown): v is FunnelStep {
  return typeof v === "string" && STEP_SET.has(v);
}

export const funnelEnabled = redisEnabled;

/** Counters are kept for 90 days — enough for the 30-day admin view. */
const TTL_SECONDS = 90 * 24 * 60 * 60;

const KEY_PREFIX = "ecm:funnel";

/**
 * Day bucket in the SHOP's timezone, not UTC. The admin dashboard already
 * reports revenue on America/New_York calendar days; a funnel on UTC days
 * would put an 8pm order and the visit that produced it on different
 * rows.
 */
export function shopDayKey(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * Midnight of a shop-day key as an instant, honouring DST — the panel's
 * Postgres window must start where the Redis day bucket starts, and a
 * hard-coded -04:00 is wrong for five months of the year.
 */
export function shopDayStart(day: string): Date {
  const utcMidnight = new Date(`${day}T00:00:00Z`);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(utcMidnight);
  const get = (t: string) => Number(parts.find((x) => x.type === t)?.value ?? 0);
  // What New York's wall clock read at UTC midnight → the zone offset.
  const wall = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
  const offsetMs = wall - utcMidnight.getTime();
  return new Date(utcMidnight.getTime() - offsetMs);
}

/** The last `n` shop-day keys, oldest first (today included). */
export function recentDayKeys(n: number): string[] {
  const out: string[] = [];
  const now = Date.now();
  for (let i = n - 1; i >= 0; i--) {
    out.push(shopDayKey(new Date(now - i * 86_400_000)));
  }
  return out;
}

const keyFor = (day: string, step: FunnelStep) => `${KEY_PREFIX}:${day}:${step}`;

function pipeline(commands: string[][]): Promise<unknown[] | null> {
  // Never surfaces to the visitor: a dropped analytics beacon is
  // invisible, a thrown request is a broken page.
  return redisPipeline(commands, "funnel");
}

/**
 * Increment one counter per step. Steps are deduplicated per visitor
 * session on the client, so these count PEOPLE reaching a step, not
 * clicks — which is what makes the step-to-step percentages meaningful.
 */
export async function recordSteps(steps: FunnelStep[]): Promise<void> {
  if (!funnelEnabled || steps.length === 0) return;
  const day = shopDayKey();
  const cmds: string[][] = [];
  for (const step of new Set(steps)) {
    const k = keyFor(day, step);
    cmds.push(["INCR", k]);
    // NX so the 90-day window is measured from the day's first event and
    // isn't pushed forward by every later increment.
    cmds.push(["EXPIRE", k, String(TTL_SECONDS), "NX"]);
  }
  await pipeline(cmds);
}

export type FunnelCounts = Record<FunnelStep, number>;

/**
 * Summed counters over the given days. Returns null when Upstash is not
 * configured, so the caller can say so instead of rendering zeros that
 * look like "nobody visited".
 */
export async function readFunnel(days: string[]): Promise<FunnelCounts | null> {
  if (!funnelEnabled || days.length === 0) return null;
  const keys: string[] = [];
  for (const day of days) {
    for (const step of FUNNEL_STEPS) keys.push(keyFor(day, step));
  }
  const res = await pipeline([["MGET", ...keys]]);
  const values = Array.isArray(res?.[0]) ? (res[0] as unknown[]) : null;
  if (!values) return null;

  const out = Object.fromEntries(
    FUNNEL_STEPS.map((s) => [s, 0]),
  ) as FunnelCounts;
  values.forEach((v, i) => {
    const step = FUNNEL_STEPS[i % FUNNEL_STEPS.length];
    const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : 0;
    if (Number.isFinite(n)) out[step] += n;
  });
  return out;
}
