import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin, checkAdminCsrf } from "@/lib/security/auth";
import { brandCreateSchema } from "@/lib/validations/catalog";
import { brands as codeBrands } from "@/data/catalog";
import { resetCatalogSeedCache, mirrorCustomBrandRow } from "@/lib/db/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await prisma.customBrand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { models: true } } },
  });
  return NextResponse.json({
    brands: rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      logo: r.logo,
      popularity: r.popularity,
      categories: r.categories,
      modelsCount: r._count.models,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
  });
}

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
  const parsed = brandCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const d = parsed.data;
  // Block clash with code-based slugs up front — would otherwise
  // silently disappear from the public catalog at merge time.
  if (codeBrands.some((b) => b.slug === d.slug)) {
    return NextResponse.json(
      { error: "slug_reserved_by_code" },
      { status: 409 },
    );
  }
  try {
    const row = await prisma.customBrand.create({
      data: {
        slug: d.slug,
        name: d.name,
        logo: d.logo ?? null,
        popularity: d.popularity ?? null,
        categories: d.categories ?? [],
      },
    });
    revalidateTag("catalog", "default");
    // Force the next /api/orders cold-start to re-mirror this brand into
    // the Brand table so OrderItem.productId FKs resolve for it.
    resetCatalogSeedCache();
    // Mirror into the Brand FK table right now too — the cache reset above
    // only affects THIS lambda; warm /api/orders instances keep their seed
    // cache until recycle and would otherwise 500 on the missing FK row.
    try {
      await mirrorCustomBrandRow({ slug: row.slug, name: row.name, logo: row.logo });
    } catch (err) {
      console.error("[admin:catalog:brand:create] mirror failed:", err);
    }
    return NextResponse.json({ brand: row });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "error";
    if (msg.includes("Unique")) {
      return NextResponse.json({ error: "slug_exists" }, { status: 409 });
    }
    console.error("[admin:catalog:brand:create]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
