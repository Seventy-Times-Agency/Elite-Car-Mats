import "server-only";
import { getShipstationCredentials } from "../config";

const BASE_URL = "https://ssapi.shipstation.com";

/**
 * Low-level HTTP wrapper. Adds Basic auth, JSON serialisation, timeouts,
 * and a typed error so callers can branch on transient vs permanent
 * failures. Keep business logic out of this file — it should stay a thin
 * fetch adapter.
 */

export class ShipstationApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string,
    public readonly url: string,
  ) {
    super(`ShipStation ${status} ${url}: ${body.slice(0, 200)}`);
    this.name = "ShipstationApiError";
  }

  get isTransient(): boolean {
    return this.status === 429 || this.status >= 500;
  }
}

function authHeader(): string {
  const creds = getShipstationCredentials();
  if (!creds) {
    throw new Error(
      "ShipStation credentials are not configured (SHIPSTATION_API_KEY/SECRET).",
    );
  }
  const token = Buffer.from(`${creds.apiKey}:${creds.apiSecret}`).toString(
    "base64",
  );
  return `Basic ${token}`;
}

async function request<TResp>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
  init?: { timeoutMs?: number },
): Promise<TResp> {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const controller = new AbortController();
  const timeoutMs = init?.timeoutMs ?? 15_000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
      // Webhook + order push must never be cached by Next's fetch cache.
      cache: "no-store",
    });

    const text = await res.text();
    if (!res.ok) throw new ShipstationApiError(res.status, text, url);
    if (!text) return undefined as TResp;
    try {
      return JSON.parse(text) as TResp;
    } catch {
      throw new ShipstationApiError(res.status, `Invalid JSON: ${text}`, url);
    }
  } finally {
    clearTimeout(timer);
  }
}

export const shipstation = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
  /** Fetch an absolute resource_url from a webhook envelope. */
  getResource: <T>(absoluteUrl: string) => request<T>("GET", absoluteUrl),
};
