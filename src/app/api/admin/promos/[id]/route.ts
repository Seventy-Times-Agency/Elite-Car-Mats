import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin, checkAdminCsrf } from "@/lib/security/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The code itself is intentionally NOT editable — orders reference the
// promo by its code string, and a rename would orphan that history.
// Recreate under a new name instead.
const patchSchema = z.object({
  // Capped at 99 — a 100% promo makes the order total $0, which Stripe
  // Checkout rejects (min charge $0.50) and locks the customer out of
  // completing payment entirely.
  discount: z.number().int().min(1).max(99).optional(),
  description: z.string().max(200).optional().nullable(),
  maxUses: z.number().int().positive().optional().nullable(),
  minOrder: z.number().nonnegative().optional().nullable(),
  active: z.boolean().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
});

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

  const d = parsed.data;
  const data: Record<string, unknown> = {};
  if (d.discount !== undefined) data.discount = d.discount;
  if (d.description !== undefined) data.description = d.description;
  if (d.maxUses !== undefined) data.maxUses = d.maxUses;
  if (d.minOrder !== undefined) data.minOrder = d.minOrder;
  if (d.active !== undefined) data.active = d.active;
  if (d.expiresAt !== undefined) {
    data.expiresAt = d.expiresAt ? new Date(d.expiresAt) : null;
  }

  try {
    const promo = await prisma.promoCode.update({
      where: { id },
      data,
    });
    return NextResponse.json({ promo });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "error";
    if (msg.includes("Unique")) {
      return NextResponse.json({ error: "code_exists" }, { status: 409 });
    }
    console.error("[admin:promos:update]", err);
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
    await prisma.promoCode.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin:promos:delete]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
