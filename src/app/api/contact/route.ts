import { NextResponse } from "next/server";
import { z } from "zod";
import { sendContactEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(5).max(4000),
});

export async function POST(request: Request) {
  // 3 messages per 10 minutes per IP — stops form-spam without blocking a
  // real visitor who sent two questions back-to-back.
  const ip = getClientIp(request);
  const rl = rateLimit(`contact:${ip}`, { windowMs: 10 * 60_000, max: 3 });
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many messages. Try again later." },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  const parsed = Body.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid input" },
      { status: 400 },
    );
  }

  try {
    await sendContactEmail(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/contact] send failed:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to send" },
      { status: 500 },
    );
  }
}
