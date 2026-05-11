import "server-only";

/**
 * ShipStation integration is fully opt-in via env vars. When unconfigured,
 * every entry point is a no-op so prod behaviour stays exactly as today
 * (manual operator workflow + admin tracking-number input).
 */
export function isShipstationConfigured(): boolean {
  return Boolean(
    process.env.SHIPSTATION_API_KEY && process.env.SHIPSTATION_API_SECRET,
  );
}

export function getShipstationCredentials(): {
  apiKey: string;
  apiSecret: string;
} | null {
  const apiKey = process.env.SHIPSTATION_API_KEY?.trim();
  const apiSecret = process.env.SHIPSTATION_API_SECRET?.trim();
  if (!apiKey || !apiSecret) return null;
  return { apiKey, apiSecret };
}

/**
 * ShipStation does not sign webhook payloads. Their official guidance is
 * to put a shared secret in the URL query string and verify it on receipt.
 * We compare with timingSafeEqual to avoid leaking length via early-exit.
 */
export function getShipstationWebhookToken(): string | null {
  return process.env.SHIPSTATION_WEBHOOK_SECRET?.trim() || null;
}

/**
 * Store identifier (V1 API "storeId" — needed if the account has multiple
 * stores). Optional; ShipStation will route to the default store when
 * omitted.
 */
export function getShipstationStoreId(): number | null {
  const raw = process.env.SHIPSTATION_STORE_ID?.trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}
