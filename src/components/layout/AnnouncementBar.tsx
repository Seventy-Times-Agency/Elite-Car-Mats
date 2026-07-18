"use client";

import { useT } from "@/i18n/I18nProvider";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_HREF } from "@/lib/contacts";

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
      className="block bg-bg-deep/95 border-b border-gold/10 text-text-faint"
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
        <span className="hidden md:inline text-border/60" aria-hidden>
          ·
        </span>
        {/* One tap to a human — same number answers calls and WhatsApp. */}
        <a
          href={CONTACT_PHONE_HREF}
          className="hidden md:inline-flex items-center gap-1.5 text-gold/80 hover:text-gold transition-colors"
        >
          <svg
            className="w-3 h-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
            />
          </svg>
          {CONTACT_PHONE_DISPLAY}
        </a>
      </div>
    </div>
  );
}
