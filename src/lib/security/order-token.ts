import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Per-order HMAC tokens. Customers receive an order URL like
 *   /order/ECM-XXXX-YYYY?t=<token>
 * The token is the HMAC of the order id with ORDER_TOKEN_SECRET. Anyone
 * guessing the order number alone cannot view the order — they need the
 * token, which is only ever sent in the confirmation email and stored in
 * the page URL the customer was redirected to after checkout.
 *
 * Tokens are stateless (no DB row) — verification is just a constant-time
 * HMAC compare.
 *
 * Falls back to SESSION_SECRET if ORDER_TOKEN_SECRET is unset, so a single-
 * env deployment keeps working. In dev with no secret at all, every token
 * is rejected — the GET endpoint will surface a 403.
 */

function secret(): string {
  return (
    process.env.ORDER_TOKEN_SECRET ??
    process.env.SESSION_SECRET ??
    ""
  );
}

export function signOrderToken(orderId: string): string {
  const s = secret();
  if (!s) return "";
  return createHmac("sha256", s).update(orderId).digest("hex");
}

export function verifyOrderToken(orderId: string, token: string | null): boolean {
  if (!token) return false;
  const s = secret();
  if (!s) return false;
  const expected = signOrderToken(orderId);
  if (!expected) return false;
  const a = Buffer.from(token, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) {
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
}
