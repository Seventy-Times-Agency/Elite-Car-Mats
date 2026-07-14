import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin, checkAdminCsrf } from "@/lib/security/auth";
import { sendShippedEmail, sendReviewInviteEmail } from "@/lib/email";
import { verifyOrderToken, signOrderToken } from "@/lib/security/order-token";

/** Delay before the post-delivery review invite lands (Resend holds it). */
const REVIEW_INVITE_DELAY_MS = 24 * 60 * 60 * 1000; // 1 day

const updateSchema = z.object({
  status: z
    .enum(["PENDING", "CONFIRMED", "PRODUCTION", "SHIPPED", "DELIVERED", "CANCELLED"])
    .optional(),
  trackingNumber: z.string().trim().max(80).optional().nullable(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id }, { orderNumber: id }],
    },
    include: {
      items: {
        include: {
          product: { include: { model: { include: { brand: true } } } },
          color: true,
          edgeColor: true,
          badge: true,
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Authorization: the requester must either be a logged-in admin OR
  // present a valid HMAC token signed against the order's id.
  const url = new URL(request.url);
  const token = url.searchParams.get("t");
  const tokenOk = verifyOrderToken(order.id, token);
  const adminOk = !tokenOk && (await requireAdmin());
  if (!tokenOk && !adminOk) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    customerName: order.customerName,
    email: order.email,
    phone: order.phone,
    address: order.address,
    city: order.city,
    state: order.state,
    zip: order.zip,
    total: Number(order.total ?? 0),
    trackingNumber: order.trackingNumber,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((i) => ({
      id: i.id,
      brandName: i.product.model.brand.name,
      modelName: i.product.model.name,
      matSet: i.product.matSet,
      year: i.year ?? null,
      color: { id: i.color.id, name: i.color.name, hex: i.color.hex },
      edgeColor: { id: i.edgeColor.id, name: i.edgeColor.name, hex: i.edgeColor.hex },
      badge: i.badge ? { id: i.badge.id, brandName: i.badge.brandName } : null,
      quantity: i.quantity,
      price: Number(i.price ?? 0),
    })),
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!checkAdminCsrf(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const existing = await prisma.order.findFirst({
    where: { OR: [{ id }, { orderNumber: id }] },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      trackingNumber: true,
      customerName: true,
      email: true,
      reviewInviteSentAt: true,
    },
  });
  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const { status, trackingNumber } = parsed.data;
  const data: Record<string, unknown> = {};
  if (status !== undefined) data.status = status;
  if (trackingNumber !== undefined) data.trackingNumber = trackingNumber || null;
  if (status === "DELIVERED" && existing.status !== "DELIVERED") {
    data.deliveredAt = new Date();
  }

  const updated = await prisma.order.update({
    where: { id: existing.id },
    data,
    select: {
      id: true,
      orderNumber: true,
      status: true,
      trackingNumber: true,
    },
  });

  const justShipped =
    status === "SHIPPED" &&
    existing.status !== "SHIPPED" &&
    !!updated.trackingNumber;

  if (justShipped) {
    await sendShippedEmail({
      orderNumber: updated.orderNumber,
      customerName: existing.customerName,
      customerEmail: existing.email,
      trackingNumber: updated.trackingNumber!,
      orderToken: signOrderToken(updated.id),
    });
  }

  // First transition into DELIVERED schedules the review invite for
  // ~1 day out (Resend `scheduledAt` — no cron). reviewInviteSentAt
  // guards re-sends when the status is toggled back and forth.
  const justDelivered =
    status === "DELIVERED" &&
    existing.status !== "DELIVERED" &&
    !existing.reviewInviteSentAt;

  if (justDelivered) {
    await sendReviewInviteEmail({
      orderId: updated.id,
      orderNumber: updated.orderNumber,
      customerName: existing.customerName,
      customerEmail: existing.email,
      scheduledAt: new Date(Date.now() + REVIEW_INVITE_DELAY_MS).toISOString(),
    });
    await prisma.order.update({
      where: { id: updated.id },
      data: { reviewInviteSentAt: new Date() },
    });
  }

  return NextResponse.json(updated);
}

/**
 * Permanently delete an order and its items (OrderItem cascades on the
 * FK). Used by the operator to purge test orders before launch and to
 * honor customer data-deletion requests — unlike CANCELLED, the order
 * disappears from history and revenue stats entirely.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!checkAdminCsrf(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.order.findFirst({
    where: { OR: [{ id }, { orderNumber: id }] },
    select: { id: true, orderNumber: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  await prisma.order.delete({ where: { id: existing.id } });
  console.log(`[admin] order ${existing.orderNumber} deleted permanently`);
  return NextResponse.json({ ok: true, orderNumber: existing.orderNumber });
}
