import "server-only";
import { send, siteUrl } from "../transport";
import { baseTemplate, buildT, escapeHtml } from "./base";

/**
 * Thank-you email sent when the operator approves a review that came
 * with a contact email. Carries the auto-generated one-shot promo code.
 */
export async function sendReviewThanksEmail(params: {
  customerName: string;
  customerEmail: string;
  promoCode: string;
  discountPercent: number;
  /** Days until the code expires — rendered in the email copy. */
  validDays: number;
  /** Originating order's storefront locale — the customer's language. */
  locale?: string | null;
}): Promise<void> {
  const t = await buildT(params.locale);
  const html = baseTemplate(
    t,
    `
    <h1 style="font-size:22px;font-weight:700;margin:0 0 8px;">${t("email.revThanksH1")}</h1>
    <p style="color:#aaa;font-size:14px;margin:0 0 20px;line-height:1.6;">${t("email.revThanksP", { name: escapeHtml(params.customerName), percent: String(params.discountPercent) })}</p>
    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:22px;margin-bottom:16px;text-align:center;">
      <div style="color:#8a8a8a;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">${t("email.revThanksCodeLabel")}</div>
      <div style="color:#D4A54A;font-size:24px;font-weight:700;margin-top:8px;font-family:monospace;letter-spacing:0.08em;">${params.promoCode}</div>
    </div>
    <p style="color:#8a8a8a;font-size:12px;margin:0 0 24px;text-align:center;line-height:1.6;">${t("email.revThanksTerms", { days: String(params.validDays) })}</p>
    <div style="text-align:center;">
      <a href="${siteUrl}/catalog" style="color:#D4A54A;font-size:13px;">${t("email.revThanksCta")}</a>
    </div>
  `,
  );

  await send({
    to: params.customerEmail,
    subject: t("email.revThanksSubject", {
      percent: String(params.discountPercent),
    }),
    html,
  });
}
