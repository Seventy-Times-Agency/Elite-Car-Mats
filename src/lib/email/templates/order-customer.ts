import "server-only";
import { formatPrice } from "@/lib/pricing";
import { send, orderUrl } from "../transport";
import {
  baseTemplate,
  buildT,
  commentBlock,
  itemsTable,
  type OrderEmailData,
} from "./base";

export async function sendCustomerOrderEmail(
  data: OrderEmailData,
): Promise<void> {
  const t = await buildT();
  const html = baseTemplate(
    t,
    `
    <h1 style="font-size:22px;font-weight:700;margin:0 0 8px;">${t("email.custH1", { name: data.customerName })}</h1>
    <p style="color:#aaa;font-size:14px;margin:0 0 24px;">${t("email.custP")}</p>
    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:20px;margin-bottom:20px;">
      <div style="color:#8a8a8a;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">${t("email.orderNumberLabel")}</div>
      <div style="color:#D4A54A;font-size:18px;font-weight:700;margin-top:6px;">${data.orderNumber}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;">
      ${itemsTable(t, data.items)}
      <tr>
        <td style="padding-top:16px;color:#8a8a8a;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">${t("email.totalLabel")}</td>
        <td style="padding-top:16px;text-align:right;color:#D4A54A;font-size:20px;font-weight:700;">${formatPrice(data.total)}</td>
      </tr>
    </table>
    ${commentBlock(t, data.comment)}
    <div style="text-align:center;margin-top:32px;">
      <a href="${orderUrl(data.orderNumber, data.orderToken)}" style="display:inline-block;background:linear-gradient(to right,#D4A54A,#E5BC5F);color:#0F0F0F;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;">${t("email.custTrackBtn")}</a>
    </div>
  `,
  );

  await send({
    to: data.customerEmail,
    subject: t("email.custSubject", { orderNumber: data.orderNumber }),
    html,
  });
}
