import "server-only";
import { prisma } from "./prisma";

export interface PromoValidationResult {
  valid: boolean;
  code?: string;
  discount?: number; // percentage
  amount?: number; // computed discount in USD
  error?: "not_found" | "inactive" | "expired" | "used_up" | "min_order";
  minOrder?: number;
}

/**
 * Validates a promo code against an expected cart subtotal.
 * Does NOT increment usage — that happens on successful order creation.
 */
export async function validatePromoCode(
  rawCode: string,
  subtotal: number,
): Promise<PromoValidationResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { valid: false, error: "not_found" };

  const promo = await prisma.promoCode.findUnique({
    where: { code },
  });
  if (!promo) return { valid: false, error: "not_found" };
  if (!promo.active) return { valid: false, error: "inactive" };
  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return { valid: false, error: "expired" };
  }
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
    return { valid: false, error: "used_up" };
  }
  const minOrder = promo.minOrder ? Number(promo.minOrder) : 0;
  if (minOrder > 0 && subtotal < minOrder) {
    return { valid: false, error: "min_order", minOrder };
  }

  const amount = Math.round((subtotal * promo.discount) / 100);
  return {
    valid: true,
    code: promo.code,
    discount: promo.discount,
    amount,
  };
}

/**
 * Atomically increments usedCount when an order actually applies the code.
 * Silent on not-found (code was deleted in the meantime — we already gave
 * the discount, so don't fail the order).
 */
export async function recordPromoUse(code: string): Promise<void> {
  try {
    await prisma.promoCode.update({
      where: { code: code.toUpperCase() },
      data: { usedCount: { increment: 1 } },
    });
  } catch (err) {
    console.warn("[promo:record-use]", err);
  }
}
