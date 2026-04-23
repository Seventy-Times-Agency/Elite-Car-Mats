"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";

export default function CheckoutSuccessPage() {
  const t = useT();
  const sp = useSearchParams();
  const orderNumber = sp?.get("order") ?? "";

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
        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
          {orderNumber && (
            <Link
              href={`/order/${orderNumber}`}
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
