"use client";
import { useState } from "react";
import { useT } from "@/i18n/I18nProvider";
import { FaqJsonLd } from "@/components/seo/ProductJsonLd";

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const t = useT();
  const faqs = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
    { q: t("faq.q6"), a: t("faq.a6") },
    { q: t("faq.q7"), a: t("faq.a7") },
    { q: t("faq.q8"), a: t("faq.a8") },
    { q: t("faq.q9"), a: t("faq.a9") },
    { q: t("faq.q10"), a: t("faq.a10") },
  ];

  return (
    <section className="py-14 lg:py-20">
      <FaqJsonLd items={faqs} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="section-label">{t("faq.label")}</span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold">{t("faq.title")}</h2>
          <p className="mt-3 text-text-dim text-base max-w-xl mx-auto">
            {t("faq.subtitle")}
          </p>
        </div>
        <div className="space-y-2.5">
          {faqs.map((f, i) => (
            <div key={i} className={`glass-card rounded-xl overflow-hidden transition-all duration-300 ${openIdx === i ? "border-gold/25 shadow-[0_4px_24px_rgba(212,165,74,0.08)]" : ""}`}>
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between p-5 lg:p-6 text-left group"
              >
                <span className={`text-text text-[15px] lg:text-base font-medium pr-6 transition-colors ${openIdx === i ? "text-gold" : "group-hover:text-gold"}`}>
                  {f.q}
                </span>
                <span className={`text-gold text-xl shrink-0 transition-transform duration-300 ${openIdx === i ? "rotate-45" : ""}`}>+</span>
              </button>
              <div className={`grid transition-all duration-300 ease-out ${openIdx === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <p className="text-text-dim text-sm lg:text-[15px] leading-relaxed px-5 pb-5 lg:px-6 lg:pb-6">{f.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center glass-card rounded-xl p-7 lg:p-8">
          <p className="text-text-dim text-sm">{t("faq.notFoundQ")}</p>
          <p className="mt-2 text-text text-base">
            {t("faq.notFoundP")}
          </p>
          <a
            href="mailto:info@elitecarmats.us"
            className="mt-5 inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-[0.15em] uppercase shadow-[0_4px_20px_rgba(212,165,74,0.25)] hover:shadow-[0_6px_28px_rgba(212,165,74,0.4)] transition-all"
          >
            info@elitecarmats.us
          </a>
        </div>
      </div>
    </section>
  );
}
