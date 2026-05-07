"use client";

import { useState } from "react";
import { useT } from "@/i18n/I18nProvider";
import { FaqJsonLd } from "@/components/seo/ProductJsonLd";

/**
 * Product-page FAQ. Six evergreen questions every car-mat shopper asks
 * before adding to cart — written generically so the same component
 * works for every brand/model. Emits Schema.org FAQPage JSON-LD so
 * Google can pull the rich result.
 */
const FAQ_KEYS: { q: string; a: string }[] = [
  { q: "prod.faq.fit.q", a: "prod.faq.fit.a" },
  { q: "prod.faq.material.q", a: "prod.faq.material.a" },
  { q: "prod.faq.lead.q", a: "prod.faq.lead.a" },
  { q: "prod.faq.shipping.q", a: "prod.faq.shipping.a" },
  { q: "prod.faq.wash.q", a: "prod.faq.wash.a" },
  { q: "prod.faq.warranty.q", a: "prod.faq.warranty.a" },
];

export function ProductFaq({ brand, model }: { brand: string; model: string }) {
  const t = useT();
  const [open, setOpen] = useState<number | null>(0);

  const items = FAQ_KEYS.map(({ q, a }) => ({
    q: t(q, { brand, model }),
    a: t(a, { brand, model }),
  }));

  return (
    <section
      aria-labelledby="product-faq-heading"
      className="max-w-3xl mx-auto mt-10 lg:mt-16 px-4 sm:px-6 lg:px-8"
    >
      <FaqJsonLd items={items} />
      <div className="text-center mb-6">
        <span className="section-label">{t("prod.faq.label")}</span>
        <h2
          id="product-faq-heading"
          className="mt-3 text-2xl lg:text-3xl font-bold"
        >
          {t("prod.faq.heading")}
        </h2>
      </div>
      <ul className="space-y-2">
        {items.map((it, i) => {
          const isOpen = open === i;
          return (
            <li
              key={i}
              className="glass-card rounded-xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:text-gold"
              >
                <span className="text-sm font-medium leading-snug pr-2">
                  {it.q}
                </span>
                <svg
                  className={`w-4 h-4 text-text-dim shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
              {isOpen && (
                <div
                  id={`faq-panel-${i}`}
                  className="px-4 pb-4 -mt-1 text-text-dim text-sm leading-relaxed"
                >
                  {it.a}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
