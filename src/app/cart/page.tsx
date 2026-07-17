"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import {
  calculateItemUnitPrice,
  calculateOrderTotal,
  formatPrice,
} from "@/lib/pricing";
import { useT } from "@/i18n/I18nProvider";
import { localizeColor, localizeMatSet } from "@/i18n/labels";
import { usePriceOverrides } from "@/context/PriceOverridesContext";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, hydrated } = useCart();
  const priceOverrides = usePriceOverrides();
  const total = calculateOrderTotal(items, priceOverrides);
  const t = useT();

  if (!hydrated) return <div className="min-h-[60vh]" />;

  if (items.length === 0)
    return (
      <div className="py-28 text-center">
        <svg
          viewBox="0 0 24 24"
          className="w-14 h-14 mx-auto mb-4 text-text-faint"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.4}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
          />
        </svg>
        <h1 className="text-xl font-bold">{t("cart.emptyTitle")}</h1>
        <p className="mt-2 text-text-dim text-sm">{t("cart.emptySubtitle")}</p>
        <Link
          href="/catalog"
          className="mt-6 inline-block bg-gradient-to-r from-gold to-gold-light text-bg px-6 py-3 text-sm font-semibold tracking-wider uppercase rounded-lg shadow-[0_4px_20px_rgba(212,165,74,0.25)]"
        >
          {t("cart.toCatalog")}
        </Link>
      </div>
    );

  return (
    <div className="py-12 lg:py-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-bold">{t("cart.title")}</h1>
          <button
            onClick={clearCart}
            className="text-text-faint hover:text-error text-xs tracking-wider uppercase transition-colors"
          >
            {t("cart.clear")}
          </button>
        </div>
        <div className="space-y-3">
          {items.map((item) => {
            const unit = calculateItemUnitPrice(item, priceOverrides);
            return (
              <div key={item.id} className="glass-card rounded-xl p-5 flex gap-4">
                <div
                  className="w-14 h-14 rounded-lg border border-border shrink-0"
                  style={{ backgroundColor: item.color.hex }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-3">
                    <h3 className="text-text font-medium text-sm">
                      {item.brandName} {item.modelName}
                    </h3>
                    <span className="text-gold text-sm font-semibold shrink-0">
                      {formatPrice(unit * item.quantity)}
                    </span>
                  </div>
                  <p className="text-text-faint text-xs mt-1">
                    {item.year} · {localizeMatSet(t, item.matSetLabel)} ·{" "}
                    {localizeColor(t, item.color.name)} ·{" "}
                    {localizeColor(t, item.edgeColor.name)}
                    {item.badge
                      ? ` · ${item.badge.brandName}${(item.badgeCount ?? 1) > 1 ? ` ×${item.badgeCount}` : ""}`
                      : ""}
                    {item.heelPad ? ` · ${t("cart.drawerHeelPadChip")}` : ""}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                      className="w-9 h-9 rounded-md border border-border text-text-dim hover:border-gold hover:text-gold text-base transition-colors disabled:opacity-30"
                    >
                      −
                    </button>
                    <span className="text-text text-sm w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                      className="w-9 h-9 rounded-md border border-border text-text-dim hover:border-gold hover:text-gold text-base transition-colors"
                    >
                      +
                    </button>
                    <span className="text-text-faint text-[11px] ml-2">
                      {formatPrice(unit)} {t("cart.perUnit")}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-border hover:text-error transition-colors self-start"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
        <div className="mt-8 glass-card rounded-xl p-5 flex items-baseline justify-between">
          <span className="text-text-dim text-xs uppercase tracking-wider">
            {t("cart.total")}
          </span>
          <span className="text-gold text-2xl font-bold">
            {formatPrice(total)}
          </span>
        </div>
        <div className="mt-4">
          <Link
            href="/checkout"
            className="block w-full text-center bg-gradient-to-r from-gold to-gold-light text-bg text-sm font-semibold tracking-wider uppercase py-4 rounded-xl transition-all duration-300 shadow-[0_4px_24px_rgba(212,165,74,0.25)]"
          >
            {t("cart.checkout")}
          </Link>
        </div>
      </div>
    </div>
  );
}
