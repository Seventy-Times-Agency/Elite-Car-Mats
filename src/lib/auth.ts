import { cookies } from "next/headers";

export const ADMIN_COOKIE = "ecm_admin";
export const ADMIN_MAX_AGE = 60 * 60 * 24 * 7;

function adminToken(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 6) return null;
  return password;
}

export async function requireAdmin(): Promise<boolean> {
  const token = adminToken();
  if (!token) return false;
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === token;
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
  return true;
}

export async function signOutAdmin(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export function isAdminConfigured(): boolean {
  return adminToken() !== null;
}
