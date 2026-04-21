import { MatSetType } from "@/types";

// Temporary flat price — will be replaced with a real price list later
const FLAT_PRICE = 100;

export const MAT_SET_PRICE: Record<MatSetType, number> = {
  front: FLAT_PRICE,
  full: FLAT_PRICE,
  cargo: FLAT_PRICE,
  "full-cargo": FLAT_PRICE,
};

export const EDGE_SURCHARGE: Record<string, number> = {
  black: 0,
  gray: 0,
  gold: 0,
  red: 0,
};

export const BADGE_PRICE = 0;

export const CURRENCY = "USD";
export const CURRENCY_SYMBOL = "$";

export interface PriceableItem {
  matSet: MatSetType;
  edgeColor: { id: string };
  badge?: { id: string } | null;
  quantity: number;
}

export function calculateItemUnitPrice(item: {
  matSet: MatSetType;
  edgeColor: { id: string };
  badge?: { id: string } | null | undefined;
}): number {
  const base = MAT_SET_PRICE[item.matSet];
  const edge = EDGE_SURCHARGE[item.edgeColor.id] ?? 0;
  const badge = item.badge ? BADGE_PRICE : 0;
  return base + edge + badge;
}

export function calculateItemTotal(item: PriceableItem): number {
  return calculateItemUnitPrice(item) * item.quantity;
}

export function calculateOrderTotal(items: PriceableItem[]): number {
  return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
}

export function formatPrice(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toFixed(0)}`;
}
