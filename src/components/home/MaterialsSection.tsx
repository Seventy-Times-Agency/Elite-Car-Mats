import { Reveal } from "@/components/common/Reveal";

const materials = [
  {
    label: "EVA base",
    title: "Premium EVA",
    spec: "10 mm, closed-cell structure",
    desc: "Medical-grade ethylene-vinyl acetate foam — the same material used in athletic footwear and orthopedic insoles. Zero water absorption, odorless, VOC-free. Stable from −40°F to 160°F.",
    facts: ["Density 100 kg/m³", "5–7 year service life", "REACH compliant"],
    pattern: "honeycomb",
  },
  {
    label: "Edge",
    title: "Trim",
    spec: "Soft PVC, 8 mm profile",
    desc: "The raised perimeter edge contains up to 1.5 liters of water, dirt, and snow. Available in 4 colors: black, gray, gold, and red. Double-stitched onto the top of the mat.",
    facts: ["30 mm edge height", "4 color options", "Cold-resistant, no cracking"],
    pattern: "stripes",
  },
  {
    label: "Thread & tag",
    title: "Thread & Badge",
    spec: "Polyester 40S/2, metal logo",
    desc: "Heavy-duty automotive thread won't fade or rot. A metal badge with your car's marque sits on the driver's front mat — the quiet detail that separates premium from mass-market.",
    facts: ["UV-resistant thread", "30+ brand badges", "ELITECARMATS.US side tag"],
    pattern: "diagonal",
  },
];

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

export function MaterialsSection() {
  return (
    <section className="py-14 lg:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-10">
          <span className="section-label">Materials</span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold">What your set is made of</h2>
          <p className="mt-3 text-text-dim text-base max-w-2xl mx-auto leading-relaxed">
            Three components of a premium mat. Each chosen by spec — not by price.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {materials.map((m) => (
            <a href="#configurator" key={m.title} className="group glass-card glow-hover rounded-2xl overflow-hidden flex flex-col">
              <div className="relative aspect-[4/3] bg-gradient-to-br from-bg-elevated to-bg border-b border-border/40 overflow-hidden">
                <PatternFill kind={m.pattern} />
                <div className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.2em] text-gold font-semibold">
                  {m.label}
                </div>
                <div className="absolute bottom-4 right-4 text-[9px] uppercase tracking-[0.15em] text-text-faint">
                  Photo coming soon
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
            Pick materials for your car
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
