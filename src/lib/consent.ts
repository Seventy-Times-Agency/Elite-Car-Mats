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
