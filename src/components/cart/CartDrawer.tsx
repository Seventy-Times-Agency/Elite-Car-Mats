"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  calculateItemUnitPrice,
  calculateOrderTotal,
  formatPrice,
} from "@/lib/pricing";
import { useT } from "@/i18n/I18nProvider";
import { localizeColor, localizeMatSet } from "@/i18n/labels";
import { TrustBadges } from "@/components/common/TrustBadges";
import { usePriceOverrides } from "@/context/PriceOverridesContext";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    itemsCount,
  } = useCart();
  const t = useT();
  const router = useRouter();
  const priceOverrides = usePriceOverrides();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  // Move focus to the close button when the drawer opens — keeps screen
  // reader / keyboard users oriented.
  useEffect(() => {
    if (isOpen) closeBtnRef.current?.focus();
  }, [isOpen]);

  const subtotal = calculateOrderTotal(items, priceOverrides);

  const goCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        aria-hidden
        className={`fixed inset-0 z-[60] bg-bg/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className={`fixed inset-y-0 right-0 z-[61] w-full sm:w-[440px] bg-gradient-to-br from-bg-elevated via-bg to-bg-elevated border-l border-gold/15 shadow-[-30px_0_80px_rgba(0,0,0,0.7)] flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <h2
              id="cart-drawer-title"
              className="text-sm font-semibold uppercase tracking-[0.2em] text-text"
            >
              {t("cart.title")}
            </h2>
            {itemsCount > 0 && (
              <span className="bg-gold/15 text-gold text-[11px] font-bold px-2 py-0.5 rounded-full">
                {itemsCount}
              </span>
            )}
          </div>
          <button
            ref={closeBtnRef}
            onClick={closeCart}
            aria-label={t("cart.drawerClose")}
            className="text-text-faint hover:text-gold transition-colors p-1.5 rounded-md hover:bg-gold/5"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        {items.length === 0 ? (
          <EmptyState onClose={closeCart} />
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {items.map((item) => {
              const unit = calculateItemUnitPrice(item, priceOverrides);
              return (
                <div
                  key={item.id}
                  className="glass-card rounded-xl p-4 flex gap-3"
                >
                  {/* Color preview tile */}
                  <div className="shrink-0">
                    <div
                      className="w-14 h-14 rounded-lg border border-border/60 shadow-inner relative overflow-hidden"
                      style={{ backgroundColor: item.color.hex }}
                      aria-hidden
                    >
                      <div
                        className="absolute inset-0 border-[3px] rounded-lg"
                        style={{ borderColor: item.edgeColor.hex }}
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-3">
                      <h3 className="text-text font-medium text-sm leading-tight truncate">
                        {item.brandName} {item.modelName}
                      </h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label={t("cart.drawerRemove")}
                        className="text-text-faint hover:text-error transition-colors shrink-0 -mr-1"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 6l12 12M18 6L6 18"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-1.5 text-text-dim text-[11px] leading-snug space-y-0.5">
                      <div>
                        {item.year} ·{" "}
                        {localizeMatSet(t, item.matSetLabel)}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <span
                            className="w-2 h-2 rounded-sm border border-border/60"
                            style={{ backgroundColor: item.color.hex }}
                            aria-hidden
                          />
                          {localizeColor(t, item.color.name)}
                        </span>
                        <span className="text-text-faint">·</span>
                        <span className="inline-flex items-center gap-1">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: item.edgeColor.hex }}
                            aria-hidden
                          />
                          {localizeColor(t, item.edgeColor.name)}
                        </span>
                        {item.badge && (
                          <>
                            <span className="text-text-faint">·</span>
                            <span className="text-gold/90">
                              {item.badge.brandName}
                              {(item.badgeCount ?? 1) > 1
                                ? ` ×${item.badgeCount}`
                                : ""}
                            </span>
                          </>
                        )}
                        {item.heelPad && (
                          <>
                            <span className="text-text-faint">·</span>
                            <span className="text-gold/90">
                              {t("cart.drawerHeelPadChip")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <div className="inline-flex items-center rounded-md border border-border/60 overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          aria-label={t("cart.drawerDecrease")}
                          className="w-9 h-9 text-text-dim hover:bg-gold/8 hover:text-gold transition-colors text-base disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          −
                        </button>
                        <span className="w-9 text-center text-text text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          aria-label={t("cart.drawerIncrease")}
                          className="w-9 h-9 text-text-dim hover:bg-gold/8 hover:text-gold transition-colors text-base"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-gold text-sm font-semibold">
                        {formatPrice(unit * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border/40 px-5 py-4 space-y-3 bg-bg/40">
            <div className="flex justify-between items-baseline">
              <span className="text-text-dim text-xs uppercase tracking-[0.2em]">
                {t("cart.total")}
              </span>
              <span className="text-gold text-2xl font-bold">
                {formatPrice(subtotal)}
              </span>
            </div>
            <button
              onClick={goCheckout}
              className="w-full bg-gradient-to-r from-gold to-gold-light text-bg text-sm font-semibold tracking-wider uppercase py-3.5 rounded-xl shadow-[0_4px_20px_rgba(212,165,74,0.25)] hover:shadow-[0_6px_28px_rgba(212,165,74,0.35)] transition-shadow"
            >
              {t("cart.checkout")}
            </button>
            <button
              onClick={closeCart}
              className="w-full text-text-dim hover:text-gold text-[11px] uppercase tracking-[0.2em] py-1 transition-colors"
            >
              {t("cart.drawerContinue")}
            </button>
            <div className="pt-2">
              <TrustBadges compact />
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

function EmptyState({ onClose }: { onClose: () => void }) {
  const t = useT();
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
      <svg
        viewBox="0 0 24 24"
        className="w-12 h-12 text-text-faint"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.067-.762 2.337-1.835l1.682-6.535A1.125 1.125 0 0021.75 4.5H5.106M7.5 14.25 5.106 4.5M7.5 14.25 4.5 17.25m3-3v3.75a3 3 0 11-6 0v-.75m12.75 0a3 3 0 11-6 0v-.75"
        />
      </svg>
      <h3 className="text-text font-semibold text-base">
        {t("cart.emptyTitle")}
      </h3>
      <p className="text-text-dim text-xs max-w-[18rem]">
        {t("cart.emptySubtitle")}
      </p>
      <Link
        href="/catalog"
        onClick={onClose}
        className="mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-wider uppercase px-5 py-2.5 rounded-lg shadow-[0_2px_12px_rgba(212,165,74,0.25)]"
      >
        {t("cart.toCatalog")}
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </Link>
    </div>
  );
}
