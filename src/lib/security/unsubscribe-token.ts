import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Deliberately NOT importing siteUrl from email/transport — transport
// imports this module for List-Unsubscribe headers, and that would be a
// circular import.
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitecarmats.us";

/**
 * Stateless HMAC tokens for one-click newsletter unsubscribe links —
 * CAN-SPAM requires a working opt-out in every commercial email, and
 * the footer already promises "Unsubscribe in one click".
 *
 * The token is the HMAC of the lowercased subscriber email, keyed with
 * the same secret chain as order tokens. A prefix ("unsub:") separates
 * the domains so an order token can never double as an unsubscribe
 * token or vice versa.
 */

function secret(): string {
  return process.env.ORDER_TOKEN_SECRET ?? process.env.SESSION_SECRET ?? "";
}

export function signUnsubscribeToken(email: string): string {
  const s = secret();
  if (!s) return "";
  return createHmac("sha256", s)
    .update(`unsub:${email.trim().toLowerCase()}`)
    .digest("hex");
}

export function verifyUnsubscribeToken(
  email: string,
  token: string | null,
): boolean {
  if (!token) return false;
  const expected = signUnsubscribeToken(email);
  if (!expected) return false;
  const a = Buffer.from(token, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) {
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
}

/** Full one-click unsubscribe URL for a subscriber email. */
export function unsubscribeUrl(email: string): string {
  const e = email.trim().toLowerCase();
  const qs = new URLSearchParams({ e, t: signUnsubscribeToken(e) });
  return `${SITE}/api/newsletter/unsubscribe?${qs.toString()}`;
}
