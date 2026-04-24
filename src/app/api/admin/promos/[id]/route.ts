import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  code: z.string().min(2).max(64).optional(),
  discount: z.number().int().min(1).max(100).optional(),
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
  if (d.code !== undefined) data.code = d.code.trim().toUpperCase();
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
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
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
