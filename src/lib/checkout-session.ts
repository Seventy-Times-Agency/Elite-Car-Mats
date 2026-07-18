"use client";

/**
 * Client-side persistence for the order created during checkout.
 *
 * The Stripe flow leaves the page (redirect to Checkout) — a ref alone
 * dies with the unmount, so a customer who cancels on Stripe's page and
 * comes back would create a DUPLICATE order (and consume the promo code
 * again) on retry. sessionStorage survives the round-trip within the tab
 * and lets /checkout reuse the already-created PENDING order.
 *
 * Cleared on the success page — after payment the pending order is done.
 */

export interface PendingOrder {
  /** JSON fingerprint of the payload that created this order. */
  fingerprint: string;
  id: string;
  orderNumber: string;
  orderToken: string;
  total?: number;
}

const KEY = "ecm_pending_order";

export function loadPendingOrder(): PendingOrder | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingOrder>;
    if (
      typeof parsed.fingerprint !== "string" ||
      typeof parsed.id !== "string" ||
      typeof parsed.orderNumber !== "string" ||
      typeof parsed.orderToken !== "string"
    ) {
      return null;
    }
    return parsed as PendingOrder;
  } catch {
    // Private mode / storage disabled / corrupt JSON — behave as if empty.
    return null;
  }
}

export function savePendingOrder(order: PendingOrder): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(order));
  } catch {
    // Storage full/unavailable — checkout still works, retry just
    // won't survive a page unload.
  }
}

export function clearPendingOrder(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
