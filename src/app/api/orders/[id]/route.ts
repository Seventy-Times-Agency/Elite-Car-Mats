import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
