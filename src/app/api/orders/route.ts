import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSchema } from "@/lib/db-setup";
import { createOrderSchema, OrderItemInput } from "@/lib/validations/order";
import { calculateItemUnitPrice, calculateOrderTotal } from "@/lib/pricing";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { validatePromoCode, recordPromoUse } from "@/lib/promo";
import {
  sendCustomerOrderEmail,
  sendOwnerOrderEmail,
} from "@/lib/email";
import { evaColors, edgeColors, brands } from "@/data/mock";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ECM-${ts}-${rand}`;
}

async function resolveNames(item: OrderItemInput) {
  const color = evaColors.find((c) => c.id === item.colorId);
  const edge = edgeColors.find((c) => c.id === item.edgeColorId);
  const badge = item.badgeId
    ? brands.find((b) => `badge-${b.slug}` === item.badgeId)
    : null;
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  return {
    colorName: color?.name ?? item.colorId,
    edgeColorName: edge?.name ?? item.edgeColorId,
    badgeName: badge ? t("email.badgeSuffix", { brand: badge.name }) : null,
  };
}

export async function POST(request: Request) {
  await ensureSchema();

  const ip = getClientIp(request);
  const limit = rateLimit(`orders:${ip}`);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

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

  const { customer, shipping, items, promoCode } = parsed.data;

  const subtotal = calculateOrderTotal(
    items.map((i) => ({
      matSet: i.matSet,
      edgeColor: { id: i.edgeColorId },
      badge: i.badgeId ? { id: i.badgeId } : null,
      quantity: i.quantity,
    })),
  );

  let discount = 0;
  let appliedPromoCode: string | null = null;
  if (promoCode) {
    const promoResult = await validatePromoCode(promoCode, subtotal);
    if (promoResult.valid && promoResult.amount && promoResult.code) {
      discount = promoResult.amount;
      appliedPromoCode = promoResult.code;
    }
  }

  const total = Math.max(0, subtotal - discount);

  let order;
  try {
    order = await prisma.order.create({
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
        comment: appliedPromoCode
          ? `${shipping.comment || ""}${shipping.comment ? "\n\n" : ""}[promo ${appliedPromoCode} −$${discount}]`.trim()
          : shipping.comment || null,
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
  } catch (err) {
    console.error("Order create failed:", err);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }

  const emailItems = await Promise.all(items.map(async (i) => {
    const names = await resolveNames(i);
    return {
      brandName: i.brandName,
      modelName: i.modelName,
      matSet: i.matSet,
      colorName: names.colorName,
      edgeColorName: names.edgeColorName,
      badgeName: names.badgeName,
      quantity: i.quantity,
      unitPrice: calculateItemUnitPrice({
        matSet: i.matSet,
        edgeColor: { id: i.edgeColorId },
        badge: i.badgeId ? { id: i.badgeId } : null,
      }),
    };
  }));

  const emailData = {
    orderNumber: order.orderNumber,
    customerName: customer.name,
    customerEmail: customer.email,
    phone: customer.phone,
    address: shipping.address,
    city: shipping.city || null,
    state: shipping.state || null,
    zip: shipping.zip || null,
    total,
    items: emailItems,
  };

  await Promise.all([
    sendCustomerOrderEmail(emailData),
    sendOwnerOrderEmail(emailData),
    appliedPromoCode ? recordPromoUse(appliedPromoCode) : Promise.resolve(),
  ]);

  return NextResponse.json(
    { id: order.id, orderNumber: order.orderNumber, total: Number(order.total) },
    { status: 201 },
  );
}
