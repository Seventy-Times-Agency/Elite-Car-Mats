import "server-only";
import { timingSafeEqual } from "crypto";
import { getShipstationWebhookToken } from "../config";

/**
 * ShipStation does not sign webhook requests. Their guidance:
 * "include a secret token in the webhook URL and verify it server-side".
 *
 * https://help.shipstation.com/hc/en-us/articles/360025856212
 *
 * We require the caller to pass `?token=<secret>` (or the matching
 * `x-shipstation-token` header for clients that strip query strings).
 * Comparison is constant-time to avoid timing attacks.
 */
export function verifyShipstationWebhookRequest(req: Request): boolean {
  const expected = getShipstationWebhookToken();
  if (!expected) return false;

  const url = new URL(req.url);
  const provided =
    url.searchParams.get("token") ||
    req.headers.get("x-shipstation-token") ||
    "";
  if (!provided) return false;

  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
