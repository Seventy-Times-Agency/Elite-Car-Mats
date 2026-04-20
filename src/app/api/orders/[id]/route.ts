import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { sendShippedEmail } from "@/lib/email";

const updateSchema = z.object({
  status: z
    .enum(["PENDING", "CONFIRMED", "PRODUCTION", "SHIPPED", "DELIVERED", "CANCELLED"])
    .optional(),
  trackingNumber: z.string().trim().max(80).optional().nullable(),
});

export async function GET(
  _request: Request,
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
    },
  });
  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const { status, trackingNumber } = parsed.data;
  const data: Record<string, unknown> = {};
  if (status !== undefined) data.status = status;
  if (trackingNumber !== undefined) data.trackingNumber = trackingNumber || null;

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
    });
  }

  return NextResponse.json(updated);
}
