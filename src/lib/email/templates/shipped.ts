import "server-only";
import { send, orderUrl } from "../transport";
import { baseTemplate, buildT, escapeHtml } from "./base";

export async function sendShippedEmail(params: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  trackingNumber: string;
  orderToken?: string;
}): Promise<void> {
  const t = await buildT();
  const html = baseTemplate(
    t,
    `
    <h1 style="font-size:22px;font-weight:700;margin:0 0 8px;">${t("email.shipH1")}</h1>
    <p style="color:#aaa;font-size:14px;margin:0 0 24px;">${t("email.shipP", { name: escapeHtml(params.customerName) })}</p>
    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:20px;margin-bottom:20px;">
      <div style="color:#8a8a8a;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">${t("email.shipTrackingLabel")}</div>
      <div style="color:#D4A54A;font-size:18px;font-weight:700;margin-top:6px;font-family:monospace;">${params.trackingNumber}</div>
    </div>
    <div style="text-align:center;">
      <a href="${orderUrl(params.orderNumber, params.orderToken)}" style="color:#D4A54A;font-size:13px;">${t("email.shipOrderLink", { orderNumber: params.orderNumber })}</a>
    </div>
  `,
  );

  await send({
    to: params.customerEmail,
    subject: t("email.shipSubject", {
      orderNumber: params.orderNumber,
      tracking: params.trackingNumber,
    }),
    html,
  });
}
