import { NextResponse } from "next/server";
import { z } from "zod";
import {
  handleShipNotifyResource,
  isShipstationConfigured,
  verifyShipstationWebhookRequest,
} from "@/lib/shipping/shipstation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const envelopeSchema = z.object({
  resource_url: z.string().url(),
  resource_type: z.string().min(1),
});

/**
 * ShipStation webhook receiver. ShipStation POSTs a tiny envelope here
 * whenever a configured event fires (we only subscribe to SHIP_NOTIFY and
 * ITEM_SHIP_NOTIFY). The envelope contains a `resource_url` we then fetch
 * with our API credentials to get the actual shipment payload.
 *
 * Auth: we don't get an HMAC signature from ShipStation — see
 * webhook-verify.ts for the shared-secret-in-URL approach.
 *
 * Idempotency: every state transition is guarded by a status check in
 * handle-ship-notify.ts, so a retried webhook is a safe no-op.
 */
export async function POST(request: Request) {
  if (!isShipstationConfigured()) {
    return NextResponse.json({ ok: true, skipped: "not-configured" });
  }

  if (!verifyShipstationWebhookRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }
  const parsed = envelopeSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid-envelope" }, { status: 400 });
  }
  const envelope = parsed.data;

  console.log(
    `[shipstation-webhook] ${envelope.resource_type} ${envelope.resource_url}`,
  );

  try {
    switch (envelope.resource_type) {
      case "SHIP_NOTIFY":
      case "ITEM_SHIP_NOTIFY": {
        const result = await handleShipNotifyResource(envelope.resource_url);
        return NextResponse.json({ ok: true, ...result });
      }
      default:
        // ORDER_NOTIFY / ITEM_ORDER_NOTIFY are not subscribed to in our
        // ShipStation config, but acknowledge them gracefully if they
        // arrive (operator may have toggled them on for debugging).
        return NextResponse.json({ ok: true, ignored: envelope.resource_type });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[shipstation-webhook] handler error: ${msg}`);
    return NextResponse.json({ error: "handler-failure" }, { status: 500 });
  }
}
