import { cookies, headers } from "next/headers";
import { ensureSchema } from "./db-setup";

export const ADMIN_COOKIE = "ecm_admin";
export const ADMIN_MAX_AGE = 60 * 60 * 24 * 7;

function adminToken(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 5) return null;
  return password;
}

export async function requireAdmin(): Promise<boolean> {
  const token = adminToken();
  if (!token) return false;
  const store = await cookies();
  const ok = store.get(ADMIN_COOKIE)?.value === token;
  if (ok) {
    // First authenticated admin call on a cold start triggers an
    // idempotent schema sync so missing columns/tables heal themselves.
    await ensureSchema();
  }
  return ok;
}

/**
 * Auth gate for the diagnostic /api/admin/* GET endpoints. Accepts either
 * a logged-in admin cookie OR a matching token via x-admin-token header /
 * ?token= query string. The token is the same value as ADMIN_PASSWORD —
 * one secret to manage instead of two.
 */
export async function requireAdminApi(request: Request): Promise<boolean> {
  const token = adminToken();
  if (!token) return false;

  // 1. Cookie path — operator already logged in.
  const cookieStore = await cookies();
  if (cookieStore.get(ADMIN_COOKIE)?.value === token) return true;

  // 2. Header path — useful for curl from a terminal.
  const hdr = (await headers()).get("x-admin-token");
  if (hdr && hdr === token) return true;

  // 3. Query-string path — useful for clicking the link in a browser.
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("token");
    if (q && q === token) return true;
  } catch {
    // ignore malformed URL
  }
  return false;
}

export async function signInAdmin(password: string): Promise<boolean> {
  const token = adminToken();
  if (!token) return false;
  if (password !== token) return false;
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ADMIN_MAX_AGE,
    path: "/",
  });
  // Kick the schema sync at login time so the dashboard lands on a
  // fully-migrated DB.
  await ensureSchema();
  return true;
}

export async function signOutAdmin(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export function isAdminConfigured(): boolean {
  return adminToken() !== null;
}
