import "server-only";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromAddress =
  process.env.EMAIL_FROM ?? "EliteCarMats <onboarding@resend.dev>";

const resend = apiKey ? new Resend(apiKey) : null;

export const ownerEmail = process.env.OWNER_EMAIL ?? "info@elitecarmats.us";
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitecarmats.us";

/**
 * Thin Resend wrapper. Logs (rather than throws) on failure — callers
 * generally treat email send as fire-and-forget so a Resend outage doesn't
 * block an order from being recorded.
 */
export async function send({
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
    console.log(
      `[email:skipped] RESEND_API_KEY not set. Would send "${subject}" to ${to}`,
    );
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

/**
 * Build a per-order URL embedding the HMAC token. Customer-facing emails
 * always include the token; without it the recipient gets bounced to /track.
 */
export function orderUrl(orderNumber: string, token?: string): string {
  const base = `${siteUrl}/order/${encodeURIComponent(orderNumber)}`;
  return token ? `${base}?t=${encodeURIComponent(token)}` : base;
}
