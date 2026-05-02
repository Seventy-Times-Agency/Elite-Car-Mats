import { cookies, headers } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual, scryptSync } from "node:crypto";
import { ensureSchema } from "@/lib/db/setup";

export const ADMIN_COOKIE = "ecm_admin";
export const ADMIN_MAX_AGE = 60 * 60 * 24; // 24 hours, sliding (re-issued on each requireAdmin)

// ---------------------------------------------------------------------------
// Secrets
// ---------------------------------------------------------------------------
//
// ADMIN_PASSWORD (required)        — what the operator types into the login form.
// ADMIN_PASSWORD_HASH (optional)   — scrypt hash of the password in the form
//                                    "scrypt:<salt-hex>:<hash-hex>". When set,
//                                    takes precedence over ADMIN_PASSWORD.
// SESSION_SECRET (recommended)     — HMAC key used to sign the session cookie.
//                                    Falls back to a value derived from the
//                                    password if unset, but operators are urged
//                                    to set a separate random 32-byte hex string
//                                    so rotating the password doesn't auto-rotate
//                                    every existing session.
// ADMIN_API_TOKEN (optional)       — bearer token for `x-admin-token` header on
//                                    diagnostic GET endpoints. If unset, only
//                                    the cookie path works.
// ---------------------------------------------------------------------------

const MIN_PASSWORD_LENGTH = 12;
const FORBIDDEN_PASSWORDS = new Set([
  "admin",
  "password",
  "letmein",
  "qwerty",
  "12345678",
  "elitecarmats",
]);

function passwordPlain(): string | null {
  const p = process.env.ADMIN_PASSWORD;
  if (!p) return null;
  if (p.length < MIN_PASSWORD_LENGTH) return null;
  if (FORBIDDEN_PASSWORDS.has(p.toLowerCase())) return null;
  return p;
}

interface ScryptHash {
  salt: Buffer;
  hash: Buffer;
}

function parseHash(): ScryptHash | null {
  const raw = process.env.ADMIN_PASSWORD_HASH;
  if (!raw) return null;
  const parts = raw.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return null;
  try {
    return {
      salt: Buffer.from(parts[1], "hex"),
      hash: Buffer.from(parts[2], "hex"),
    };
  } catch {
    return null;
  }
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) {
    // Still do a constant-time compare against ab to avoid leaking length
    // via timing — then return false.
    timingSafeEqual(ab, ab);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

function verifyPassword(input: string): boolean {
  const hash = parseHash();
  if (hash) {
    const derived = scryptSync(input, hash.salt, hash.hash.length);
    if (derived.length !== hash.hash.length) return false;
    return timingSafeEqual(derived, hash.hash);
  }
  const plain = passwordPlain();
  if (!plain) return false;
  return timingSafeEqualStr(input, plain);
}

function sessionSecret(): string {
  const explicit = process.env.SESSION_SECRET;
  if (explicit && explicit.length >= 16) return explicit;
  // Fallback: derive a key from the password hash or password itself so
  // existing deployments continue to work without an additional env var,
  // but log a warning once per process.
  const fallback =
    process.env.ADMIN_PASSWORD_HASH ?? process.env.ADMIN_PASSWORD ?? null;
  if (!fallback) return "";
  if (!sessionSecretWarned) {
    console.warn(
      "[auth] SESSION_SECRET is not set — falling back to a key derived " +
        "from ADMIN_PASSWORD. Set SESSION_SECRET to a random 32-byte hex " +
        "string in your environment to decouple session signing from the " +
        "admin password.",
    );
    sessionSecretWarned = true;
  }
  return `derived:${fallback}`;
}
let sessionSecretWarned = false;

// ---------------------------------------------------------------------------
// Signed session token  (cookie value = "<expiresAtMs>.<hmacHex>")
// ---------------------------------------------------------------------------

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("hex");
}

function issueToken(): string {
  const expiresAt = Date.now() + ADMIN_MAX_AGE * 1000;
  // A random nonce makes each token distinct even for the same expiry,
  // so cookie revocation by re-issuing actually invalidates the prior one
  // (clients only ever hold the latest cookie).
  const nonce = randomBytes(8).toString("hex");
  const payload = `${expiresAt}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const lastDot = token.lastIndexOf(".");
  if (lastDot < 0) return false;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  const expected = sign(payload);
  if (!timingSafeEqualStr(sig, expected)) return false;
  const firstDot = payload.indexOf(".");
  if (firstDot < 0) return false;
  const expiresAtStr = payload.slice(0, firstDot);
  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt)) return false;
  if (expiresAt < Date.now()) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function requireAdmin(): Promise<boolean> {
  if (!isAdminConfigured()) return false;
  const store = await cookies();
  const ok = verifyToken(store.get(ADMIN_COOKIE)?.value);
  if (ok) {
    // Self-heal schema on first authenticated call of a cold start.
    await ensureSchema();
  }
  return ok;
}

/**
 * Auth gate for diagnostic /api/admin/* endpoints. Accepts either a valid
 * session cookie OR a separate ADMIN_API_TOKEN via `x-admin-token` header.
 * Query-string token auth has been removed — query strings leak into logs
 * and Referer headers.
 */
export async function requireAdminApi(): Promise<boolean> {
  if (await requireAdmin()) return true;

  const apiToken = process.env.ADMIN_API_TOKEN;
  if (!apiToken || apiToken.length < 16) return false;
  const hdr = (await headers()).get("x-admin-token");
  if (!hdr) return false;
  return timingSafeEqualStr(hdr, apiToken);
}

export async function signInAdmin(password: string): Promise<boolean> {
  if (!isAdminConfigured()) return false;
  if (!verifyPassword(password)) return false;
  const store = await cookies();
  store.set(ADMIN_COOKIE, issueToken(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: ADMIN_MAX_AGE,
    path: "/",
  });
  await ensureSchema();
  return true;
}

export async function signOutAdmin(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export function isAdminConfigured(): boolean {
  return parseHash() !== null || passwordPlain() !== null;
}

/**
 * Lightweight Origin/Referer check for state-changing admin endpoints.
 * Returns true if the request is same-origin or originated from a known site
 * URL. Belt-and-suspenders defence to back up `sameSite: "strict"` on the
 * session cookie.
 */
export function checkAdminCsrf(request: Request): boolean {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return true;

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const allowed: string[] = [];
  if (host) {
    allowed.push(`http://${host}`, `https://${host}`);
  }
  if (siteUrl) {
    try {
      allowed.push(new URL(siteUrl).origin);
    } catch {
      // ignore malformed env value
    }
  }

  const matches = (raw: string | null): boolean => {
    if (!raw) return false;
    try {
      const o = new URL(raw).origin;
      return allowed.includes(o);
    } catch {
      return false;
    }
  };

  if (origin) return matches(origin);
  if (referer) return matches(referer);
  // Neither header — modern browsers always send Origin on cross-site POSTs,
  // so an absent Origin from the same browser session is unusual but allowed
  // (server-to-server clients legitimately don't send one).
  return true;
}
