import { Reveal } from "@/components/common/Reveal";

const rows = [
  { feat: "Fit accuracy", ours: "1 mm (CNC-cut from 3D pattern)", others: "Universal sizing, gaps along edges" },
  { feat: "Material", ours: "Premium 10 mm closed-cell EVA", others: "Rubber or TPR, absorbs odors" },
  { feat: "Liquid containment", ours: "Up to 1.5 liters of water & mud", others: "Leaks onto carpet and upholstery" },
  { feat: "Temperature range", ours: "−40°F to 160°F, no cracking", others: "Stiffens in cold, cracks under heat" },
  { feat: "Front pair weight", ours: "≈5 lbs", others: "11–15 lbs (rubber)" },
  { feat: "Care", ours: "Rinse with a hose — done", others: "Vacuum + special cleaners" },
  { feat: "Service life", ours: "5–7 years", others: "1–2 years before failure" },
  { feat: "Personalization", ours: "4 edge colors, brand badge", others: "Black one-size-fits-all only" },
  { feat: "Warranty", ours: "2 years", others: "30 days or none" },
];

export function ComparisonSection() {
  return (
    <section className="py-14 lg:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-10">
          <span className="section-label">Comparison</span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold">Elite vs ordinary mats</h2>
          <p className="mt-3 text-text-dim text-base max-w-2xl mx-auto leading-relaxed">
            How our set stacks up against rubber and universal mats from the auto parts store.
          </p>
        </Reveal>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[1.1fr_1fr_1fr] lg:grid-cols-[1.3fr_1fr_1fr] divide-x divide-border/30">
            <div className="p-5 lg:p-6 bg-bg/50">
              <span className="section-label text-[10px]">Feature</span>
            </div>
            <div className="p-5 lg:p-6 bg-gold/[0.08] border-b border-gold/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gold shadow-[0_0_8px_rgba(212,165,74,0.6)]" />
                <span className="text-gold font-semibold text-sm uppercase tracking-[0.15em]">Elite Car Mats</span>
              </div>
            </div>
            <div className="p-5 lg:p-6 bg-bg/50">
              <span className="text-text-faint font-semibold text-sm uppercase tracking-[0.15em]">Ordinary</span>
            </div>
          </div>

          {rows.map((r, i) => (
            <div
              key={r.feat}
              className={`grid grid-cols-[1.1fr_1fr_1fr] lg:grid-cols-[1.3fr_1fr_1fr] divide-x divide-border/30 ${
                i !== rows.length - 1 ? "border-b border-border/20" : ""
              }`}
            >
              <div className="p-5 lg:p-6 text-text-dim text-sm font-medium">{r.feat}</div>
              <div className="p-5 lg:p-6 bg-gold/[0.03]">
                <div className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-gold shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span className="text-text text-sm leading-relaxed">{r.ours}</span>
                </div>
              </div>
              <div className="p-5 lg:p-6">
                <div className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-text-faint shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                  <span className="text-text-dim text-sm leading-relaxed">{r.others}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="#configurator"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-gold to-gold-light text-bg px-7 py-3.5 text-sm font-semibold tracking-[0.15em] uppercase rounded-xl shadow-[0_4px_24px_rgba(212,165,74,0.25)] hover:shadow-[0_6px_32px_rgba(212,165,74,0.4)] transition-all"
          >
            Order Elite
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
