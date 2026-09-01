"use client";

/**
 * Cookie-consent state shared by the banner and the analytics loaders.
 *
 * The privacy policy promises analytics "only with your consent" — so
 * the Meta Pixel (and any future tag) must not load until the visitor
 * explicitly accepts. The banner used to store a bare timestamp with no
 * decline path; those legacy values are treated as NO decision so the
 * visitor gets one real accept/decline choice.
 */

export type ConsentValue = "accepted" | "rejected";

const KEY = "ecm_cookies_v1";
export const CONSENT_EVENT = "ecm-consent-change";

export function getConsent(): ConsentValue | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "accepted" || v === "rejected" ? v : null;
  } catch {
    return null;
  }
}

/**
 * Strip the order-token query param before any analytics script loads.
 *
 * `/order/<n>?t=…` and `/checkout/success?…&t=…` carry a never-expiring
 * HMAC token that unlocks the customer's name/address/phone via the
 * order API. fbevents.js reports the full URL in its `dl=` beacon and
 * gtag sends `page_location` — with the token in the address bar, anyone
 * with access to the Meta/GA property could replay it. Called by both
 * analytics loaders right before their scripts mount; the current view
 * keeps working (it was already server-rendered and `useSearchParams`
 * doesn't observe `history.replaceState`), only a manual refresh loses
 * the token — the email link still has it.
 */
export function scrubOrderTokenFromUrl(): void {
  try {
    const u = new URL(window.location.href);
    if (!u.searchParams.has("t")) return;
    u.searchParams.delete("t");
    window.history.replaceState(window.history.state, "", u.toString());
  } catch {
    // ignore — worst case the token stays in the URL as before
  }
}

export function setConsent(value: ConsentValue): void {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    // Storage unavailable — the in-page event below still updates the UI.
  }
  try {
    window.dispatchEvent(new Event(CONSENT_EVENT));
  } catch {
    // ignore
  }
}
