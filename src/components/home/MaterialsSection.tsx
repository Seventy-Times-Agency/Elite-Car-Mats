"use client";

import Image from "next/image";
import { Reveal } from "@/components/common/Reveal";
import { useT } from "@/i18n/I18nProvider";

function PatternFill({ kind }: { kind: string }) {
  if (kind === "honeycomb") {
    return (
      <div
        className="absolute inset-0 opacity-[0.22] transition-opacity duration-500 group-hover:opacity-[0.35]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='84' viewBox='0 0 48 84' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M24 0 L48 14 L48 42 L24 56 L0 42 L0 14 Z' stroke='%23D4A54A' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: "48px 84px",
        }}
      />
    );
  }
  if (kind === "stripes") {
    return (
      <div
        className="absolute inset-0 opacity-[0.15] transition-opacity duration-500 group-hover:opacity-[0.28]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #D4A54A, #D4A54A 2px, transparent 2px, transparent 14px)`,
        }}
      />
    );
  }
  return (
    <div
      className="absolute inset-0 opacity-[0.12] transition-opacity duration-500 group-hover:opacity-[0.22]"
      style={{
        backgroundImage: `linear-gradient(135deg, transparent 45%, #D4A54A 45%, #D4A54A 55%, transparent 55%)`,
        backgroundSize: "32px 32px",
      }}
    />
  );
}

interface MaterialCard {
  label: string;
  title: string;
  spec: string;
  desc: string;
  facts: string[];
  pattern: string;
  /** Optional real photo. When set, replaces the decorative PatternFill. */
  image?: string;
  imageAlt?: string;
}

export function MaterialsSection() {
  const t = useT();
  const materials: MaterialCard[] = [
    {
      label: t("materials.baseLabel"),
      title: t("materials.baseTitle"),
      spec: t("materials.baseSpec"),
      desc: t("materials.baseDesc"),
      facts: [
        t("materials.baseFact1"),
        t("materials.baseFact2"),
        t("materials.baseFact3"),
      ],
      pattern: "honeycomb",
    },
    {
      label: t("materials.edgeLabel"),
      title: t("materials.edgeTitle"),
      spec: t("materials.edgeSpec"),
      desc: t("materials.edgeDesc"),
      facts: [
        t("materials.edgeFact1"),
        t("materials.edgeFact2"),
        t("materials.edgeFact3"),
      ],
      pattern: "stripes",
      image: "/material-edge.jpg",
      imageAlt: t("materials.edgeImageAlt"),
    },
    {
      label: t("materials.threadLabel"),
      title: t("materials.threadTitle"),
      spec: t("materials.threadSpec"),
      desc: t("materials.threadDesc"),
      facts: [
        t("materials.threadFact1"),
        t("materials.threadFact2"),
        t("materials.threadFact3"),
      ],
      pattern: "diagonal",
    },
  ];
  return (
    <section className="py-14 lg:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-10">
          <span className="section-label">{t("materials.label")}</span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold">{t("materials.title")}</h2>
          <p className="mt-3 text-text-dim text-base max-w-2xl mx-auto leading-relaxed">
            {t("materials.subtitle")}
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {materials.map((m) => (
            <a href="#configurator" key={m.title} className="group glass-card glow-hover rounded-2xl overflow-hidden flex flex-col">
              <div className="relative aspect-[4/3] bg-gradient-to-br from-bg-elevated to-bg border-b border-border/40 overflow-hidden">
                {m.image ? (
                  <Image
                    src={m.image}
                    alt={m.imageAlt ?? ""}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <PatternFill kind={m.pattern} />
                )}
                {/* Subtle gradient under the label so it stays legible
                    over a real photo. No-op on the pattern fills. */}
                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />
                <div className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.2em] text-gold font-semibold drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
                  {m.label}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold group-hover:text-gold transition-colors">{m.title}</h3>
                <p className="mt-1 text-gold text-[11px] uppercase tracking-wider font-mono">{m.spec}</p>
                <p className="mt-3 text-text-dim text-sm leading-relaxed">{m.desc}</p>
                <ul className="mt-4 pt-4 border-t border-border/30 space-y-2">
                  {m.facts.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-xs text-text-dim">
                      <span className="w-1 h-1 rounded-full bg-gold shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="#configurator"
            className="inline-flex items-center gap-2 text-gold hover:text-gold-light text-sm uppercase tracking-[0.15em] font-medium transition-colors"
          >
            {t("materials.cta")}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
