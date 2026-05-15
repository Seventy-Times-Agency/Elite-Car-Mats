import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { validatePromoCode } from "@/lib/promo";
import { ensureSchema } from "@/lib/db/setup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  code: z.string().min(1).max(64),
  subtotal: z.number().nonnegative(),
});

export async function POST(request: Request) {
  await ensureSchema();
  const ip = getClientIp(request);
  const limit = await rateLimit(`promo:${ip}`);
  if (!limit.ok) {
    return NextResponse.json(
      { valid: false, error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { valid: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { valid: false, error: "validation" },
      { status: 400 },
    );
  }

  // Per-code throttle: 50 attempts per code per hour, summed across IPs.
  // Stops a botnet from brute-forcing a specific promo code by spreading
  // out the per-IP cap. Normalised to lowercase so casing variants don't
  // each get their own bucket.
  const normalisedCode = parsed.data.code.trim().toLowerCase();
  const codeLimit = await rateLimit(`promo:code:${normalisedCode}`, {
    windowMs: 60 * 60 * 1000,
    max: 50,
  });
  if (!codeLimit.ok) {
    return NextResponse.json(
      { valid: false, error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(codeLimit.retryAfter) } },
    );
  }

  const result = await validatePromoCode(parsed.data.code, parsed.data.subtotal);
  return NextResponse.json(result);
}
