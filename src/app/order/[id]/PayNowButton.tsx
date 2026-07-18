"use client";

import { useState } from "react";
import { useT, useLocale } from "@/i18n/I18nProvider";

/**
 * "Complete payment" for a PENDING order, rendered on the tokened order
 * page. This is the landing target of the abandoned-checkout email and
 * the cancel-page retry: one click re-creates a Stripe Checkout session
 * for the SAME order (no duplicate, no promo double-spend — the API
 * expires the superseded session server-side).
 */
export function PayNowButton({
  orderId,
  orderToken,
}: {
  orderId: string;
  orderToken: string;
}) {
  const t = useT();
  const locale = useLocale();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pay = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, orderToken, locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.url) {
        window.location.assign(data.url);
        return;
      }
      setError(t("ord.payNowErr"));
      setBusy(false);
    } catch {
      setError(t("ord.payNowErr"));
      setBusy(false);
    }
  };

  return (
    <div className="glass-card rounded-xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1">
        <div className="text-text font-semibold text-sm">
          {t("ord.payNowTitle")}
        </div>
        <p className="text-text-dim text-xs mt-1 leading-relaxed">
          {t("ord.payNowSub")}
        </p>
        {error && <p className="text-error text-xs mt-2">{error}</p>}
      </div>
      <button
        onClick={pay}
        disabled={busy}
        className="shrink-0 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-[0.15em] uppercase px-5 py-3 rounded-lg shadow-[0_4px_20px_rgba(212,165,74,0.25)] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {busy ? t("ord.payNowBusy") : t("ord.payNow")}
      </button>
    </div>
  );
}
