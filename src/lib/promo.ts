import "server-only";
import { prisma } from "@/lib/db/prisma";

export interface PromoValidationResult {
  valid: boolean;
  code?: string;
  discount?: number; // percentage
  amount?: number; // computed discount in USD (whole-dollar)
  error?: "invalid";
  // Generic single error code — we deliberately don't tell the client whether
  // the code doesn't exist, is expired, or used up. That stops anonymous
  // attackers from using the validate endpoint as a code-enumeration oracle.
}

/**
 * Validates a promo code against an expected cart subtotal.
 * Does NOT increment usage — that happens via tryConsumePromoUse on
 * successful order creation in an atomic round-trip.
 *
 * Note: any failure mode collapses to `error: "invalid"` so the public
 * endpoint cannot be used to enumerate which codes exist or are exhausted.
 */
export async function validatePromoCode(
  rawCode: string,
  subtotal: number,
): Promise<PromoValidationResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { valid: false, error: "invalid" };

  const promo = await prisma.promoCode.findUnique({ where: { code } });
  if (!promo) return { valid: false, error: "invalid" };
  if (!promo.active) return { valid: false, error: "invalid" };
  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return { valid: false, error: "invalid" };
  }
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
    return { valid: false, error: "invalid" };
  }
  const minOrder = promo.minOrder ? Number(promo.minOrder) : 0;
  if (minOrder > 0 && subtotal < minOrder) {
    return { valid: false, error: "invalid" };
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
 * Atomically increments `usedCount` only when:
 *   - the code is active
 *   - it has not expired
 *   - usedCount < maxUses (or maxUses is NULL = unlimited)
 *
 * Returns true if exactly one row was updated — false otherwise. Use this
 * inside the same Prisma `$transaction` as the order creation so an
 * exhausted code rolls the order back instead of silently over-redeeming.
 *
 * The `tx` parameter is intentionally typed as `unknown` and accessed via
 * a structural cast so this module doesn't need to import Prisma's
 * (deeply-generic, version-tied) transaction-client types.
 */
export async function tryConsumePromoUse(
  tx: unknown,
  rawCode: string,
): Promise<boolean> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return false;
  const now = new Date();
  const client = tx as {
    $executeRaw: (
      strings: TemplateStringsArray,
      ...values: unknown[]
    ) => Promise<number>;
  };
  const rows = await client.$executeRaw`
    UPDATE "PromoCode"
       SET "usedCount" = "usedCount" + 1
     WHERE "code" = ${code}
       AND "active" = true
       AND ("expiresAt" IS NULL OR "expiresAt" > ${now})
       AND ("maxUses" IS NULL OR "usedCount" < "maxUses")
  `;
  return rows === 1;
}
