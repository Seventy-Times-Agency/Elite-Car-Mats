import "server-only";
import { prisma } from "@/lib/db/prisma";

/**
 * Payment history. Each step of an order's life is one row, so the admin
 * can answer "why didn't this one pay?" without Stripe or Vercel logs.
 * Best-effort: a failed history write is logged and swallowed — it must
 * never fail the order, the checkout or the webhook it describes.
 */
export type OrderEventType =
  | "created"
  | "checkout_opened"
  | "payment_failed"
  | "paid"
  | "expired"
  | "async_failed"
  | "status";

export async function logOrderEvent(
  orderId: string,
  type: OrderEventType,
  detail?: Record<string, string | number | null | undefined>,
): Promise<void> {
  try {
    await prisma.orderEvent.create({
      data: {
        orderId,
        type,
        detail: detail ? JSON.stringify(detail).slice(0, 1000) : null,
      },
    });
  } catch (err) {
    console.warn(`[order-events] ${type} for ${orderId} not saved:`, err);
  }
}
