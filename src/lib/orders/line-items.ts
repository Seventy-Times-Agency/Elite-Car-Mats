import type { MatSetType } from "@/types";
import type { VehicleConfigProfile } from "@/lib/vehicle-profile";
import {
  calculateItemUnitPrice,
  clampBadgeCount,
  type PriceOverrideMap,
} from "@/lib/pricing";

/**
 * One order line the way every billing path sees it.
 *
 * Order creation, the Stripe session, the webhook's re-derivation and the
 * customer/owner emails each used to rebuild this object by hand, with
 * their own defaults for a missing badge count or add-on flag. Those
 * defaults now live here and nowhere else: build a line with
 * `lineFromRequest` (checkout payload) or `lineFromDb` (stored OrderItem
 * with relations), price it with `lineUnitPrice`.
 */
export interface OrderLine {
  matSet: MatSetType;
  /** DB-facing model id (`brand-model`); drives the profile lookup. */
  modelId?: string;
  /** Resolved vehicle profile. When set it wins over `modelId`. */
  profile?: VehicleConfigProfile;
  edgeColorId: string;
  badgeId: string | null;
  /** Requested plates; see `badgePlates` for what is actually billed. */
  badgeCount: number;
  heelPad: boolean;
  thirdRow: boolean;
  quantity: number;
}

/** Prisma `MatSetType` enum → catalog code. */
export const MAT_SET_FROM_ENUM: Record<string, MatSetType> = {
  FRONT: "front",
  FULL: "full",
  CARGO: "cargo",
  FULL_CARGO: "full-cargo",
};

export function matSetFromEnum(value: string): MatSetType {
  const matSet = MAT_SET_FROM_ENUM[value];
  if (!matSet) throw new Error(`Unknown matSet enum: ${value}`);
  return matSet;
}

/** The subset of the checkout payload a line is built from. */
export interface RequestLineInput {
  matSet: MatSetType;
  modelId: string;
  edgeColorId: string;
  badgeId?: string | null;
  badgeCount?: number | null;
  heelPad?: boolean | null;
  thirdRow?: boolean | null;
  quantity: number;
}

/**
 * Line from a checkout request plus what the catalog lookup resolved for
 * it. `resolved.modelId` is the DB-facing id (custom-brand merge ids
 * carry a `custom:` prefix the mirror does not); `resolved.profile` comes
 * from the merged catalog so admin custom models are not billed at
 * `standard` rates. Either may be null when the lookup failed — the line
 * then falls back to the raw request id, exactly as before.
 */
export function lineFromRequest(
  item: RequestLineInput,
  resolved: {
    modelId?: string | null;
    profile?: VehicleConfigProfile | null;
  } = {},
): OrderLine {
  return {
    matSet: item.matSet,
    modelId: resolved.modelId ?? item.modelId,
    profile: resolved.profile ?? undefined,
    edgeColorId: item.edgeColorId,
    badgeId: item.badgeId || null,
    badgeCount: item.badgeCount ?? 1,
    heelPad: item.heelPad ?? false,
    thirdRow: item.thirdRow ?? false,
    quantity: item.quantity,
  };
}

/** A stored OrderItem with the relations the money paths already load. */
export interface DbLineInput {
  product: { matSet: string; modelId: string };
  edgeColor: { id: string };
  badge: { id: string } | null;
  badgeCount: number | null;
  heelPad: boolean | null;
  thirdRow: boolean | null;
  quantity: number;
}

export function lineFromDb(
  row: DbLineInput,
  profileOf: (dbModelId: string) => VehicleConfigProfile,
): OrderLine {
  return {
    matSet: matSetFromEnum(row.product.matSet),
    modelId: row.product.modelId,
    profile: profileOf(row.product.modelId),
    edgeColorId: row.edgeColor.id,
    badgeId: row.badge?.id ?? null,
    badgeCount: row.badgeCount ?? 1,
    heelPad: row.heelPad ?? false,
    thirdRow: row.thirdRow ?? false,
    quantity: row.quantity,
  };
}

export function lineUnitPrice(
  line: OrderLine,
  overrides?: PriceOverrideMap,
): number {
  return calculateItemUnitPrice(
    {
      matSet: line.matSet,
      modelId: line.modelId,
      profile: line.profile,
      edgeColor: { id: line.edgeColorId },
      badge: line.badgeId ? { id: line.badgeId } : null,
      badgeCount: line.badgeCount,
      heelPad: line.heelPad,
      thirdRow: line.thirdRow,
    },
    overrides,
  );
}

export function lineTotal(line: OrderLine, overrides?: PriceOverrideMap): number {
  return lineUnitPrice(line, overrides) * line.quantity;
}

export function linesTotal(
  lines: OrderLine[],
  overrides?: PriceOverrideMap,
): number {
  return lines.reduce((sum, line) => sum + lineTotal(line, overrides), 0);
}

/** Plates actually billed: 0 without a badge, else clamped to the set. */
export function badgePlates(line: OrderLine): number {
  return clampBadgeCount({
    matSet: line.matSet,
    modelId: line.modelId,
    profile: line.profile,
    badge: line.badgeId ? { id: line.badgeId } : null,
    badgeCount: line.badgeCount,
  });
}

/**
 * Value persisted in `OrderItem.badgeCount`. The column defaults to 1 for
 * legacy rows, so a line without a badge stores 1 (not the 0 that
 * `badgePlates` bills) — keeps new rows indistinguishable from old ones.
 */
export function storedBadgeCount(line: OrderLine): number {
  return line.badgeId ? badgePlates(line) : 1;
}
