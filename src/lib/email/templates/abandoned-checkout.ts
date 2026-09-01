import "server-only";
import { send } from "../transport";
import { baseTemplate, buildT, escapeHtml } from "./base";

/**
 * Abandoned-checkout recovery. Scheduled via Resend `scheduledAt` the
 * moment a PENDING order is created for the Stripe flow — if the
 * customer pays, the webhook cancels the scheduled send (the returned
 * email id is stored on Order.abandonedEmailId); if they bailed on the
 * Stripe page, this lands a couple of hours later with a one-click
 * "complete payment" link back to their order page.
 *
 * Transactional, not marketing: it concerns an order the customer
 * initiated minutes earlier — no unsubscribe machinery required.
 */
export async function sendAbandonedCheckoutEmail(params: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalUsd: number;
  /** Tokened /order/<n> URL — the page shows a "Complete payment" button. */
  payUrl: string;
  /** ISO 8601 — when Resend should deliver it. */
  scheduledAt: string;
  locale?: string | null;
}): Promise<string | null> {
  const t = await buildT(params.locale);
  const html = baseTemplate(
    t,
    `
    <h1 style="font-size:22px;font-weight:700;margin:0 0 8px;">${t("email.abandH1")}</h1>
    <p style="color:#aaa;font-size:14px;margin:0 0 24px;line-height:1.6;">${t("email.abandP", { name: escapeHtml(params.customerName) })}</p>
    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:20px;margin-bottom:20px;">
      <div style="color:#8a8a8a;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">${t("email.orderNumberLabel")}</div>
      <div style="color:#D4A54A;font-size:18px;font-weight:700;margin-top:6px;">${params.orderNumber}</div>
      <div style="color:#8a8a8a;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin-top:14px;">${t("email.totalLabel")}</div>
      <div style="color:#F0ECE5;font-size:16px;font-weight:600;margin-top:4px;">$${params.totalUsd.toFixed(2)}</div>
    </div>
    <div style="text-align:center;margin:28px 0;">
      <a href="${params.payUrl}" style="display:inline-block;background:linear-gradient(to right,#D4A54A,#E5BC5F);color:#0F0F0F;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;">${t("email.abandCta")}</a>
    </div>
    <p style="color:#8a8a8a;font-size:12px;margin:0;text-align:center;line-height:1.6;">${t("email.abandFoot")}</p>
  `,
  );

  return send({
    to: params.customerEmail,
    subject: t("email.abandSubject", { orderNumber: params.orderNumber }),
    html,
    scheduledAt: params.scheduledAt,
  });
}
