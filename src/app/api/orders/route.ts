import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ensureSchema } from "@/lib/db/setup";
import { ensureCatalogSeed } from "@/lib/db/seed";
import { createOrderSchema } from "@/lib/validations/order";
import { calculateItemUnitPrice, calculateOrderTotal } from "@/lib/pricing";
import { loadPriceOverrides } from "@/lib/pricing-overrides";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { validatePromoCode, tryConsumePromoUse } from "@/lib/promo";
import { isStripeConfigured } from "@/lib/payments/stripe";
import {
  sendCustomerOrderEmail,
  sendOwnerOrderEmail,
} from "@/lib/email";
import { signOrderToken } from "@/lib/security/order-token";
import { evaColors, edgeColors, brands, badges, mockModels } from "@/data/catalog";
import { MAT_SETS_BY_PROFILE } from "@/data/catalog/mat-sets";
import { getVehicleProfile } from "@/lib/vehicle-profile";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";
import type { OrderItemInput } from "@/lib/validations/order";

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = randomBytes(4).toString("hex").toUpperCase();
  return `ECM-${ts}-${rand}`;
}

/**
 * Build a synchronous name-resolver for an order's items. The dictionary
 * is fetched once at the top of the request so we don't re-parse
 * cookies / Accept-Language headers per item in the order — that was
 * the per-item cost when this lived inline in a Promise.all map.
 */
async function buildResolveNames() {
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  return (item: OrderItemInput) => {
    const color = evaColors.find((c) => c.id === item.colorId);
    const edge = edgeColors.find((c) => c.id === item.edgeColorId);
    // The set is already validated against the catalog higher up in POST
    // (`validEvaIds` / `validEdgeIds`) — if we get here without a match,
    // the catalog code is out of sync with the request and we'd rather
    // 500 loudly than put raw cuids into the customer's email.
    if (!color) {
      throw new Error(`Unknown EVA color id: ${item.colorId}`);
    }
    if (!edge) {
      throw new Error(`Unknown edge color id: ${item.edgeColorId}`);
    }
    const badgeRow = item.badgeId
      ? badges.find((b) => b.id === item.badgeId)
      : null;
    if (item.badgeId && !badgeRow) {
      throw new Error(`Unknown badge id: ${item.badgeId}`);
    }
    return {
      colorName: color.name,
      edgeColorName: edge.name,
      badgeName: badgeRow
        ? t("email.badgeSuffix", { brand: badgeRow.brandName })
        : null,
    };
  };
}

export async function POST(request: Request) {
  // First-deploy safety net. After SCHEMA_BOOTSTRAPPED=1 is set in the
  // environment we skip the per-cold-start schema/seed checks (they're
  // already cached one-shot per process, but the very first request on
  // a fresh lambda still pays them — env flag lets ops short-circuit
  // entirely once the admin has run /api/admin/migrate once).
  if (process.env.SCHEMA_BOOTSTRAPPED !== "1") {
    await ensureSchema();
    await ensureCatalogSeed();
  }

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
    const modelId = byName ? `${byName.brandId}-${byName.slug}` : null;
    const productId = modelId ? `${modelId}-${i.matSet}` : null;
    return { item: i, modelId, productId };
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

  // Validate that each item's matSet is actually offered for that
  // vehicle's profile (sedan / pickup / minivan / semi / twoSeater).
  // Without this a hand-crafted POST could ship `{matSet:"cargo"}` for
  // a semi truck and be billed at the sedan-cargo $79 — a silent
  // pricing-bypass vector. The model has already been resolved above,
  // so we can trust the catalog row.
  const modelById = new Map(mockModels.map((m) => [m.id, m] as const));
  for (const { item: i, modelId } of itemsResolved) {
    const lookupId = modelId ?? i.modelId;
    const m = modelById.get(lookupId);
    if (!m) continue; // unreachable: covered by the unresolved check above
    const profile = getVehicleProfile(m);
    const allowed = MAT_SETS_BY_PROFILE[profile];
    if (!allowed.some((s) => s.type === i.matSet)) {
      return NextResponse.json(
        {
          error: `Mat set "${i.matSet}" is not available for ${i.brandName} ${i.modelName}.`,
        },
        { status: 400 },
      );
    }
  }

  // Single DB read for admin-set price overrides — used to bill the
  // customer at the latest rate even before code defaults are pushed.
  // Empty Map on DB error so checkout never blocks on a Neon hiccup.
  const overrides = await loadPriceOverrides();

  const subtotal = calculateOrderTotal(
    itemsResolved.map(({ item: i, modelId }) => ({
      matSet: i.matSet,
      modelId: modelId ?? i.modelId,
      edgeColor: { id: i.edgeColorId },
      badge: i.badgeId ? { id: i.badgeId } : null,
      heelPad: i.heelPad ?? false,
      quantity: i.quantity,
    })),
    overrides,
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
          comment: shipping.comment || null,
          promoCode: appliedCode,
          total,
          items: {
            create: itemsResolved.map(({ item: i, modelId, productId }) => ({
              productId: productId!,
              colorId: i.colorId,
              edgeColorId: i.edgeColorId,
              badgeId: i.badgeId || null,
              heelPad: i.heelPad ?? false,
              year: i.year ?? null,
              quantity: i.quantity,
              price: calculateItemUnitPrice(
                {
                  matSet: i.matSet,
                  modelId: modelId ?? i.modelId,
                  edgeColor: { id: i.edgeColorId },
                  badge: i.badgeId ? { id: i.badgeId } : null,
                  heelPad: i.heelPad ?? false,
                },
                overrides,
              ),
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

  // Resolve the dictionary once per request — the name resolver below
  // is fast/sync and gets reused for both customer + owner emails.
  const resolveNames = await buildResolveNames();

  // Skip the "thanks for your order" email when payments are wired up —
  // it'll fire from the Stripe webhook on `checkout.session.completed`,
  // so customers who abandon Stripe never get falsely confirmed. We do
  // still notify the owner immediately so they see the lead.
  if (!isStripeConfigured()) {
    const emailItems = itemsResolved.map(({ item: i, modelId }) => {
      const names = resolveNames(i);
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
        heelPad: i.heelPad ?? false,
        year: i.year ?? null,
        quantity: i.quantity,
        unitPrice: calculateItemUnitPrice(
          {
            matSet: i.matSet,
            modelId: modelId ?? i.modelId,
            edgeColor: { id: i.edgeColorId },
            badge: i.badgeId ? { id: i.badgeId } : null,
            heelPad: i.heelPad ?? false,
          },
          overrides,
        ),
      };
    });
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
      // Pass the customer's raw note (without the internal promo
      // annotation we glue onto Order.comment for ShipStation).
      comment: shipping.comment || null,
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
    const emailItems = itemsResolved.map(({ item: i, modelId }) => {
      const names = resolveNames(i);
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
        heelPad: i.heelPad ?? false,
        year: i.year ?? null,
        quantity: i.quantity,
        unitPrice: calculateItemUnitPrice(
          {
            matSet: i.matSet,
            modelId: modelId ?? i.modelId,
            edgeColor: { id: i.edgeColorId },
            badge: i.badgeId ? { id: i.badgeId } : null,
            heelPad: i.heelPad ?? false,
          },
          overrides,
        ),
      };
    });
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
      comment: shipping.comment || null,
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
