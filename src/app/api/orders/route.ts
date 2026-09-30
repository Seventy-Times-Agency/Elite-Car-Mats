import { randomBytes } from "node:crypto";
import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { ensureCatalogSeed, resetCatalogSeedCache } from "@/lib/db/seed";
import { createOrderSchema, isAccessoryInput } from "@/lib/validations/order";
import { channelFor, sanitizeAttribution } from "@/lib/analytics/attribution";
import { ensureSchema } from "@/lib/db/setup";
import { getAccessoryPrice, shippingFor } from "@/lib/pricing";
import { findAccessoryVariant } from "@/data/accessories";
import {
  badgePlates,
  lineFromRequest,
  lineUnitPrice,
  linesTotal,
  storedBadgeCount,
} from "@/lib/orders/line-items";
import { loadPriceOverrides } from "@/lib/pricing-overrides";
import { getAddonAvailability } from "@/lib/availability";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { validatePromoCode, tryConsumePromoUse } from "@/lib/promo";
import { isStripeConfigured } from "@/lib/payments/stripe";
import {
  sendCustomerOrderEmail,
  sendOwnerOrderEmail,
  sendAbandonedCheckoutEmail,
} from "@/lib/email";
import { orderUrl } from "@/lib/email/transport";
import { signOrderToken } from "@/lib/security/order-token";
import { evaColors, edgeColors, badges } from "@/data/catalog";
import { MAT_SETS_BY_PROFILE } from "@/data/catalog/mat-sets";
import { getMergedCatalog, dbModelIdFor } from "@/lib/catalog-merge";
import {
  getVehicleProfile,
  thirdRowAvailable,
  type VehicleConfigProfile,
} from "@/lib/vehicle-profile";
import { getDictionary, getLocaleFromCookie } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";
import type { OrderItemInput } from "@/lib/validations/order";
import { reportProblem } from "@/lib/ops/journal";
import { logOrderEvent } from "@/lib/orders/events";

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
  return (item: OrderItemInput, profile?: VehicleConfigProfile) => {
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
    const badgeQty = badgeRow
      ? badgePlates(lineFromRequest(item, { profile }))
      : 0;
    return {
      colorName: color.name,
      edgeColorName: edge.name,
      badgeName: badgeRow
        ? t("email.badgeSuffix", { brand: badgeRow.brandName }) +
          (badgeQty > 1 ? ` ×${badgeQty}` : "")
        : null,
    };
  };
}

export async function POST(request: Request) {
  // No schema bootstrap or catalog mirror here: both used to run on every
  // cold start of this route (dozens of DDL statements under an advisory
  // lock plus a createMany over ~4000 Product rows) and cost Neon compute
  // on the one path that must stay cheap. Schema comes from the admin
  // login / POST /api/admin/migrate; a missing Product row is handled by
  // the P2003 retry below, which re-mirrors the catalog exactly once.

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

  const { customer, shipping, items: allItems, promoCode } = parsed.data;
  const attribution = sanitizeAttribution(parsed.data.attribution);
  const channel = attribution ? channelFor(attribution) : null;
  // Mat sets and accessories take different paths below: mats resolve a
  // Product row per line, accessories are catalog slug + variant.
  const items = allItems.filter(
    (i): i is OrderItemInput => !isAccessoryInput(i),
  );
  const accessoryItems = allItems.filter(isAccessoryInput);

  // Manual-confirm flow ships to the address from this form, so it must
  // be present. With Stripe enabled the address is collected on the
  // Checkout page instead (webhook overlays it onto the order).
  if (!isStripeConfigured() && shipping.address.trim().length < 5) {
    return NextResponse.json(
      { error: "Shipping address is required" },
      { status: 400 },
    );
  }

  // Resolve productId for each cart item from the merged catalog (code +
  // admin-added custom rows). The seed mirrors custom brands/models into
  // the Brand/Model/Product tables under the same `${brandSlug}-${slug}`
  // id convention, so the same lookup works for both.
  //
  // Robust to historical bugs where cart entries stored just the model
  // slug instead of `${brand}-${slug}` — we also look up by
  // brandName + modelName (which were always in the cart payload).
  const merged = await getMergedCatalog();
  const allModels = merged.models;
  const allBrands = merged.brands;
  const itemsResolved = items.map((i) => {
    const direct = allModels.find(
      (m) =>
        m.id === i.modelId ||
        `${m.brandId}-${m.slug}` === i.modelId ||
        dbModelIdFor(m) === i.modelId,
    );
    const byName =
      direct ??
      allModels.find(
        (m) =>
          m.brandName.toLowerCase() === i.brandName.toLowerCase() &&
          m.name.toLowerCase() === i.modelName.toLowerCase(),
      );
    // DB-facing id: custom-brand merge ids carry a `custom:` prefix that
    // the Brand/Model/Product mirror does NOT — dbModelIdFor strips it so
    // the OrderItem.productId FK resolves for custom-catalog orders too.
    const modelId = byName ? dbModelIdFor(byName) : null;
    const productId = modelId ? `${modelId}-${i.matSet}` : null;
    // Resolve the profile from the merged model row while we have it —
    // findProfileByModelId can't see custom models and would fall back to
    // `standard`, billing custom minivans/pickups/semis at wrong rates.
    const profile = byName ? getVehicleProfile(byName) : null;
    return { item: i, model: byName ?? null, profile, modelId, productId };
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
  const knownBrandNames = new Set(allBrands.map((b) => b.name.toLowerCase()));
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
  for (const { item: i, profile } of itemsResolved) {
    if (!profile) continue; // unreachable: covered by the unresolved check above
    const allowed = MAT_SETS_BY_PROFILE[profile];
    if (!allowed.some((s) => s.type === i.matSet)) {
      return NextResponse.json(
        {
          error: `Mat set "${i.matSet}" is not available for ${i.brandName} ${i.modelName}.`,
        },
        { status: 400 },
      );
    }
    // Third-row add-on is only sold for standard-profile cabin sets —
    // a hand-crafted POST must not attach it to minivans (already have
    // 3 rows) or cargo-only orders.
    if (i.thirdRow && !thirdRowAvailable(profile, i.matSet)) {
      return NextResponse.json(
        {
          error: `The third-row add-on is not available for ${i.brandName} ${i.modelName} with mat set "${i.matSet}".`,
        },
        { status: 400 },
      );
    }
  }

  // Operator stock switches: an out-of-stock add-on must not slip into
  // an order via a stale cart or a hand-crafted POST — the UI hiding
  // the option is not enough.
  const availability = await getAddonAvailability();
  if (!availability.badges && items.some((i) => i.badgeId)) {
    return NextResponse.json(
      { error: "Brand plates are temporarily out of stock." },
      { status: 400 },
    );
  }
  if (!availability.heelPad && items.some((i) => i.heelPad)) {
    return NextResponse.json(
      { error: "The aluminum heel pad is temporarily out of stock." },
      { status: 400 },
    );
  }

  // Accessories: the pair must exist in the code catalog (a stale cart
  // or a hand-crafted POST must not create a line we cannot make), and
  // the operator's stock switch applies exactly like the add-ons above.
  const accessoriesResolved = accessoryItems.map((a) => ({
    item: a,
    found: findAccessoryVariant(a.accessorySlug, a.variantId),
  }));
  const badAccessory = accessoriesResolved.find((r) => !r.found);
  if (badAccessory) {
    return NextResponse.json(
      {
        error: `Unknown accessory "${badAccessory.item.accessorySlug}/${badAccessory.item.variantId}". Please remove it from the cart and add it again.`,
      },
      { status: 400 },
    );
  }
  if (
    !availability.organizer &&
    accessoryItems.some((a) => a.accessorySlug === "trunk-organizer")
  ) {
    return NextResponse.json(
      { error: "The trunk organizer is temporarily out of stock." },
      { status: 400 },
    );
  }

  // Single DB read for admin-set price overrides — used to bill the
  // customer at the latest rate even before code defaults are pushed.
  // Empty Map on DB error so checkout never blocks on a Neon hiccup.
  const overrides = await loadPriceOverrides();

  // Storefront locale of THIS request = the customer's language. Stored
  // on the order so every later transactional email (Stripe webhook,
  // admin ship/review flows — requests with someone else's or no locale)
  // renders in the language the customer actually shopped in.
  const customerLocale = await getLocaleFromCookie();

  const subtotal =
    linesTotal(
      itemsResolved.map((r) => lineFromRequest(r.item, r)),
      overrides,
    ) +
    accessoryItems.reduce(
      (sum, a) => sum + getAccessoryPrice(a.accessorySlug, overrides) * a.quantity,
      0,
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

  const runCreateTransaction = () =>
    prisma.$transaction(async (tx) => {
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
      const merchandise = Math.max(0, subtotal - appliedDiscount);
      // Threshold is judged on what the customer pays for goods, i.e.
      // after the promo — a code must not unlock free shipping it
      // pushed the order below.
      const shippingCost = shippingFor(merchandise, overrides, [
        ...itemsResolved.map((r) => `${r.profile ?? "standard"}.${r.item.matSet}`),
        ...accessoryItems.map((a) => `accessory.${a.accessorySlug}`),
      ]);
      const total = merchandise + shippingCost;
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
          locale: customerLocale,
          channel,
          attribution: attribution ? (JSON.parse(JSON.stringify(attribution)) as Prisma.InputJsonObject) : undefined,
          total,
          shippingCost,
          items: {
            create: [
              ...itemsResolved.map((r) => {
                const i = r.item;
                const line = lineFromRequest(i, r);
                return {
                  productId: r.productId!,
                  colorId: i.colorId,
                  edgeColorId: i.edgeColorId,
                  badgeId: line.badgeId,
                  badgeCount: storedBadgeCount(line),
                  heelPad: line.heelPad,
                  thirdRow: line.thirdRow,
                  year: i.year ?? null,
                  quantity: i.quantity,
                  price: lineUnitPrice(line, overrides),
                };
              }),
              // Accessory rows: no Product; colours come from the
              // variant so the same FK columns stay populated.
              ...accessoriesResolved.map(({ item: a, found }) => ({
                kind: "accessory",
                accessorySlug: a.accessorySlug,
                accessoryVariant: a.variantId,
                colorId: found!.variant.evaColorId,
                edgeColorId: found!.variant.edgeColorId,
                quantity: a.quantity,
                price: getAccessoryPrice(a.accessorySlug, overrides),
              })),
            ],
          },
        },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          shippingCost: true,
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

  let createdOrder;
  try {
    try {
      createdOrder = await runCreateTransaction();
    } catch (err) {
      // FK violation (P2003) usually means this lambda's catalog-seed cache
      // predates an admin-added custom brand/model — the Product row exists
      // in code terms but not yet in THIS instance's mirrored DB view.
      // Re-run the seed once (cross-instance safe: createMany+skipDuplicates)
      // and retry, instead of bouncing the customer with a 500.
      const e = err as { code?: string };
      if (e.code === "P2022") {
        // A column this build writes does not exist yet — the deploy
        // landed before anyone opened the admin panel (which runs the
        // schema bootstrap). Run it here and retry rather than lose the
        // sale.
        console.warn("[orders] missing column — running schema bootstrap and retrying once");
        await ensureSchema();
        createdOrder = await runCreateTransaction();
      } else {
        if (e.code !== "P2003") throw err;
        console.warn(
          "[orders] FK violation — re-mirroring catalog seed and retrying once",
        );
        resetCatalogSeedCache();
        await ensureCatalogSeed();
        createdOrder = await runCreateTransaction();
      }
    }
  } catch (err) {
    // Never leak DB internals into the client response — log and emit a
    // generic message. The detailed cause stays in server logs.
    //
    // Pull out the Prisma error code (`P2003` FK violation, `P2025` missing
    // record, …) and the failing field name so a returning operator can
    // tell at a glance whether the DB is missing a colour / brand /
    // model row that the code catalog expects. Common cause is a
    // newly-added EvaColor in code that hasn't reached the DB yet —
    // the seed now createMany-syncs every request, so this should be
    // self-healing on the next attempt.
    const e = err as { code?: string; meta?: Record<string, unknown>; message?: string };
    const msg = err instanceof Error ? err.message : String(err);
    console.error(
      "[orders] create failed:",
      JSON.stringify({
        code: e.code ?? null,
        meta: e.meta ?? null,
        message: msg,
        itemsCount: items.length,
        firstItem: items[0]
          ? {
              modelId: items[0].modelId,
              matSet: items[0].matSet,
              colorId: items[0].colorId,
              edgeColorId: items[0].edgeColorId,
              badgeId: items[0].badgeId ?? null,
            }
          : null,
      }),
    );
    await reportProblem({
      area: "order.create",
      severity: "critical",
      error: err,
      context: e.code ? `prisma ${e.code}` : undefined,
    });
    return NextResponse.json(
      { error: "Failed to create order. Please try again." },
      { status: 500 },
    );
  }

  await logOrderEvent(createdOrder.id, "created", {
    total: Number(createdOrder.total ?? 0),
    shipping: Number(createdOrder.shippingCost ?? 0),
    promo: promoPreview?.code ?? null,
  });

  // Resolve the dictionary once per request — the name resolver below
  // is fast/sync and gets reused for both customer + owner emails.
  const resolveNames = await buildResolveNames();

  // Skip the "thanks for your order" email when payments are wired up —
  // it'll fire from the Stripe webhook on `checkout.session.completed`,
  // so customers who abandon Stripe never get falsely confirmed. We do
  // still notify the owner immediately so they see the lead.
  if (!isStripeConfigured()) {
    const emailItems = itemsResolved.map(({ item: i, modelId, profile }) => {
      const names = resolveNames(i, profile ?? undefined);
      const colorRow = evaColors.find((c) => c.id === i.colorId);
      const edgeRow = edgeColors.find((c) => c.id === i.edgeColorId);
      return {
        brandName: i.brandName,
        modelName: i.modelName,
        matSet: i.matSet,
        profile: profile ?? undefined,
        colorName: names.colorName,
        colorHex: colorRow?.hex ?? null,
        edgeColorName: names.edgeColorName,
        edgeColorHex: edgeRow?.hex ?? null,
        badgeName: names.badgeName,
        heelPad: i.heelPad ?? false,
        thirdRow: i.thirdRow ?? false,
        year: i.year ?? null,
        quantity: i.quantity,
        unitPrice: lineUnitPrice(
          lineFromRequest(i, { modelId, profile }),
          overrides,
        ),
      };
    });
    const accessoryEmailItems = accessoriesResolved.map(({ item: a, found }) => {
      const v = found!.variant;
      const colorRow = evaColors.find((c) => c.id === v.evaColorId);
      const edgeRow = edgeColors.find((c) => c.id === v.edgeColorId);
      return {
        accessory: { slug: a.accessorySlug, variantId: a.variantId },
        brandName: "",
        modelName: "",
        matSet: "accessory",
        colorName: colorRow?.name ?? v.evaColorId,
        colorHex: colorRow?.hex ?? null,
        edgeColorName: edgeRow?.name ?? v.edgeColorId,
        edgeColorHex: edgeRow?.hex ?? null,
        quantity: a.quantity,
        unitPrice: getAccessoryPrice(a.accessorySlug, overrides),
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
      // annotation we glue onto Order.comment for the packing slip).
      comment: shipping.comment || null,
      total: Number(createdOrder.total ?? 0),
      shippingCost: Number(createdOrder.shippingCost ?? 0),
      items: [...emailItems, ...accessoryEmailItems],
      locale: customerLocale,
    };
    // Deferred via `after`: emails never fail (or delay) the order
    // response, and the serverless runtime keeps the instance alive until
    // the sends settle — a bare floating promise can be frozen mid-flight
    // once the response is returned.
    after(() =>
      Promise.all([
        sendCustomerOrderEmail(emailData),
        sendOwnerOrderEmail(emailData),
      ]).catch((err) => console.error("[orders] email send failed:", err)),
    );
  }
  if (isStripeConfigured()) {
    // Abandoned-checkout recovery: schedule a "complete your order" email
    // for +2h. If the customer pays, the webhook cancels it via the
    // stored Resend id; if they bailed on the Stripe page, it lands with
    // a one-click link back to their tokened order page (which shows a
    // "Complete payment" button for PENDING orders).
    const orderId = createdOrder.id;
    const payUrl = orderUrl(
      createdOrder.orderNumber,
      signOrderToken(orderId),
    );
    const totalUsd = Number(createdOrder.total ?? 0);
    const orderNumber = createdOrder.orderNumber;
    const customerName = customer.name;
    const customerEmail = customer.email;
    after(async () => {
      try {
        const emailId = await sendAbandonedCheckoutEmail({
          orderNumber,
          customerName,
          customerEmail,
          totalUsd,
          payUrl,
          scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          locale: customerLocale,
        });
        if (emailId) {
          await prisma.order.update({
            where: { id: orderId },
            data: { abandonedEmailId: emailId },
          });
        }
      } catch (err) {
        console.error("[orders] abandoned-checkout scheduling failed:", err);
        await reportProblem({ area: "orders.followup", severity: "warning", error: err });
      }
    });
  }

  // Stripe enabled: nothing is emailed here. BOTH the customer
  // confirmation AND the owner notification fire from the Stripe webhook
  // after `checkout.session.completed` (payment succeeded) — so an
  // abandoned/unpaid checkout never sends a confirmation email nor
  // creates an owner "lead" for a sale that never happened. The order
  // stays PENDING and is excluded from admin revenue until it's paid.

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
