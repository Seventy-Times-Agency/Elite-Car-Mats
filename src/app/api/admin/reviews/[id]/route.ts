import { NextResponse, after } from "next/server";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin, checkAdminCsrf } from "@/lib/security/auth";
import { sendReviewThanksEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  approved: z.boolean().optional(),
  verified: z.boolean().optional(),
  customerName: z.string().trim().min(1).max(120).optional(),
  carModel: z.string().trim().min(1).max(160).optional(),
  text: z.string().trim().min(1).max(3000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

/** Thank-you promo issued on first approval: one-shot, expiring. */
const REVIEW_PROMO_DISCOUNT = 10; // percent
const REVIEW_PROMO_DAYS = 60;

// Unambiguous alphabet — no 0/O or 1/I to squint at.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateReviewCode(): string {
  const bytes = randomBytes(5);
  let s = "";
  for (const b of bytes) s += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return `REV-${s}`;
}

/**
 * Mint the one-shot thank-you promo for a just-approved review and email
 * it to the reviewer. Idempotent via Review.promoCode — a re-approve
 * (toggle off/on) sees the recorded code and does nothing. Failures are
 * logged, never thrown: approval itself must not roll back over a promo.
 */
async function issueReviewPromo(reviewId: string): Promise<void> {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: {
      id: true,
      customerName: true,
      email: true,
      promoCode: true,
      approved: true,
      orderId: true,
    },
  });
  if (!review?.approved || !review.email || review.promoCode) return;

  // Verified-buyer reviews carry the order — reuse its locale so the
  // thank-you lands in the customer's language, not the admin's.
  let orderLocale: string | null = null;
  if (review.orderId) {
    const order = await prisma.order.findUnique({
      where: { id: review.orderId },
      select: { locale: true },
    });
    orderLocale = order?.locale ?? null;
  }

  let code = generateReviewCode();
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await prisma.promoCode.create({
        data: {
          code,
          discount: REVIEW_PROMO_DISCOUNT,
          description: `Review thank-you (${review.customerName})`,
          maxUses: 1,
          active: true,
          expiresAt: new Date(Date.now() + REVIEW_PROMO_DAYS * 86_400_000),
        },
      });
      break;
    } catch (err) {
      // Unique collision on `code` — roll a new one and retry.
      const e = err as { code?: string };
      if (e.code === "P2002" && attempt < 2) {
        code = generateReviewCode();
        continue;
      }
      console.error("[admin:reviews] promo create failed:", err);
      return;
    }
  }

  await prisma.review.update({
    where: { id: review.id },
    data: { promoCode: code },
  });

  await sendReviewThanksEmail({
    customerName: review.customerName,
    customerEmail: review.email,
    promoCode: code,
    discountPercent: REVIEW_PROMO_DISCOUNT,
    validDays: REVIEW_PROMO_DAYS,
    locale: orderLocale,
  });
  console.log(
    `[admin:reviews] review ${review.id} approved → promo ${code} sent`,
  );
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!checkAdminCsrf(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  // Explicit field whitelist — never `data: parsed.data`.
  const data: Record<string, unknown> = {};
  if (parsed.data.approved !== undefined) data.approved = parsed.data.approved;
  if (parsed.data.verified !== undefined) data.verified = parsed.data.verified;
  if (parsed.data.customerName !== undefined)
    data.customerName = parsed.data.customerName;
  if (parsed.data.carModel !== undefined) data.carModel = parsed.data.carModel;
  if (parsed.data.text !== undefined) data.text = parsed.data.text;
  if (parsed.data.rating !== undefined) data.rating = parsed.data.rating;

  try {
    const review = await prisma.review.update({ where: { id }, data });
    // First approval mints the thank-you promo + email. Deferred so a
    // slow Resend call doesn't hold up the admin UI; issueReviewPromo
    // re-checks state and is a no-op on repeat approvals.
    if (parsed.data.approved === true) {
      after(async () => {
        await issueReviewPromo(id).catch((err) => {
          console.error("[admin:reviews] promo issue failed:", err);
        });
      });
    }
    return NextResponse.json({ review });
  } catch (err) {
    console.error("[admin:reviews:update]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!checkAdminCsrf(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  try {
    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin:reviews:delete]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
