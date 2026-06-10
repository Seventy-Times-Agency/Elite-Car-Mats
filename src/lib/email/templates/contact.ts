import "server-only";
import { send, ownerEmail } from "../transport";
import { baseTemplate, buildT, escapeHtml } from "./base";

export async function sendContactEmail(params: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  const t = await buildT();
  const safe = (s: string) => escapeHtml(s).replace(/\n/g, "<br/>");
  const html = baseTemplate(
    t,
    `
    <h1 style="font-size:20px;font-weight:700;margin:0 0 16px;">${t("email.contactH1")}</h1>
    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:20px;margin-bottom:20px;">
      <div style="color:#F0ECE5;font-weight:600;">${safe(params.name)}</div>
      <div style="color:#aaa;font-size:13px;margin-top:4px;">
        <a href="mailto:${escapeHtml(params.email)}" style="color:#D4A54A;text-decoration:none;">${safe(params.email)}</a>
      </div>
    </div>
    <div style="background:#0F0F0F;border:1px solid #2a2a2a;border-radius:12px;padding:20px;color:#F0ECE5;font-size:14px;line-height:1.6;">
      ${safe(params.message)}
    </div>
  `,
  );
  await send({
    to: ownerEmail,
    subject: t("email.contactSubject", { name: params.name }),
    html,
    replyTo: params.email,
  });
}
