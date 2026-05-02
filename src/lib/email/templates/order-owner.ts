import "server-only";
import { formatPrice } from "@/lib/pricing";
import { send, ownerEmail, siteUrl } from "../transport";
import {
  baseTemplate,
  buildT,
  itemsTable,
  type OrderEmailData,
} from "./base";

export async function sendOwnerOrderEmail(
  data: OrderEmailData,
): Promise<void> {
  const t = await buildT();
  const html = baseTemplate(
    t,
    `
    <h1 style="font-size:20px;font-weight:700;margin:0 0 20px;">${t("email.ownerH1", { orderNumber: data.orderNumber })}</h1>
    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:20px;margin-bottom:20px;">
      <div style="color:#F0ECE5;font-weight:600;">${data.customerName}</div>
      <div style="color:#aaa;font-size:13px;margin-top:4px;">
        <a href="mailto:${data.customerEmail}" style="color:#D4A54A;text-decoration:none;">${data.customerEmail}</a> ·
        <a href="tel:${data.phone}" style="color:#D4A54A;text-decoration:none;">${data.phone}</a>
      </div>
      <div style="color:#aaa;font-size:13px;margin-top:8px;">
        ${data.address}${data.city ? `, ${data.city}` : ""}${data.state ? `, ${data.state}` : ""}${data.zip ? ` ${data.zip}` : ""}
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;">
      ${itemsTable(t, data.items)}
      <tr>
        <td style="padding-top:16px;color:#8a8a8a;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">${t("email.totalLabel")}</td>
        <td style="padding-top:16px;text-align:right;color:#D4A54A;font-size:20px;font-weight:700;">${formatPrice(data.total)}</td>
      </tr>
    </table>
    <div style="text-align:center;margin-top:32px;">
      <a href="${siteUrl}/admin/orders" style="color:#D4A54A;font-size:13px;">${t("email.ownerOpenAdmin")}</a>
    </div>
  `,
  );

  await send({
    to: ownerEmail,
    subject: t("email.ownerSubject", {
      orderNumber: data.orderNumber,
      total: formatPrice(data.total),
    }),
    html,
    replyTo: data.customerEmail,
  });
}
