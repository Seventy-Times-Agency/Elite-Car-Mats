import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ensureSchema } from "@/lib/db/setup";
import { ensureCatalogSeed } from "@/lib/db/seed";
import { createOrderSchema } from "@/lib/validations/order";
import { calculateItemUnitPrice, calculateOrderTotal } from "@/lib/pricing";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { validatePromoCode, tryConsumePromoUse } from "@/lib/promo";
import { isStripeConfigured } from "@/lib/payments/stripe";
import {
  sendCustomerOrderEmail,
  sendOwnerOrderEmail,
} from "@/lib/email";
import { signOrderToken } from "@/lib/security/order-token";
import { evaColors, edgeColors, brands, badges, mockModels } from "@/data/catalog";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";
import type { OrderItemInput } from "@/lib/validations/order";

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ECM-${ts}-${rand}`;
}

async function resolveNames(item: OrderItemInput) {
  const color = evaColors.find((c) => c.id === item.colorId);
  const edge = edgeColors.find((c) => c.id === item.edgeColorId);
  const badgeRow = item.badgeId
    ? badges.find((b) => b.id === item.badgeId)
    : null;
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  return {
    colorName: color?.name ?? item.colorId,
    edgeColorName: edge?.name ?? item.edgeColorId,
    badgeName: badgeRow
      ? t("email.badgeSuffix", { brand: badgeRow.brandName })
      : null,
  };
}

export async function POST(request: Request) {
  // Schema is bootstrapped by the admin login flow / cron — but on a brand
  // new deploy where the very first hit happens to be a public POST we still
  // want it to succeed. Cached after first run.
  await ensureSchema();
  await ensureCatalogSeed();

  const ip = getClientIp(request);
  const limit = await rateLimit(`orders:${ip}`);
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

  // Resolve productId for each cart item from the canonical mockModels
  // catalog. This is robust to historical bugs where cart entries stored
  // just the model slug instead of `${brand}-${slug}` — we look up by
  // brandName + modelName (which were always in the cart payload) and
  // recompute the seeded Product id deterministically.
  const itemsResolved = items.map((i) => {
    const direct = mockModels.find(
      (m) =>
        m.id === i.modelId ||
        `${m.brandId}-${m.slug}` === i.modelId,
    );
    const byName =
      direct ??
      mockModels.find(
        (m) =>
          m.brandName.toLowerCase() === i.brandName.toLowerCase() &&
          m.name.toLowerCase() === i.modelName.toLowerCase(),
      );
    const productId = byName
      ? `${byName.brandId}-${byName.slug}-${i.matSet}`
      : null;
    return { item: i, productId };
  });

  const unresolved = itemsResolved.filter((r) => !r.productId);
  if (unresolved.length > 0) {
    const list = unresolved
      .map((r) => `${r.item.brandName} ${r.item.modelName}`)
      .join(", ");
    return NextResponse.json(
      {
        error: `Cannot find product in catalog: ${list}. Please reopen the model page and add to cart again.`,
      },
      { status: 400 },
    );
  }

  // Validate that every referenced color / edge / badge id actually exists
  // in the mock catalog. This catches stale carts in localStorage from
  // before color-list changes and surfaces the bad value cleanly instead
  // of dying at the FK constraint.
  const validEvaIds = new Set(evaColors.map((c) => c.id));
  const validEdgeIds = new Set(edgeColors.map((c) => c.id));
  const validBadgeIds = new Set(badges.map((b) => b.id));
  const refIssues: string[] = [];
  for (const i of items) {
    if (!validEvaIds.has(i.colorId))
      refIssues.push(`EVA color "${i.colorId}"`);
    if (!validEdgeIds.has(i.edgeColorId))
      refIssues.push(`edge color "${i.edgeColorId}"`);
    if (i.badgeId && !validBadgeIds.has(i.badgeId))
      refIssues.push(`badge "${i.badgeId}"`);
  }
  if (refIssues.length > 0) {
    return NextResponse.json(
      {
        error: `Cart references unknown options: ${[...new Set(refIssues)].join(", ")}. Please clear your cart and pick fresh options.`,
      },
      { status: 400 },
    );
  }

  // Defensive guard: ensure brandName matches a known brand. This is purely
  // for cleaner error reporting — the productId resolution above already
  // covered the substantive check.
  const knownBrandNames = new Set(brands.map((b) => b.name.toLowerCase()));
  for (const i of items) {
    if (!knownBrandNames.has(i.brandName.toLowerCase())) {
      return NextResponse.json(
        { error: `Unknown brand "${i.brandName}"` },
        { status: 400 },
      );
    }
  }

  const subtotal = calculateOrderTotal(
    items.map((i) => ({
      matSet: i.matSet,
      edgeColor: { id: i.edgeColorId },
      badge: i.badgeId ? { id: i.badgeId } : null,
      quantity: i.quantity,
    })),
  );

  // Pre-validate the promo code so we can short-circuit invalid codes
  // before opening a transaction. The actual usage decrement happens
  // inside the tx via tryConsumePromoUse for atomicity.
  let promoPreview: { code: string; amount: number; discount: number } | null = null;
  if (promoCode) {
    const v = await validatePromoCode(promoCode, subtotal);
    if (v.valid && v.code && typeof v.amount === "number") {
      promoPreview = { code: v.code, amount: v.amount, discount: v.discount ?? 0 };
    }
  }

  let createdOrder;
  try {
    createdOrder = await prisma.$transaction(async (tx) => {
      let appliedDiscount = 0;
      let appliedCode: string | null = null;
      if (promoPreview) {
        const consumed = await tryConsumePromoUse(tx, promoPreview.code);
        if (consumed) {
          appliedCode = promoPreview.code;
          appliedDiscount = promoPreview.amount;
        }
        // If the atomic consume failed (race lost / just expired), we
        // proceed without the discount rather than failing the order.
      }
      const total = Math.max(0, subtotal - appliedDiscount);
      return tx.order.create({
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
          comment: appliedCode
            ? `${shipping.comment || ""}${shipping.comment ? "\n\n" : ""}[promo ${appliedCode} −$${appliedDiscount}]`.trim()
            : shipping.comment || null,
          total,
          items: {
            create: itemsResolved.map(({ item: i, productId }) => ({
              productId: productId!,
              colorId: i.colorId,
              edgeColorId: i.edgeColorId,
              badgeId: i.badgeId || null,
              year: i.year ?? null,
              quantity: i.quantity,
              price: calculateItemUnitPrice({
                matSet: i.matSet,
                edgeColor: { id: i.edgeColorId },
                badge: i.badgeId ? { id: i.badgeId } : null,
              }),
            })),
          },
        },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          customerName: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          state: true,
          zip: true,
        },
      });
    });
  } catch (err) {
    // Never leak DB internals into the client response — log and emit a
    // generic message. The detailed cause stays in server logs.
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[orders] create failed:", msg);
    return NextResponse.json(
      { error: "Failed to create order. Please try again." },
      { status: 500 },
    );
  }

  // Skip the "thanks for your order" email when payments are wired up —
  // it'll fire from the Stripe webhook on `checkout.session.completed`,
  // so customers who abandon Stripe never get falsely confirmed. We do
  // still notify the owner immediately so they see the lead.
  if (!isStripeConfigured()) {
    const emailItems = await Promise.all(items.map(async (i) => {
      const names = await resolveNames(i);
      const colorRow = evaColors.find((c) => c.id === i.colorId);
      const edgeRow = edgeColors.find((c) => c.id === i.edgeColorId);
      return {
        brandName: i.brandName,
        modelName: i.modelName,
        matSet: i.matSet,
        colorName: names.colorName,
        colorHex: colorRow?.hex ?? null,
        edgeColorName: names.edgeColorName,
        edgeColorHex: edgeRow?.hex ?? null,
        badgeName: names.badgeName,
        year: i.year ?? null,
        quantity: i.quantity,
        unitPrice: calculateItemUnitPrice({
          matSet: i.matSet,
          edgeColor: { id: i.edgeColorId },
          badge: i.badgeId ? { id: i.badgeId } : null,
        }),
      };
    }));
    const emailData = {
      orderNumber: createdOrder.orderNumber,
      orderToken: signOrderToken(createdOrder.id),
      customerName: customer.name,
      customerEmail: customer.email,
      phone: customer.phone,
      address: shipping.address,
      city: shipping.city || null,
      state: shipping.state || null,
      zip: shipping.zip || null,
      total: Number(createdOrder.total ?? 0),
      items: emailItems,
    };
    // Fire-and-forget: emails never fail the order.
    Promise.all([
      sendCustomerOrderEmail(emailData),
      sendOwnerOrderEmail(emailData),
    ]).catch((err) => console.error("[orders] email send failed:", err));
  } else {
    // Stripe path: notify the owner now (so they see the lead even if the
    // customer abandons the Stripe session). The customer email moves to
    // the webhook.
    const emailItems = await Promise.all(items.map(async (i) => {
      const names = await resolveNames(i);
      const colorRow = evaColors.find((c) => c.id === i.colorId);
      const edgeRow = edgeColors.find((c) => c.id === i.edgeColorId);
      return {
        brandName: i.brandName,
        modelName: i.modelName,
        matSet: i.matSet,
        colorName: names.colorName,
        colorHex: colorRow?.hex ?? null,
        edgeColorName: names.edgeColorName,
        edgeColorHex: edgeRow?.hex ?? null,
        badgeName: names.badgeName,
        year: i.year ?? null,
        quantity: i.quantity,
        unitPrice: calculateItemUnitPrice({
          matSet: i.matSet,
          edgeColor: { id: i.edgeColorId },
          badge: i.badgeId ? { id: i.badgeId } : null,
        }),
      };
    }));
    sendOwnerOrderEmail({
      orderNumber: createdOrder.orderNumber,
      orderToken: signOrderToken(createdOrder.id),
      customerName: customer.name,
      customerEmail: customer.email,
      phone: customer.phone,
      address: shipping.address,
      city: shipping.city || null,
      state: shipping.state || null,
      zip: shipping.zip || null,
      total: Number(createdOrder.total ?? 0),
      items: emailItems,
    }).catch((err) => console.error("[orders] owner email failed:", err));
  }

  return NextResponse.json(
    {
      id: createdOrder.id,
      orderNumber: createdOrder.orderNumber,
      total: Number(createdOrder.total ?? 0),
      orderToken: signOrderToken(createdOrder.id),
    },
    { status: 201 },
  );
}
