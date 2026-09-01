import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { verifyUnsubscribeToken } from "@/lib/security/unsubscribe-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One-click newsletter unsubscribe (CAN-SPAM opt-out).
 *
 * GET renders a tiny confirmation page for humans clicking the email
 * footer link; POST serves RFC 8058 List-Unsubscribe=One-Click, which
 * Gmail/Yahoo trigger without any page load. Both paths are idempotent
 * and token-gated (HMAC of the email) so nobody can mass-unsubscribe
 * other people by guessing addresses.
 */

async function removeSubscriber(email: string): Promise<void> {
  try {
    await prisma.newsletterSubscriber.deleteMany({ where: { email } });
  } catch (err) {
    // Missing table on a fresh DB — nothing to unsubscribe from.
    console.error("[newsletter:unsubscribe] delete failed:", err);
  }
}

function parseParams(url: string): { email: string; token: string | null } {
  const u = new URL(url);
  return {
    email: (u.searchParams.get("e") ?? "").trim().toLowerCase(),
    token: u.searchParams.get("t"),
  };
}

type PageKind = "confirm" | "done" | "invalid";

function unsubscribePage(kind: PageKind): NextResponse {
  const title =
    kind === "confirm"
      ? "Unsubscribe from our emails?"
      : kind === "done"
        ? "You're unsubscribed"
        : "Invalid unsubscribe link";
  const body =
    kind === "confirm"
      ? "Click the button below to stop receiving marketing emails from Elite Car Mats. Order and shipping notifications are unaffected."
      : kind === "done"
        ? "You won't receive any more marketing emails from Elite Car Mats. Order and shipping notifications are unaffected."
        : "This unsubscribe link is invalid or incomplete. Please use the link from the bottom of our email, or contact info@elitecarmats.us.";
  // GET must not mutate: corporate link scanners (Outlook Safe Links,
  // Proofpoint, AV sandboxes) prefetch every URL in a delivered email
  // with the valid token attached — a mutating GET would silently
  // unsubscribe those readers. The form re-POSTs to the same URL (query
  // string carries e+t), which is also the RFC 8058 one-click endpoint.
  const confirmForm =
    kind === "confirm"
      ? `<form method="post" style="margin-top:28px;">
      <button type="submit" style="background:#D4A54A;color:#0F0F0F;border:0;border-radius:8px;padding:12px 28px;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;">Confirm unsubscribe</button>
    </form>`
      : "";
  return new NextResponse(
    `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>${title} — Elite Car Mats</title></head>
<body style="margin:0;background:#0F0F0F;color:#F0ECE5;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:80px 24px;text-align:center;">
    <div style="font-size:20px;font-weight:700;letter-spacing:0.15em;color:#D4A54A;">ELITE CAR MATS</div>
    <h1 style="font-size:22px;margin-top:32px;">${title}</h1>
    <p style="color:#a09888;font-size:14px;line-height:1.6;">${body}</p>${confirmForm}
    <a href="/" style="display:inline-block;margin-top:24px;color:#D4A54A;font-size:13px;">elitecarmats.us</a>
  </div>
</body></html>`,
    {
      status: kind === "invalid" ? 400 : 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
}

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const limit = await rateLimit(`unsubscribe:${ip}`);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }
  const { email, token } = parseParams(request.url);
  if (!email || !verifyUnsubscribeToken(email, token)) {
    return unsubscribePage("invalid");
  }
  // Render-only — the actual removal happens on the form's POST.
  return unsubscribePage("confirm");
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = await rateLimit(`unsubscribe:${ip}`);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }
  const { email, token } = parseParams(request.url);
  if (!email || !verifyUnsubscribeToken(email, token)) {
    return NextResponse.json({ error: "Invalid link" }, { status: 400 });
  }
  await removeSubscriber(email);
  // Humans arrive here from the GET confirmation form — give them the
  // branded "done" page; RFC 8058 robots don't render the response.
  const accepts = request.headers.get("accept") ?? "";
  if (accepts.includes("text/html")) {
    return unsubscribePage("done");
  }
  return NextResponse.json({ ok: true });
}
