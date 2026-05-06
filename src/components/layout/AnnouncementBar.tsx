"use client";

import { useT } from "@/i18n/I18nProvider";

/**
 * Slim accent bar that sits above the sticky header. Communicates the
 * three things first-time visitors care about most: where it ships
 * from, what shipping costs, what the return policy is.
 *
 * Hidden on the smallest screens to keep the LCP element above the
 * fold; the same info lives in the footer for everyone.
 */
export function AnnouncementBar() {
  const t = useT();
  return (
    <div
      role="region"
      aria-label={t("ann.aria")}
      className="hidden sm:block bg-bg-deep/95 border-b border-gold/10 text-text-faint"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-center gap-x-6 gap-y-1 text-[10.5px] uppercase tracking-[0.18em] font-semibold flex-wrap">
        <span className="inline-flex items-center gap-1.5">
          <svg
            className="w-3 h-3 text-gold/70"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
            />
          </svg>
          {t("ann.ships")}
        </span>
        <span className="text-border/60" aria-hidden>
          ·
        </span>
        <span>{t("ann.freeShipping")}</span>
        <span className="text-border/60" aria-hidden>
          ·
        </span>
        <span>{t("ann.returns")}</span>
      </div>
    </div>
  );
}
