import "server-only";
import { prisma } from "@/lib/db/prisma";
import { loadPriceOverrides } from "@/lib/pricing-overrides";
import { isShipstationConfigured, getShipstationStoreId } from "../config";
import { shipstation, ShipstationApiError } from "./client";
import { mapOrderToShipstation } from "./map-order";
import type { SsCreateOrderRequest, SsCreateOrderResponse } from "./types";

/**
 * Push a confirmed order to ShipStation. Designed to be called from the
 * Stripe webhook handler immediately after the order flips to CONFIRMED.
 *
 * Contract:
 *   - Returns `{ ok: false, reason }` rather than throwing for predictable
 *     skip cases (not configured, order not found, already pushed). Callers
 *     can log + ignore.
 *   - Throws on transient errors (network, 5xx) so the caller can decide
 *     whether to retry. We deliberately do NOT swallow these — better to
 *     surface them in the Stripe webhook log than silently lose orders.
 *   - On success, stamps `Order.shipstationOrderId` so subsequent calls
 *     short-circuit (covers Stripe re-delivery edge cases that bypass the
 *     WebhookEvent claim, e.g. manual replays).
 */

export type PushResult =
  | { ok: true; shipstationOrderId: number }
  | { ok: false; reason: PushSkipReason };

export type PushSkipReason =
  | "not-configured"
  | "order-not-found"
  | "already-pushed"
  | "missing-address";

export async function pushOrderToShipstation(
  orderId: string,
): Promise<PushResult> {
  if (!isShipstationConfigured()) return { ok: false, reason: "not-configured" };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: { include: { model: { include: { brand: true } } } },
          color: true,
          edgeColor: true,
          badge: true,
        },
      },
    },
  });
  if (!order) return { ok: false, reason: "order-not-found" };

  // Idempotency short-circuit: don't push twice.
  if (order.shipstationOrderId) return { ok: false, reason: "already-pushed" };

  if (!order.address || !order.zip || !order.city || !order.state) {
    return { ok: false, reason: "missing-address" };
  }

  const overrides = await loadPriceOverrides();
  const payload: SsCreateOrderRequest = mapOrderToShipstation(order, {
    overrides,
    storeId: getShipstationStoreId() ?? undefined,
  });

  let resp: SsCreateOrderResponse;
  try {
    resp = await shipstation.post<SsCreateOrderResponse>(
      "/orders/createorder",
      payload,
    );
  } catch (err) {
    if (err instanceof ShipstationApiError && !err.isTransient) {
      // Permanent failure (4xx other than rate-limit) — mark with a sentinel
      // so retries don't keep hammering the API. Operator can clear the
      // sentinel from the admin once the underlying issue is resolved.
      console.error(
        `[shipstation] permanent failure for order=${orderId}: ${err.message}`,
      );
    }
    throw err;
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { shipstationOrderId: String(resp.orderId) },
  });

  return { ok: true, shipstationOrderId: resp.orderId };
}
