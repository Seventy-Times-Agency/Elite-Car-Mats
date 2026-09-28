import "server-only";
import { redisEnabled, redisPipeline } from "@/lib/redis-rest";

/**
 * Problem journal: server errors in plain words for the admin, instead
 * of Vercel logs nobody reads.
 *
 * Each problem is folded by a fingerprint (area + message with ids and
 * numbers stripped), so a card declined 40 times is one line with a
 * counter, not 40 lines. Kept in Redis for 30 days — never Postgres:
 * errors spike exactly when things go wrong, and a write per error is
 * the per-request DB traffic that took the shop down in August.
 *
 * Critical problems also email the owner, at most once per 6 hours per
 * fingerprint, so a broken checkout is noticed the same day.
 */

export type ProblemSeverity = "critical" | "warning";

/**
 * Where it happened. Titles for these live in the ops dictionaries as
 * `journal.area.<area>`; an unknown area falls back to its raw name.
 */
export type ProblemArea =
  | "order.create"
  | "checkout.session"
  | "webhook.signature"
  | "webhook.claim"
  | "webhook.handler"
  | "db.setup"
  | "stripe.sdk"
  | "custom.order"
  | "email.send"
  | "contact.send"
  | "capi"
  | "reviews"
  | "orders.followup"
  | "request.error";

export interface ProblemInput {
  area: ProblemArea;
  severity: ProblemSeverity;
  error?: unknown;
  /** Used when there is no error object, or to prefix it. */
  message?: string;
  /** Short extra detail: order number, path, subject line. */
  context?: string;
}

export interface Problem {
  id: string;
  area: string;
  severity: ProblemSeverity;
  message: string;
  context: string;
  count: number;
  firstAt: number;
  lastAt: number;
}

const TTL_SECONDS = 30 * 24 * 60 * 60;
const MAIL_THROTTLE_SECONDS = 6 * 60 * 60;
const PREFIX = "ecm:journal";
const INDEX = `${PREFIX}:idx`;
const problemKey = (id: string) => `${PREFIX}:p:${id}`;
const mailKey = (id: string) => `${PREFIX}:mail:${id}`;

export const journalEnabled = redisEnabled;

function messageOf(input: ProblemInput): string {
  const err = input.error;
  const raw =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : err
          ? JSON.stringify(err)
          : "";
  const text = [input.message, raw].filter(Boolean).join(": ");
  return (text || "unknown error").slice(0, 500);
}

/**
 * Ids, numbers and long tokens vary between occurrences of the same
 * problem; stripping them makes repeats fold into one line.
 */
export function normalizeForFingerprint(message: string): string {
  return message
    .toLowerCase()
    .replace(/\b[a-z0-9_-]{16,}\b/g, "*")
    .replace(/\d+/g, "#")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

/** FNV-1a — tiny, dependency-free, fine for bucketing. */
export function fingerprint(area: string, message: string): string {
  const s = `${area}|${normalizeForFingerprint(message)}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/**
 * Record a problem. Never throws and never slows the caller down beyond
 * one Redis round-trip; callers keep their own console.error for logs.
 */
export async function reportProblem(input: ProblemInput): Promise<void> {
  if (!journalEnabled) return;
  try {
    const message = messageOf(input);
    const id = fingerprint(input.area, message);
    const key = problemKey(id);
    const now = Date.now();
    const res = await redisPipeline(
      [
        ["HSETNX", key, "firstAt", now],
        [
          "HSET", key,
          "area", input.area,
          "severity", input.severity,
          "message", message,
          "context", (input.context ?? "").slice(0, 300),
          "lastAt", now,
        ],
        ["HINCRBY", key, "count", 1],
        ["EXPIRE", key, TTL_SECONDS],
        ["ZADD", INDEX, now, id],
        ["EXPIRE", INDEX, TTL_SECONDS],
        ...(input.severity === "critical"
          ? [["SET", mailKey(id), 1, "NX", "EX", MAIL_THROTTLE_SECONDS]]
          : []),
      ],
      "journal",
    );
    const mailSlot = input.severity === "critical" ? res?.[6] : null;
    if (mailSlot === "OK") {
      const count = Number(res?.[2] ?? 1);
      await notifyOwner({ id, area: input.area, message, context: input.context ?? "", count });
    }
  } catch (err) {
    console.warn("[journal] report failed:", err);
  }
}

async function notifyOwner(p: {
  id: string;
  area: string;
  message: string;
  context: string;
  count: number;
}): Promise<void> {
  // Lazy: the transport reports its own failures into this journal.
  const { sendProblemAlertEmail } = await import("@/lib/email/templates/problem-alert");
  await sendProblemAlertEmail(p);
}

function parseHash(flat: unknown): Record<string, string> | null {
  if (!Array.isArray(flat) || flat.length === 0) return null;
  const out: Record<string, string> = {};
  for (let i = 0; i + 1 < flat.length; i += 2) out[String(flat[i])] = String(flat[i + 1]);
  return out;
}

/** Newest first. Null = Redis not configured or unreachable. */
export async function listProblems(limit = 100): Promise<Problem[] | null> {
  if (!journalEnabled) return null;
  const ids = await redisPipeline([["ZREVRANGE", INDEX, 0, limit - 1]], "journal");
  if (!ids) return null;
  const list = Array.isArray(ids[0]) ? (ids[0] as unknown[]).map(String) : [];
  if (list.length === 0) return [];
  const hashes = await redisPipeline(list.map((id) => ["HGETALL", problemKey(id)]), "journal");
  if (!hashes) return null;
  const out: Problem[] = [];
  const expired: string[] = [];
  list.forEach((id, i) => {
    const h = parseHash(hashes[i]);
    if (!h) {
      expired.push(id);
      return;
    }
    out.push({
      id,
      area: h.area ?? "unknown",
      severity: h.severity === "critical" ? "critical" : "warning",
      message: h.message ?? "",
      context: h.context ?? "",
      count: Number(h.count ?? 1),
      firstAt: Number(h.firstAt ?? h.lastAt ?? 0),
      lastAt: Number(h.lastAt ?? 0),
    });
  });
  if (expired.length) {
    await redisPipeline([["ZREM", INDEX, ...expired]], "journal");
  }
  return out;
}

/** "Fixed" in the admin: forget it; a recurrence starts a fresh line. */
export async function resolveProblem(id: string): Promise<boolean> {
  if (!journalEnabled || !/^[0-9a-f]{8}$/.test(id)) return false;
  const res = await redisPipeline(
    [
      ["DEL", problemKey(id)],
      ["DEL", mailKey(id)],
      ["ZREM", INDEX, id],
    ],
    "journal",
  );
  return res !== null;
}
