"use client";

import { useT } from "@/i18n/I18nProvider";
import {
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_HREF,
  WHATSAPP_HREF,
  FACEBOOK_URL,
  INSTAGRAM_URL,
} from "@/lib/contacts";
import {
  WhatsAppIcon,
  FacebookIcon,
  InstagramIcon,
} from "@/components/common/ContactIcons";

/**
 * Slim accent bar that sits above the sticky header. Two jobs:
 *
 *  - trust items (ships from / free shipping / returns) — desktop only,
 *    the same info lives in the footer for everyone;
 *  - contact strip (click-to-call phone + WhatsApp + socials) — ALWAYS
 *    visible, every screen size. One tap reaches a human for any
 *    question: orders, returns, sizing.
 */
export function AnnouncementBar() {
  const t = useT();
  return (
    <div
      role="region"
      aria-label={t("ann.aria")}
      className="block bg-bg-deep/95 border-b border-gold/10 text-text-faint"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-center md:justify-between gap-x-6 text-[10.5px] uppercase tracking-[0.18em] font-semibold">
        {/* Trust items — desktop only. */}
        <div className="hidden md:flex items-center gap-x-4">
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

        {/* Contact strip — phone + WhatsApp + socials, every screen. */}
        <div className="flex items-center gap-x-3.5">
          <a
            href={CONTACT_PHONE_HREF}
            className="inline-flex items-center gap-1.5 text-gold/90 hover:text-gold transition-colors normal-case tracking-normal text-[12px] font-bold"
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
          <span className="text-border/60" aria-hidden>
            ·
          </span>
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="text-text-dim hover:text-gold transition-colors"
          >
            <WhatsAppIcon className="w-3.5 h-3.5" />
          </a>
          {INSTAGRAM_URL && (
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-text-dim hover:text-gold transition-colors"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
            </a>
          )}
          {FACEBOOK_URL && (
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-text-dim hover:text-gold transition-colors"
            >
              <FacebookIcon className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
