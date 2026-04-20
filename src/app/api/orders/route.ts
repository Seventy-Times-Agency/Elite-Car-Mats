import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "@/lib/validations/order";
import { calculateItemUnitPrice, calculateOrderTotal } from "@/lib/pricing";

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ECM-${ts}-${rand}`;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { customer, shipping, items } = parsed.data;

  const total = calculateOrderTotal(
    items.map((i) => ({
      matSet: i.matSet,
      edgeColor: { id: i.edgeColorId },
      badge: i.badgeId ? { id: i.badgeId } : null,
      quantity: i.quantity,
    })),
  );

  try {
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        status: "PENDING",
        customerName: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: shipping.address,
        city: shipping.city || null,
        state: shipping.state || null,
        zip: shipping.zip || null,
        comment: shipping.comment || null,
        total,
        items: {
          create: items.map((i) => ({
            productId: `${i.modelId}-${i.matSet}`,
            colorId: i.colorId,
            edgeColorId: i.edgeColorId,
            badgeId: i.badgeId || null,
            quantity: i.quantity,
            price: calculateItemUnitPrice({
              matSet: i.matSet,
              edgeColor: { id: i.edgeColorId },
              badge: i.badgeId ? { id: i.badgeId } : null,
            }),
          })),
        },
      },
      select: { id: true, orderNumber: true, total: true },
    });

    return NextResponse.json(
      { id: order.id, orderNumber: order.orderNumber, total: Number(order.total) },
      { status: 201 },
    );
  } catch (err) {
    console.error("Order create failed:", err);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
