"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";
import { trackEvent } from "@/lib/analytics";
import { useCart } from "@/context/CartContext";
import { clearPendingOrder } from "@/lib/checkout-session";

function SuccessBody() {
  const t = useT();
  const sp = useSearchParams();
  const { clearCart, hydrated } = useCart();
  const orderNumber = sp?.get("order") ?? "";
  const token = sp?.get("t") ?? "";

  // Payment confirmed — NOW the cart can go. Checkout deliberately keeps
  // the cart through the Stripe redirect so a cancelled payment returns
  // to a retryable checkout instead of an empty store. Gated on
  // `hydrated` so the provider's localStorage hydration can't race the
  // clear and resurrect the just-paid cart (clearCart also persists
  // synchronously — this is belt and braces).
  useEffect(() => {
    if (!hydrated || !orderNumber) return;
    clearCart();
    clearPendingOrder();
  }, [hydrated, orderNumber, clearCart]);

  // Meta Pixel: Purchase, with the order total fetched via the tokened
  // order API. eventID = order number so a reloaded success page doesn't
  // double-count on Meta's side. Inert until the pixel is configured.
  useEffect(() => {
    if (!orderNumber || !token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/orders/${encodeURIComponent(orderNumber)}?t=${encodeURIComponent(token)}`,
        );
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const items: { productId?: string; quantity?: number; price?: number }[] =
          Array.isArray(data.items) ? data.items : [];
        const withIds = items.filter((i) => typeof i.productId === "string");
        trackEvent(
          "Purchase",
          {
            value: Number(data.total ?? 0),
            currency: "USD",
            content_type: "product",
            // Feed-format skus so catalog campaigns can match the sale.
            content_ids: withIds.map((i) => `ECM-${i.productId}`),
            contents: withIds.map((i) => ({
              id: `ECM-${i.productId}`,
              quantity: i.quantity ?? 1,
              item_price: Number(i.price ?? 0),
            })),
          },
          `purchase-${orderNumber}`,
        );
      } catch {
        // analytics only — never surface errors on the thank-you page
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderNumber, token]);

  const orderHref = orderNumber
    ? `/order/${encodeURIComponent(orderNumber)}${token ? `?t=${encodeURIComponent(token)}` : ""}`
    : "";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">{t("pay.successTitle")}</h1>
        <p className="mt-3 text-text-dim text-sm leading-relaxed">
          {t("pay.successSub")}
        </p>
        {orderNumber && (
          <div className="mt-5 glass-card rounded-xl p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-gold/70 font-semibold">
              {t("ord.number")}
            </div>
            <div className="mt-1 text-gold text-lg font-bold font-mono">
              {orderNumber}
            </div>
          </div>
        )}
        <div className="mt-4 glass-card rounded-xl p-4 flex items-start gap-3 text-left">
          <svg
            className="w-5 h-5 text-gold shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
          <p className="text-text-dim text-xs leading-relaxed">
            {t("pay.checkEmail")}
          </p>
        </div>
        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
          {orderHref && (
            <Link
              href={orderHref}
              className="bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-[0.15em] uppercase px-5 py-3 rounded-lg shadow-[0_4px_20px_rgba(212,165,74,0.25)]"
            >
              {t("pay.viewOrder")}
            </Link>
          )}
          <Link
            href="/catalog"
            className="glass-card text-text-dim hover:text-gold text-xs font-semibold tracking-[0.15em] uppercase px-5 py-3 rounded-lg transition-colors"
          >
            {t("cart.toCatalog")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <SuccessBody />
    </Suspense>
  );
}
