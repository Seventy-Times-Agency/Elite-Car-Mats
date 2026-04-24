import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { validatePromoCode } from "@/lib/promo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  code: z.string().min(1).max(64),
  subtotal: z.number().nonnegative(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`promo:${ip}`);
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

  const result = await validatePromoCode(parsed.data.code, parsed.data.subtotal);
  return NextResponse.json(result);
}
