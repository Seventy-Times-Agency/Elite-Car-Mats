import "server-only";
import { send, siteUrl } from "../transport";
import { baseTemplate, buildT, escapeHtml } from "./base";
import { signOrderToken } from "@/lib/security/order-token";

/**
 * Post-delivery review invitation. Scheduled ~1 day after the operator
 * marks the order DELIVERED (Resend `scheduledAt` — no cron involved).
 * The link carries the order's HMAC token, so the form pre-fills the
 * customer's name + car and the review is auto-flagged "verified buyer".
 */
export async function sendReviewInviteEmail(params: {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  /** ISO 8601 delivery time for the scheduled send. */
  scheduledAt?: string;
  /** Order's stored storefront locale — the customer's language. */
  locale?: string | null;
}): Promise<string | null> {
  const t = await buildT(params.locale);
  const qs = new URLSearchParams({
    order: params.orderNumber,
    t: signOrderToken(params.orderId),
  });
  const reviewUrl = `${siteUrl}/reviews/new?${qs.toString()}`;

  const html = baseTemplate(
    t,
    `
    <h1 style="font-size:22px;font-weight:700;margin:0 0 8px;">${t("email.revInviteH1")}</h1>
    <p style="color:#aaa;font-size:14px;margin:0 0 20px;line-height:1.6;">${t("email.revInviteP", { name: escapeHtml(params.customerName) })}</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${reviewUrl}" style="display:inline-block;background:#D4A54A;color:#0F0F0F;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;padding:14px 28px;border-radius:10px;text-decoration:none;">${t("email.revInviteCta")}</a>
    </div>
    <p style="color:#8a8a8a;font-size:12px;margin:0;text-align:center;line-height:1.6;">${t("email.revInviteFoot", { orderNumber: params.orderNumber })}</p>
  `,
  );

  // Propagate the Resend id (null = send failed) — the scheduler treats
  // null as a failure and releases its claim so a later transition can
  // retry, instead of silently losing the invite forever.
  return send({
    to: params.customerEmail,
    subject: t("email.revInviteSubject"),
    html,
    ...(params.scheduledAt ? { scheduledAt: params.scheduledAt } : {}),
  });
}
