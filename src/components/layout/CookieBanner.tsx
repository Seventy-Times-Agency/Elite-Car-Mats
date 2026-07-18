"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useT } from "@/i18n/I18nProvider";
import { getConsent, setConsent } from "@/lib/consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const t = useT();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Only a real accepted/rejected choice hides the banner — the old
    // banner stored a bare timestamp with no decline option, so legacy
    // visitors are re-asked once and get an actual choice this time.
    if (getConsent()) return;
    const id = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(id);
  }, []);

  const accept = () => {
    setConsent("accepted");
    setVisible(false);
  };

  // Decline (and the ✕) record a rejection: analytics stays OFF. This is
  // what makes the banner a consent mechanism rather than decoration.
  const decline = () => {
    setConsent("rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label={t("cookies.aria")}
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-4 sm:pb-4 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-3xl flex items-center gap-3 px-4 py-2.5 rounded-xl bg-bg/95 backdrop-blur-xl border border-gold/15 shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-[slideup_0.35s_ease-out]">
        <p className="flex-1 text-text-dim text-[12px] leading-snug">
          {t("cookies.body")}{" "}
          <Link
            href="/privacy"
            className="text-gold hover:text-gold-light underline underline-offset-2 whitespace-nowrap"
          >
            {t("cookies.learnMore")}
          </Link>
        </p>
        <button
          onClick={decline}
          className="shrink-0 text-text-dim hover:text-text text-[11px] font-semibold tracking-wider uppercase px-3 py-2 rounded-lg border border-border/60 hover:border-border-hover transition-colors"
        >
          {t("cookies.decline")}
        </button>
        <button
          onClick={accept}
          className="shrink-0 bg-gradient-to-r from-gold to-gold-light text-bg text-[11px] font-semibold tracking-wider uppercase px-4 py-2 rounded-lg hover:shadow-[0_2px_12px_rgba(212,165,74,0.3)] transition-shadow"
        >
          {t("cookies.accept")}
        </button>
        <button
          onClick={decline}
          aria-label={t("cookies.dismiss")}
          className="shrink-0 text-text-faint hover:text-text-dim transition-colors p-1 -mr-1"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <style>{`
        @keyframes slideup {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
