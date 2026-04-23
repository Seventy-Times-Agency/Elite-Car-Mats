"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useT } from "@/i18n/I18nProvider";

export default function CheckoutCancelPage() {
  const t = useT();
  const sp = useSearchParams();
  const orderNumber = sp?.get("order") ?? "";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-full border border-border/70 text-text-faint flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">{t("pay.cancelTitle")}</h1>
        <p className="mt-3 text-text-dim text-sm leading-relaxed">
          {t("pay.cancelSub")}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/checkout"
            className="bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-[0.15em] uppercase px-5 py-3 rounded-lg shadow-[0_4px_20px_rgba(212,165,74,0.25)]"
          >
            {t("pay.tryAgain")}
          </Link>
          {orderNumber && (
            <Link
              href={`/order/${orderNumber}`}
              className="glass-card text-text-dim hover:text-gold text-xs font-semibold tracking-[0.15em] uppercase px-5 py-3 rounded-lg transition-colors"
            >
              {t("pay.viewOrder")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
