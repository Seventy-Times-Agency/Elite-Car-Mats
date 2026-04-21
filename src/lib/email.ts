import { Resend } from "resend";
import { formatPrice } from "@/lib/pricing";

const apiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.EMAIL_FROM ?? "EliteCarMats <onboarding@resend.dev>";
const ownerEmail = process.env.OWNER_EMAIL ?? "info@elitecarmats.us";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitecarmats.us";

const resend = apiKey ? new Resend(apiKey) : null;

const MAT_SET_LABEL: Record<string, string> = {
  front: "Передние",
  full: "Полный комплект",
  cargo: "Багажник",
  "full-cargo": "Полный + Багажник",
  FRONT: "Передние",
  FULL: "Полный комплект",
  CARGO: "Багажник",
  FULL_CARGO: "Полный + Багажник",
};

interface OrderEmailItem {
  brandName: string;
  modelName: string;
  matSet: string;
  colorName: string;
  edgeColorName: string;
  badgeName?: string | null;
  quantity: number;
  unitPrice: number;
}

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  total: number;
  items: OrderEmailItem[];
}

function itemsTable(items: OrderEmailItem[]): string {
  const rows = items
    .map(
      (i) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #222;">
            <div style="color:#F0ECE5;font-weight:500;">${i.brandName} ${i.modelName}</div>
            <div style="color:#8a8a8a;font-size:12px;margin-top:4px;">
              ${MAT_SET_LABEL[i.matSet] ?? i.matSet} · ${i.colorName} / ${i.edgeColorName}
              ${i.badgeName ? ` · ${i.badgeName}` : ""} · ×${i.quantity}
            </div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #222;text-align:right;color:#D4A54A;font-weight:600;white-space:nowrap;">
            ${formatPrice(i.unitPrice * i.quantity)}
          </td>
        </tr>`,
    )
    .join("");
  return rows;
}

function baseTemplate(inner: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>EliteCarMats</title></head>
<body style="margin:0;padding:0;background:#0F0F0F;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#F0ECE5;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:22px;font-weight:700;letter-spacing:0.15em;color:#D4A54A;">ELITE CAR MATS</div>
      <div style="font-size:11px;color:#8a8a8a;letter-spacing:0.2em;margin-top:4px;">PREMIUM EVA MATS</div>
    </div>
    ${inner}
    <div style="margin-top:40px;padding-top:24px;border-top:1px solid #222;text-align:center;color:#8a8a8a;font-size:11px;">
      elitecarmats.us · Rochester, NY
    </div>
  </div>
</body>
</html>`;
}

export async function sendCustomerOrderEmail(data: OrderEmailData): Promise<void> {
  const html = baseTemplate(`
    <h1 style="font-size:22px;font-weight:700;margin:0 0 8px;">Спасибо за заказ, ${data.customerName}!</h1>
    <p style="color:#aaa;font-size:14px;margin:0 0 24px;">
      Ваш заказ принят. Мы свяжемся для подтверждения в ближайшее время.
    </p>
    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:20px;margin-bottom:20px;">
      <div style="color:#8a8a8a;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Номер заказа</div>
      <div style="color:#D4A54A;font-size:18px;font-weight:700;margin-top:6px;">${data.orderNumber}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;">
      ${itemsTable(data.items)}
      <tr>
        <td style="padding-top:16px;color:#8a8a8a;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Итого</td>
        <td style="padding-top:16px;text-align:right;color:#D4A54A;font-size:20px;font-weight:700;">${formatPrice(data.total)}</td>
      </tr>
    </table>
    <div style="text-align:center;margin-top:32px;">
      <a href="${siteUrl}/order/${data.orderNumber}" style="display:inline-block;background:linear-gradient(to right,#D4A54A,#E5BC5F);color:#0F0F0F;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;">Отследить заказ</a>
    </div>
  `);

  await send({
    to: data.customerEmail,
    subject: `Заказ ${data.orderNumber} принят — EliteCarMats`,
    html,
  });
}

export async function sendOwnerOrderEmail(data: OrderEmailData): Promise<void> {
  const html = baseTemplate(`
    <h1 style="font-size:20px;font-weight:700;margin:0 0 20px;">Новый заказ ${data.orderNumber}</h1>
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
      ${itemsTable(data.items)}
      <tr>
        <td style="padding-top:16px;color:#8a8a8a;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Итого</td>
        <td style="padding-top:16px;text-align:right;color:#D4A54A;font-size:20px;font-weight:700;">${formatPrice(data.total)}</td>
      </tr>
    </table>
    <div style="text-align:center;margin-top:32px;">
      <a href="${siteUrl}/admin/orders" style="color:#D4A54A;font-size:13px;">Открыть в админке →</a>
    </div>
  `);

  await send({
    to: ownerEmail,
    subject: `Новый заказ ${data.orderNumber} — ${formatPrice(data.total)}`,
    html,
    replyTo: data.customerEmail,
  });
}

export async function sendShippedEmail(params: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  trackingNumber: string;
}): Promise<void> {
  const html = baseTemplate(`
    <h1 style="font-size:22px;font-weight:700;margin:0 0 8px;">Ваш заказ отправлен</h1>
    <p style="color:#aaa;font-size:14px;margin:0 0 24px;">
      ${params.customerName}, ваши коврики в пути.
    </p>
    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:20px;margin-bottom:20px;">
      <div style="color:#8a8a8a;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Трек-номер</div>
      <div style="color:#D4A54A;font-size:18px;font-weight:700;margin-top:6px;font-family:monospace;">${params.trackingNumber}</div>
    </div>
    <div style="text-align:center;">
      <a href="${siteUrl}/order/${params.orderNumber}" style="color:#D4A54A;font-size:13px;">Детали заказа ${params.orderNumber} →</a>
    </div>
  `);

  await send({
    to: params.customerEmail,
    subject: `Заказ ${params.orderNumber} отправлен — трек ${params.trackingNumber}`,
    html,
  });
}

async function send({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<void> {
  if (!resend) {
    console.log(`[email:skipped] RESEND_API_KEY not set. Would send "${subject}" to ${to}`);
    return;
  }
  try {
    const { error } = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
    if (error) {
      console.error("[email:error]", subject, error);
    }
  } catch (err) {
    console.error("[email:exception]", subject, err);
  }
}
