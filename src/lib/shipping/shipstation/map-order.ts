import "server-only";
import type { MatSetType } from "@/types";
import { calculateItemUnitPrice } from "@/lib/pricing";
import type { PriceOverrideMap } from "@/lib/pricing-overrides";
import { estimateItemWeightGrams, estimateParcelWeightGrams } from "../weights";
import type {
  SsAddress,
  SsCreateOrderRequest,
  SsOrderItem,
} from "./types";

/**
 * Order → ShipStation payload. Pure function: takes a loaded Prisma Order
 * (with the relations we need) plus the live pricing overrides and returns
 * a fully-formed createOrder request. No network, no side effects.
 *
 * The caller is responsible for actually pushing the payload to SS via
 * `create-order.ts`. Splitting these two halves keeps the mapping logic
 * trivially unit-testable.
 */

const MAT_SET_FROM_ENUM: Record<string, MatSetType> = {
  FRONT: "front",
  FULL: "full",
  CARGO: "cargo",
  FULL_CARGO: "full-cargo",
};

const MAT_SET_LABEL: Record<MatSetType, string> = {
  front: "Front set",
  full: "Full set",
  cargo: "Cargo",
  "full-cargo": "Full + Cargo",
};

export interface LoadedOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string | null;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  comment: string | null;
  total: { toString(): string } | null;
  createdAt: Date;
  paidAt: Date | null;
  items: ReadonlyArray<{
    id: string;
    quantity: number;
    year: number | null;
    heelPad: boolean;
    product: {
      modelId: string;
      matSet: string;
      model: { name: string; brand: { name: string } };
    };
    color: { id: string; name: string; hex: string };
    edgeColor: { id: string; name: string; hex: string };
    badge: { id: string; brandName: string } | null;
  }>;
}

function buildSku(it: LoadedOrder["items"][number]): string {
  const matSet = MAT_SET_FROM_ENUM[it.product.matSet] ?? "full";
  const parts = [
    it.product.model.brand.name,
    it.product.model.name,
    it.year ?? "",
    matSet,
    it.color.name,
    `edge-${it.edgeColor.name}`,
    it.badge ? `badge-${it.badge.brandName}` : "",
    it.heelPad ? "heelpad" : "",
  ];
  return parts
    .filter(Boolean)
    .map((p) => String(p).toUpperCase().replace(/[^A-Z0-9]+/g, "-"))
    .join("-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

function buildItemName(it: LoadedOrder["items"][number]): string {
  const matSet = MAT_SET_FROM_ENUM[it.product.matSet] ?? "full";
  const bits = [
    `${it.product.model.brand.name} ${it.product.model.name}`,
    it.year ? String(it.year) : null,
    MAT_SET_LABEL[matSet],
    `${it.color.name} + ${it.edgeColor.name} edge`,
    it.badge ? `${it.badge.brandName} badge` : null,
    it.heelPad ? "aluminum heel pad" : null,
  ].filter(Boolean);
  return bits.join(" · ").slice(0, 200);
}

function splitName(full: string): { firstName: string; lastName: string } {
  const trimmed = full.trim();
  const space = trimmed.indexOf(" ");
  if (space < 0) return { firstName: trimmed, lastName: "" };
  return {
    firstName: trimmed.slice(0, space),
    lastName: trimmed.slice(space + 1),
  };
}

function buildAddress(order: LoadedOrder): SsAddress {
  return {
    name: order.customerName,
    street1: order.address,
    city: order.city ?? "",
    state: order.state ?? "",
    postalCode: order.zip ?? "",
    country: "US",
    phone: order.phone,
    residential: true,
  };
}

export function mapOrderToShipstation(
  order: LoadedOrder,
  opts: {
    overrides: PriceOverrideMap;
    storeId?: number | null;
  },
): SsCreateOrderRequest {
  // ItemCharacteristics used by both weight estimation and unit-price math.
  const itemDescriptors = order.items.map((it) => {
    const matSet = MAT_SET_FROM_ENUM[it.product.matSet] ?? "full";
    return {
      matSet,
      hasBadge: !!it.badge,
      hasHeelPad: !!it.heelPad,
      quantity: it.quantity,
      raw: it,
    };
  });

  const ssItems: SsOrderItem[] = itemDescriptors.map((d) => {
    const unitPrice = calculateItemUnitPrice(
      {
        matSet: d.matSet,
        modelId: d.raw.product.modelId,
        edgeColor: { id: d.raw.edgeColor.id },
        badge: d.raw.badge ? { id: d.raw.badge.id } : null,
        heelPad: d.raw.heelPad,
      },
      opts.overrides,
    );
    return {
      sku: buildSku(d.raw),
      name: buildItemName(d.raw),
      quantity: d.quantity,
      unitPrice,
      weight: {
        value: estimateItemWeightGrams({
          matSet: d.matSet,
          hasBadge: d.hasBadge,
          hasHeelPad: d.hasHeelPad,
          quantity: 1,
        }),
        units: "grams",
      },
    };
  });

  const parcelWeight = estimateParcelWeightGrams(
    itemDescriptors.map((d) => ({
      matSet: d.matSet,
      hasBadge: d.hasBadge,
      hasHeelPad: d.hasHeelPad,
      quantity: d.quantity,
    })),
  );

  const _names = splitName(order.customerName);
  void _names; // reserved if ShipStation requires structured names later

  const billTo = buildAddress(order);
  const shipTo = billTo;

  const req: SsCreateOrderRequest = {
    orderNumber: order.orderNumber,
    // orderKey is the idempotency key. Re-pushing the same orderKey
    // updates the existing SS order instead of creating a duplicate.
    orderKey: `ecm-${order.id}`,
    orderDate: order.createdAt.toISOString(),
    paymentDate: order.paidAt ? order.paidAt.toISOString() : null,
    orderStatus: "awaiting_shipment",
    customerEmail: order.email,
    billTo,
    shipTo,
    items: ssItems,
    amountPaid: Number(order.total ?? 0),
    customerNotes: order.comment ?? null,
    internalNotes: `EliteCarMats order #${order.orderNumber}`,
    weight: { value: parcelWeight, units: "grams" },
  };

  if (opts.storeId) req.storeId = opts.storeId;
  return req;
}
