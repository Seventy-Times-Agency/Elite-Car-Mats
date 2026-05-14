import "server-only";
import { timingSafeEqual } from "crypto";
import { getShipstationWebhookToken } from "../config";

/**
 * ShipStation does not sign webhook requests. Their guidance:
 * "include a secret token in the webhook URL and verify it server-side".
 *
 * https://help.shipstation.com/hc/en-us/articles/360025856212
 *
 * Auth is via the `x-shipstation-token` header only — the legacy
 * `?token=<secret>` query path was removed because URL query strings leak
 * into CDN access logs, Referer headers and crash reports. Configure the
 * webhook in the ShipStation Dashboard with a custom header instead.
 * Comparison is constant-time to avoid timing attacks.
 */
export function verifyShipstationWebhookRequest(req: Request): boolean {
  const expected = getShipstationWebhookToken();
  if (!expected) return false;

  const provided = req.headers.get("x-shipstation-token") || "";
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
