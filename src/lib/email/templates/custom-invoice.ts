import "server-only";
import { send } from "../transport";
import { baseTemplate, buildT, escapeHtml } from "./base";

/**
 * Branded email carrying the Stripe hosted-invoice link for a custom
 * order. Sent when the admin issues an invoice after the master has
 * agreed a price with the customer on the phone. The Stripe page
 * handles the actual payment + receipt; this email is the touchpoint
 * that keeps the communication on-brand (Stripe's own invoice email is
 * deliberately NOT sent).
 */
export async function sendCustomInvoiceEmail(params: {
  customerName: string;
  customerEmail: string;
  /** "Make Model Year" description of the car the quote is for. */
  car: string;
  /** Agreed price in whole USD. */
  amountUsd: number;
  /** Stripe hosted invoice URL. */
  invoiceUrl: string;
  /** Days until the invoice is due — rendered in the copy. */
  dueDays: number;
  /** Custom-order request's storefront locale — the customer's language. */
  locale?: string | null;
}): Promise<void> {
  const t = await buildT(params.locale);
  const amount = `$${params.amountUsd.toFixed(2)}`;

  const html = baseTemplate(
    t,
    `
    <h1 style="font-size:22px;font-weight:700;margin:0 0 8px;">${t("email.invH1")}</h1>
    <p style="color:#aaa;font-size:14px;margin:0 0 24px;line-height:1.6;">${t("email.invP", { name: escapeHtml(params.customerName), car: escapeHtml(params.car) })}</p>
    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:20px;margin-bottom:20px;">
      <div style="color:#8a8a8a;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">${t("email.invAmountLabel")}</div>
      <div style="color:#D4A54A;font-size:24px;font-weight:700;margin-top:6px;">${amount}</div>
    </div>
    <div style="text-align:center;margin:28px 0;">
      <a href="${params.invoiceUrl}" style="display:inline-block;background:linear-gradient(to right,#D4A54A,#E5BC5F);color:#0F0F0F;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;">${t("email.invCta")}</a>
    </div>
    <p style="color:#8a8a8a;font-size:12px;margin:0;text-align:center;line-height:1.6;">${t("email.invNote", { days: String(params.dueDays) })}</p>
  `,
  );

  await send({
    to: params.customerEmail,
    subject: t("email.invSubject", { car: params.car }),
    html,
  });
}
