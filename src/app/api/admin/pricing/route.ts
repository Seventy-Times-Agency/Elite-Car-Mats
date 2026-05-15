import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin, checkAdminCsrf } from "@/lib/security/auth";
import { priceOverrideUpsertSchema } from "@/lib/validations/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await prisma.matSetPriceOverride.findMany({
    select: {
      profile: true,
      matSet: true,
      price: true,
      updatedAt: true,
    },
  });
  return NextResponse.json({
    overrides: rows.map((r) => ({
      profile: r.profile,
      matSet: r.matSet,
      price: Number(r.price ?? 0),
      updatedAt: r.updatedAt.toISOString(),
    })),
  });
}

/**
 * Upsert / delete a single (profile, matSet) override row.
 *
 *   { profile, matSet, price: 129 }   → set / replace the override
 *   { profile, matSet, price: null }  → drop the override (back to code default)
 */
export async function POST(request: Request) {
  if (!checkAdminCsrf(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = priceOverrideUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const { profile, matSet, price } = parsed.data;

  try {
    if (price === null || price === undefined) {
      await prisma.matSetPriceOverride.deleteMany({
        where: { profile, matSet },
      });
      revalidateTag("pricing", "default");
      return NextResponse.json({ ok: true, action: "cleared" });
    }
    const row = await prisma.matSetPriceOverride.upsert({
      where: { profile_matSet: { profile, matSet } },
      create: { profile, matSet, price },
      update: { price },
    });
    revalidateTag("pricing", "default");
    return NextResponse.json({
      ok: true,
      action: "saved",
      override: {
        profile: row.profile,
        matSet: row.matSet,
        price: Number(row.price ?? 0),
        updatedAt: row.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("[admin:pricing:save]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
