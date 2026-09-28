import "server-only";
import { send, ownerEmail, siteUrl } from "../transport";
import { baseTemplate, buildT, escapeHtml } from "./base";

/**
 * Owner alert for a critical journal problem (checkout, payment, order
 * creation). Throttled by the journal — at most one per problem per 6h.
 * Plain words first, the raw error underneath for whoever fixes it.
 */
export async function sendProblemAlertEmail(p: {
  id: string;
  area: string;
  message: string;
  context: string;
  count: number;
}): Promise<void> {
  const t = await buildT(process.env.OWNER_LOCALE || "ru");
  const titleKey = `journal.area.${p.area}`;
  const title = t(titleKey) === titleKey ? p.area : t(titleKey);
  const html = baseTemplate(
    t,
    `
    <h1 style="font-size:20px;font-weight:700;margin:0 0 8px;">${escapeHtml(title)}</h1>
    <p style="color:#aaa;font-size:14px;margin:0 0 20px;line-height:1.6;">${t("journal.mailP", { count: p.count })}</p>
    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:16px;margin-bottom:20px;font-family:ui-monospace,Menlo,monospace;font-size:12px;color:#ccc;line-height:1.5;word-break:break-word;">
      ${escapeHtml(p.message)}${p.context ? `<br><span style="color:#8a8a8a;">${escapeHtml(p.context)}</span>` : ""}
    </div>
    <div style="text-align:center;margin-top:24px;">
      <a href="${siteUrl}/admin/journal" style="color:#D4A54A;font-size:13px;">${t("journal.mailOpen")}</a>
    </div>
  `,
  );
  await send({
    to: ownerEmail,
    subject: t("journal.mailSubject", { title }),
    html,
  });
}
