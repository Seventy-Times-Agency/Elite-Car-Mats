import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { ensureSchema } from "@/lib/db-setup";

const apiKey = process.env.RESEND_API_KEY;
const fromAddress =
  process.env.EMAIL_FROM ?? "Elite Car Mats <onboarding@resend.dev>";
const ownerEmail = process.env.OWNER_EMAIL ?? "info@elitecarmats.us";
const resend = apiKey ? new Resend(apiKey) : null;

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  phone: z.string().trim().min(5).max(40),
  make: z.string().trim().min(1).max(60),
  model: z.string().trim().min(1).max(100),
  year: z.string().trim().min(2).max(10),
  bodyType: z.string().trim().max(60).optional().default(""),
  matSet: z.string().trim().max(60).optional().default(""),
  notes: z.string().trim().max(2000).optional().default(""),
  locale: z.string().trim().max(5).optional().default("ru"),
});

function escape(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  await ensureSchema();
  const ip = getClientIp(request);
  const limit = rateLimit(`custom:${ip}`);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const d = parsed.data;

  try {
    await prisma.customOrderRequest.create({
      data: {
        name: d.name,
        email: d.email,
        phone: d.phone,
        make: d.make,
        model: d.model,
        year: d.year,
        bodyType: d.bodyType || null,
        matSet: d.matSet || null,
        notes: d.notes || null,
        locale: d.locale || null,
      },
    });
  } catch (err) {
    console.error("[custom-order:db-save-failed]", err);
    // We still want the owner to get an email even if the DB write fails.
  }

  const html = `
<!DOCTYPE html>
<html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#0F0F0F;color:#F0ECE5;padding:24px;">
  <div style="max-width:560px;margin:0 auto;">
    <div style="color:#D4A54A;font-weight:700;letter-spacing:0.12em;font-size:13px;margin-bottom:18px;">ELITE CAR MATS · CUSTOM ORDER</div>
    <h1 style="font-size:20px;margin:0 0 16px;">${escape(d.make)} ${escape(d.model)} ${escape(d.year)}</h1>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <tr><td style="color:#8a8a8a;padding:8px 0;">Name</td><td style="padding:8px 0;">${escape(d.name)}</td></tr>
      <tr><td style="color:#8a8a8a;padding:8px 0;">Email</td><td style="padding:8px 0;"><a href="mailto:${escape(d.email)}" style="color:#D4A54A;">${escape(d.email)}</a></td></tr>
      <tr><td style="color:#8a8a8a;padding:8px 0;">Phone</td><td style="padding:8px 0;"><a href="tel:${escape(d.phone)}" style="color:#D4A54A;">${escape(d.phone)}</a></td></tr>
      <tr><td style="color:#8a8a8a;padding:8px 0;border-top:1px solid #222;">Make</td><td style="padding:8px 0;border-top:1px solid #222;">${escape(d.make)}</td></tr>
      <tr><td style="color:#8a8a8a;padding:8px 0;">Model</td><td style="padding:8px 0;">${escape(d.model)}</td></tr>
      <tr><td style="color:#8a8a8a;padding:8px 0;">Year</td><td style="padding:8px 0;">${escape(d.year)}</td></tr>
      ${d.bodyType ? `<tr><td style="color:#8a8a8a;padding:8px 0;">Body</td><td style="padding:8px 0;">${escape(d.bodyType)}</td></tr>` : ""}
      ${d.matSet ? `<tr><td style="color:#8a8a8a;padding:8px 0;">Set</td><td style="padding:8px 0;">${escape(d.matSet)}</td></tr>` : ""}
      ${d.notes ? `<tr><td style="color:#8a8a8a;padding:8px 0;border-top:1px solid #222;vertical-align:top;">Notes</td><td style="padding:8px 0;border-top:1px solid #222;white-space:pre-wrap;">${escape(d.notes)}</td></tr>` : ""}
      <tr><td style="color:#8a8a8a;padding:8px 0;border-top:1px solid #222;">Locale</td><td style="padding:8px 0;border-top:1px solid #222;">${escape(d.locale)}</td></tr>
    </table>
  </div>
</body></html>`;

  if (!resend) {
    console.log("[custom-order:skipped] RESEND_API_KEY not set", d);
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const { error } = await resend.emails.send({
      from: fromAddress,
      to: ownerEmail,
      replyTo: d.email,
      subject: `Custom order — ${d.make} ${d.model} ${d.year}`,
      html,
    });
    if (error) {
      console.error("[custom-order:error]", error);
      return NextResponse.json({ error: "Send failed" }, { status: 502 });
    }
  } catch (err) {
    console.error("[custom-order:exception]", err);
    return NextResponse.json({ error: "Send failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
