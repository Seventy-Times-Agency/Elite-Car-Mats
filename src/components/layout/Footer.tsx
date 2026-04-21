"use client";

import Link from "next/link";
import { NewsletterForm } from "./NewsletterForm";
import { useT } from "@/i18n/I18nProvider";

export function Footer() {
  const t = useT();
  const cols = [
    {
      t: t("footer.navTitle"),
      items: [
        { h: "/catalog", l: t("nav.catalog") },
        { h: "/about", l: t("footer.navAbout") },
        { h: "/contacts", l: t("nav.contact") },
        { h: "/track", l: t("nav.track") },
      ],
    },
    {
      t: t("footer.infoTitle"),
      items: [
        { h: "/delivery", l: t("footer.infoShip") },
        { h: "/warranty", l: t("footer.infoWarranty") },
        { h: "/refund", l: t("footer.infoReturns") },
        { h: "/privacy", l: t("footer.infoPrivacy") },
        { h: "/terms", l: t("footer.infoTerms") },
      ],
    },
  ];
  return (
    <footer className="border-t border-border/50">
      <div className="h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <span className="font-bold text-xl tracking-[0.12em] uppercase">
              Elite<span className="text-gold">Car</span>Mats
            </span>
            <p className="mt-4 text-text-dim text-sm leading-relaxed">
              {t("footer.tagline")}
            </p>
            <div className="mt-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold/60 font-semibold mb-3">
                {t("footer.launchUpdates")}
              </p>
              <NewsletterForm />
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.t}>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-gold/60 font-semibold mb-4">
                {col.t}
              </h3>
              <ul className="space-y-2.5">
                {col.items.map((i) => (
                  <li key={i.h}>
                    <Link
                      href={i.h}
                      className="text-text-dim hover:text-gold transition-colors text-sm"
                    >
                      {i.l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-gold/60 font-semibold mb-4">
              {t("footer.contactTitle")}
            </h3>
            <ul className="space-y-2.5 text-sm text-text-dim">
              <li>
                <a
                  href="mailto:info@elitecarmats.us"
                  className="hover:text-gold transition-colors"
                >
                  info@elitecarmats.us
                </a>
              </li>
              <li>Rochester, NY, USA</li>
              <li className="pt-2">
                <Link
                  href="/contacts"
                  className="text-gold/80 hover:text-gold text-xs uppercase tracking-wider"
                >
                  {t("footer.allContacts")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-text-faint text-xs tracking-wide">
          <div>
            © {new Date().getFullYear()} Elite Car Mats. {t("footer.rights")}
          </div>
          <div className="text-[10px] uppercase tracking-[0.15em]">
            {t("footer.madeIn")}
          </div>
        </div>
      </div>
    </footer>
  );
}
