import "server-only";
import { prisma } from "@/lib/db/prisma";
import { sendShippedEmail } from "@/lib/email";
import { signOrderToken } from "@/lib/security/order-token";
import { shipstation } from "./client";
import type { SsShipment, SsShipmentList } from "./types";

/**
 * Webhook handler for SHIP_NOTIFY events. ShipStation's webhook payload
 * only contains a resource_url — we must fetch it to get the actual
 * shipment(s) that were created/voided.
 *
 * For each shipment, we look up the matching order by orderKey (preferred,
 * format "ecm-<orderId>") falling back to orderNumber, then:
 *   - flip Order.status → SHIPPED
 *   - store trackingNumber + carrier + shippedAt
 *   - send the customer their tracking email
 *
 * Voided shipments are ignored — operator can re-issue via SS UI.
 *
 * Designed to be idempotent: re-processing the same shipment is safe
 * because we guard the status transition (CONFIRMED|PRODUCTION → SHIPPED)
 * and don't double-send the email when the row was already in SHIPPED.
 */

/**
 * Tight allowlist for the host portion of the resource_url that
 * ShipStation tells us to fetch. Without this an attacker who knew our
 * webhook token could submit `resource_url: "https://attacker.example
 * .com/leak"` and we'd happily POST our Basic-auth-bearing request to
 * them — full credential exfiltration via SSRF.
 */
const SHIPSTATION_API_HOST = "ssapi.shipstation.com";

function assertShipstationResourceUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("ShipStation resource_url is not a valid URL");
  }
  if (parsed.protocol !== "https:") {
    throw new Error("ShipStation resource_url must use https");
  }
  if (parsed.host !== SHIPSTATION_API_HOST) {
    throw new Error(
      `ShipStation resource_url host "${parsed.host}" is not allowlisted`,
    );
  }
}

export async function handleShipNotifyResource(resourceUrl: string): Promise<{
  processed: number;
  skipped: number;
}> {
  assertShipstationResourceUrl(resourceUrl);
  const list = await shipstation.getResource<SsShipmentList>(resourceUrl);
  let processed = 0;
  let skipped = 0;

  for (const shipment of list.shipments ?? []) {
    if (shipment.voided) {
      skipped += 1;
      continue;
    }
    const applied = await applyShipmentToOrder(shipment);
    if (applied) processed += 1;
    else skipped += 1;
  }

  return { processed, skipped };
}

async function findOrderIdForShipment(
  shipment: SsShipment,
): Promise<string | null> {
  // Preferred: our own orderKey (ecm-<orderId>) survives operator edits
  // to orderNumber in the ShipStation UI.
  if (shipment.orderKey?.startsWith("ecm-")) {
    const id = shipment.orderKey.slice("ecm-".length);
    const found = await prisma.order.findUnique({
      where: { id },
      select: { id: true },
    });
    if (found) return found.id;
  }
  // Fallback: orderNumber lookup. Useful if the operator created the
  // order manually in ShipStation rather than via our push.
  if (shipment.orderNumber) {
    const found = await prisma.order.findUnique({
      where: { orderNumber: shipment.orderNumber },
      select: { id: true },
    });
    if (found) return found.id;
  }
  return null;
}

async function applyShipmentToOrder(shipment: SsShipment): Promise<boolean> {
  const orderId = await findOrderIdForShipment(shipment);
  if (!orderId) {
    console.warn(
      `[shipstation-webhook] shipment ${shipment.shipmentId} matched no order (orderKey=${shipment.orderKey} orderNumber=${shipment.orderNumber})`,
    );
    return false;
  }

  // Guarded update — only transition from a pre-shipped state. The
  // updateMany returning count=0 means a concurrent webhook beat us to it
  // and the customer email has already been sent.
  const res = await prisma.order.updateMany({
    where: {
      id: orderId,
      status: { in: ["CONFIRMED", "PRODUCTION", "PENDING"] },
    },
    data: {
      status: "SHIPPED",
      trackingNumber: shipment.trackingNumber,
      carrier: shipment.carrierCode,
      shippedAt: shipment.shipDate ? new Date(shipment.shipDate) : new Date(),
    },
  });

  if (res.count === 0) {
    console.log(
      `[shipstation-webhook] order=${orderId} already shipped — no-op`,
    );
    return false;
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        orderNumber: true,
        customerName: true,
        email: true,
      },
    });
    if (order) {
      await sendShippedEmail({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.email,
        trackingNumber: shipment.trackingNumber,
        orderToken: signOrderToken(orderId),
      });
    }
  } catch (err) {
    // Email failure is not fatal — the order is already flipped to
    // SHIPPED in the DB so the customer can still see status via /track.
    console.error(
      `[shipstation-webhook] shipped-email failed for order=${orderId}:`,
      err,
    );
  }
  return true;
}
