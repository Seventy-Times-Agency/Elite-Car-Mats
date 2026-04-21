import { Reveal } from "@/components/common/Reveal";

const items = [
  { brand: "Toyota", model: "Camry", brandSlug: "toyota", modelSlug: "camry", year: "2023", tag: "Full Set + Cargo", color: "gold" },
  { brand: "BMW", model: "X5", brandSlug: "bmw", modelSlug: "x5", year: "2024", tag: "Full Set", color: "red" },
  { brand: "Tesla", model: "Model Y", brandSlug: "tesla", modelSlug: "model-y", year: "2024", tag: "Full Set + Cargo", color: "gray" },
  { brand: "Ford", model: "F-150", brandSlug: "ford", modelSlug: "f-150", year: "2023", tag: "Fronts + Cargo", color: "black" },
  { brand: "Audi", model: "Q5", brandSlug: "audi", modelSlug: "q5", year: "2024", tag: "Full Set", color: "gold" },
  { brand: "Mercedes", model: "GLE", brandSlug: "mercedes", modelSlug: "gle", year: "2023", tag: "Full Set + Cargo", color: "red" },
];

const edgeColors: Record<string, string> = {
  gold: "#D4A54A",
  red: "#DC2626",
  gray: "#6B7280",
  black: "#1A1A1A",
};

function MatSilhouette({ edge }: { edge: string }) {
  return (
    <svg viewBox="0 0 200 140" className="absolute inset-0 m-auto w-3/4 h-3/4" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id={`mat-hex-${edge}`} x="0" y="0" width="12" height="21" patternUnits="userSpaceOnUse">
          <path d="M6 0 L12 3.5 L12 10.5 L6 14 L0 10.5 L0 3.5 Z" stroke="#2a2a2a" strokeWidth="0.5" fill="#0A0A0A" />
        </pattern>
      </defs>
      <path
        d="M20 15 Q25 8 40 8 L160 8 Q175 8 180 15 L190 125 Q190 132 182 132 L18 132 Q10 132 10 125 Z"
        fill={`url(#mat-hex-${edge})`}
        stroke={edge}
        strokeWidth="3"
      />
      <circle cx="45" cy="30" r="5" fill={edge} opacity="0.7" />
    </svg>
  );
}

export function GallerySection() {
  return (
    <section className="py-14 lg:py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.015] to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-10 gap-6">
          <div>
            <span className="section-label">Our Work</span>
            <h2 className="mt-4 text-3xl lg:text-4xl font-bold">Sets built for different rides</h2>
            <p className="mt-3 text-text-dim text-base max-w-xl leading-relaxed">
              A sample of popular sets from our catalog. Every pattern is cut for a specific model and year.
            </p>
          </div>
          <a
            href="/catalog"
            className="inline-flex items-center gap-2 text-gold hover:text-gold-light text-sm uppercase tracking-[0.15em] font-medium transition-colors shrink-0"
          >
            Full catalog
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((it) => (
            <a
              href={`/catalog/${it.brandSlug}/${it.modelSlug}`}
              key={`${it.brand}-${it.model}`}
              className="group glass-card glow-hover rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[4/3] bg-gradient-to-br from-bg-elevated via-bg to-bg-elevated border-b border-border/30 overflow-hidden">
                <div
                  className="absolute inset-0 opacity-[0.08] transition-opacity duration-500 group-hover:opacity-[0.14]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='104' viewBox='0 0 60 104' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L60 17.32 L60 51.96 L30 69.28 L0 51.96 L0 17.32 Z' stroke='%23D4A54A' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
                  }}
                />
                <MatSilhouette edge={edgeColors[it.color]} />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: edgeColors[it.color] }} />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-text-dim">Preview</span>
                </div>
                <div className="absolute top-4 right-4 text-[9px] uppercase tracking-[0.15em] text-text-faint">
                  Photo coming
                </div>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="inline-flex items-center gap-1.5 bg-gold text-bg text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-[0_4px_16px_rgba(212,165,74,0.4)]">
                    Order
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </div>
              </div>
              <div className="p-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-text group-hover:text-gold transition-colors">
                      {it.brand} {it.model}
                    </h3>
                    <span className="text-text-faint text-xs">{it.year}</span>
                  </div>
                  <p className="mt-1 text-text-dim text-xs">{it.tag}</p>
                </div>
                <span className="text-gold text-sm font-semibold shrink-0 mt-0.5">$100</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
