import { cookies } from "next/headers";
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
