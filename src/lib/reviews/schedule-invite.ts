import "server-only";
import { prisma } from "@/lib/db/prisma";
import { sendReviewInviteEmail } from "@/lib/email";

/**
 * Claim-and-schedule for the post-purchase review invite.
 *
 * The invite used to fire only on a manual DELIVERED transition in the
 * admin — a status nobody reliably sets, so in practice no invites went
 * out and the store collected zero reviews. It now ALSO schedules on
 * SHIPPED (ShipStation webhook or admin), a transition that happens
 * automatically, with a longer delay to land after the package does.
 *
 * The `reviewInviteSentAt IS NULL` guard is claimed atomically via
 * updateMany BEFORE the send, so concurrent transitions (double webhook
 * delivery, two admin tabs) can't double-invite. If the send fails the
 * claim is released so a later transition can retry.
 */
export async function scheduleReviewInvite(params: {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  delayMs: number;
}): Promise<boolean> {
  const claimed = await prisma.order.updateMany({
    where: { id: params.orderId, reviewInviteSentAt: null },
    data: { reviewInviteSentAt: new Date() },
  });
  if (claimed.count !== 1) return false;

  try {
    await sendReviewInviteEmail({
      orderId: params.orderId,
      orderNumber: params.orderNumber,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      scheduledAt: new Date(Date.now() + params.delayMs).toISOString(),
    });
    return true;
  } catch (err) {
    console.error(
      `[review-invite] schedule failed for order=${params.orderId}:`,
      err,
    );
    // Release the claim so the invite isn't lost forever.
    await prisma.order
      .updateMany({
        where: { id: params.orderId },
        data: { reviewInviteSentAt: null },
      })
      .catch(() => {});
    return false;
  }
}

/** Invite lands ~9 days after shipping — after typical US transit. */
export const REVIEW_INVITE_AFTER_SHIP_MS = 9 * 24 * 60 * 60 * 1000;

/** Invite lands 1 day after a manual DELIVERED flip. */
export const REVIEW_INVITE_AFTER_DELIVERY_MS = 24 * 60 * 60 * 1000;
