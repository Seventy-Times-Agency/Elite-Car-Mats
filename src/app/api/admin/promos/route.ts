import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  code: z.string().min(2).max(64),
  discount: z.number().int().min(1).max(100),
  description: z.string().max(200).optional().nullable(),
  maxUses: z.number().int().positive().optional().nullable(),
  minOrder: z.number().nonnegative().optional().nullable(),
  active: z.boolean().optional().default(true),
  expiresAt: z.string().datetime().optional().nullable(),
});

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const promos = await prisma.promoCode.findMany({
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({
    promos: promos.map((p) => ({
      ...p,
      minOrder: p.minOrder ? Number(p.minOrder) : null,
    })),
  });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data = parsed.data;
  try {
    const promo = await prisma.promoCode.create({
      data: {
        code: data.code.trim().toUpperCase(),
        discount: data.discount,
        description: data.description ?? null,
        maxUses: data.maxUses ?? null,
        minOrder: data.minOrder ?? null,
        active: data.active,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
    return NextResponse.json({ promo });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "error";
    if (msg.includes("Unique")) {
      return NextResponse.json({ error: "code_exists" }, { status: 409 });
    }
    console.error("[admin:promos:create]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
