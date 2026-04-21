export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-24 lg:py-40 border-b border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.04] to-transparent pointer-events-none" aria-hidden />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <span className="section-label">About Us</span>
          <h1 className="mt-5 text-4xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
            Floor mats that<br />
            <span className="text-gold-gradient">speak for your car</span>
          </h1>
          <p className="mt-8 text-text-dim text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            Elite Car Mats is an American brand of premium EVA floor mats. We turn an accessory that most people
            treat as an afterthought into a piece of engineering precision and design.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-28">
              <span className="section-label">Our Story</span>
              <h2 className="mt-4 text-3xl lg:text-4xl font-bold leading-tight">From a Rochester garage to a national brand</h2>
            </div>
            <div className="space-y-5 text-text-dim text-[15px] lg:text-base leading-relaxed">
              <p>
                Elite Car Mats was founded in 2023 in a small garage in Rochester, New York. The founders — Eastern
                European immigrants — came to the U.S. with two core values: a love for cars and German-grade
                attention to detail. They noticed the American floor-mat market was stuck between cheap rubber from
                big-box stores and prohibitively expensive OEM carpet from dealerships.
              </p>
              <p>
                We decided to fill that gap with an honest product: premium-grade EVA, custom patterns for every VIN
                range, flawless edge trim, and a design worthy of premium brands. No universal &ldquo;one-size-fits-all&rdquo;
                mats — only the precise floor geometry of a specific model and year.
              </p>
              <p>
                Today our catalog covers 40+ brands and 300+ models — from the Toyota Camry to the Rolls-Royce
                Cullinan, from the Ford F-150 to the Tesla Cybertruck. We ship to all 50 states, and every order is
                hand-packed with a personal thank-you note.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-28 border-t border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-label">Principles</span>
            <h2 className="mt-4 text-3xl lg:text-4xl font-bold">What sets Elite Car Mats apart</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { t: "Precision fit", d: "Patterns cut to within ±2 mm of the floor geometry of each model. Mats sit like factory — no gaps, no pedal interference." },
              { t: "Premium EVA", d: "Density of 75–80 kg/m³ — 1.5× more than budget mats. The honeycomb structure holds up to 1.5 liters of moisture and dirt." },
              { t: "Handcrafted", d: "Edges are stitched by hand on an industrial machine. No heat-welds — only a proper thread seam that won't unravel for years." },
              { t: "Factory-direct", d: "We make them, we sell them. Between our factory and your car there's only a box and FedEx — no middlemen, no markups." },
            ].map((v, i) => (
              <div key={v.t} className="glass-card rounded-2xl p-7 relative overflow-hidden group hover:border-gold/30 transition-colors">
                <div className="text-[10px] text-gold/40 font-semibold tracking-[0.25em] mb-4">0{i + 1}</div>
                <h3 className="text-gold font-semibold text-lg mb-3">{v.t}</h3>
                <p className="text-text-dim text-sm leading-relaxed">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Material */}
      <section className="py-20 lg:py-28 border-t border-border/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="section-label">Material</span>
              <h2 className="mt-4 text-3xl lg:text-4xl font-bold leading-tight">Why EVA</h2>
              <p className="mt-6 text-text-dim text-[15px] leading-relaxed">
                Ethylene-vinyl acetate is a polymer from the world of professional sports and orthopedics. It's used
                in Nike soles, orthopedic insoles, and life vests. A material that handles extreme loads turned out
                to be a perfect fit for a car interior.
              </p>
              <p className="mt-4 text-text-dim text-[15px] leading-relaxed">
                EVA doesn't absorb water, salt, or de-icing chemicals. It doesn't crack in the cold down to −40°F
                or deform in heat up to 160°F. It weighs 3× less than rubber and doesn't produce the usual rubbery
                smell inside a closed car.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-8 lg:p-10 border-gold/20">
              <div className="text-[10px] text-gold font-semibold tracking-[0.25em] mb-6">TECHNICAL SPECS</div>
              <dl className="space-y-4 text-sm">
                {[
                  ["Density", "75–80 kg/m³"],
                  ["Thickness", "10 mm (base) + 3 mm (edge)"],
                  ["Operating temperature", "−40°F to 160°F"],
                  ["Water absorption", "under 3%"],
                  ["Service life", "5–7 years of active use"],
                  ["Certifications", "RoHS, REACH (non-toxic)"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-4 pb-3 border-b border-border/40 last:border-0 last:pb-0">
                    <dt className="text-text-dim">{k}</dt>
                    <dd className="text-text font-medium text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / stats */}
      <section className="py-20 lg:py-28 border-t border-border/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { n: "40+", l: "brands in catalog" },
              { n: "300+", l: "vehicle models" },
              { n: "50", l: "states shipped" },
              { n: "2 years", l: "warranty" },
            ].map((s) => (
              <div key={s.l} className="text-center py-8 glass-card rounded-2xl">
                <div className="text-3xl lg:text-5xl font-bold text-gold-gradient">{s.n}</div>
                <div className="mt-2 text-text-dim text-[11px] lg:text-xs uppercase tracking-[0.18em]">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 border-t border-border/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
            Ready to protect your interior <span className="text-gold-gradient">the right way?</span>
          </h2>
          <p className="mt-5 text-text-dim text-base max-w-xl mx-auto">
            Open the catalog and find mats for your car in just a couple of minutes.
          </p>
          <a
            href="/catalog"
            className="mt-8 inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-gold to-gold-light text-bg text-sm font-semibold tracking-[0.15em] uppercase shadow-[0_4px_24px_rgba(212,165,74,0.3)] hover:shadow-[0_6px_32px_rgba(212,165,74,0.45)] transition-all"
          >
            Open catalog →
          </a>
        </div>
      </section>
    </div>
  );
}
