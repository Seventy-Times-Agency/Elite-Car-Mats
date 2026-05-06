import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin, checkAdminCsrf } from "@/lib/security/auth";
import { postUpdateSchema } from "@/lib/validations/post";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, ctx: Ctx) {
  if (!checkAdminCsrf(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = postUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const d = parsed.data;

  // Pluck explicitly — never spread parsed.data into Prisma.update.data
  // (house rule: keeps any future schema-only fields from leaking in).
  const data: Record<string, unknown> = {};
  if (d.slug !== undefined) data.slug = d.slug;
  if (d.title !== undefined) data.title = d.title;
  if (d.excerpt !== undefined) data.excerpt = d.excerpt;
  if (d.content !== undefined) data.content = d.content;
  if (d.coverImage !== undefined) data.coverImage = d.coverImage ?? null;
  if (d.locale !== undefined) data.locale = d.locale ?? null;
  if (d.published !== undefined) {
    data.published = d.published;
    // Stamp publishedAt the first time something flips to published.
    // If the post is being unpublished we leave the previous timestamp
    // alone — useful as an audit trail of when it last went live.
    if (d.published) {
      const existing = await prisma.post.findUnique({
        where: { id },
        select: { publishedAt: true },
      });
      if (!existing) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }
      if (!existing.publishedAt) data.publishedAt = new Date();
    }
  }

  try {
    const post = await prisma.post.update({
      where: { id },
      data,
    });
    return NextResponse.json({ post });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "error";
    if (msg.includes("Record to update not found")) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (msg.includes("Unique")) {
      return NextResponse.json({ error: "slug_exists" }, { status: 409 });
    }
    console.error("[admin:blog:update]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function DELETE(request: Request, ctx: Ctx) {
  if (!checkAdminCsrf(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "error";
    if (msg.includes("Record to delete does not exist")) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    console.error("[admin:blog:delete]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
