"use client";

import { useT } from "@/i18n/I18nProvider";
import { usePriceOverrides } from "@/context/PriceOverridesContext";
import { formatPrice, getShippingSettings, shippingFor } from "@/lib/pricing";

/**
 * "Shipping: $15 / Free" row plus the "add $X more for free shipping"
 * nudge. `merchandise` is what the customer pays for goods (after promo
 * where one is applied) — the same base the order API uses, so the
 * drawer, cart, checkout and the billed order agree.
 */
export function ShippingLine({ merchandise }: { merchandise: number }) {
  const t = useT();
  const overrides = usePriceOverrides();
  const cost = shippingFor(merchandise, overrides);
  const { freeFrom } = getShippingSettings(overrides);
  const remaining = cost > 0 && freeFrom > 0 ? freeFrom - merchandise : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline text-xs">
        <span className="text-text-dim">{t("cart.shippingLine")}</span>
        <span className={cost > 0 ? "text-text-dim" : "text-gold"}>
          {cost > 0 ? formatPrice(cost) : t("cart.shippingFree")}
        </span>
      </div>
      {remaining > 0 && (
        <p className="text-[11px] text-gold/80 leading-snug">
          {t("cart.freeShipHint", { amount: formatPrice(remaining) })}
        </p>
      )}
    </div>
  );
}

/** Total the customer will be billed: goods (after promo) + shipping. */
export function useBilledTotal(merchandise: number): number {
  const overrides = usePriceOverrides();
  return merchandise + shippingFor(merchandise, overrides);
}
