import type { ModelGuide } from "@/data/model-guides";

/**
 * "About the {brand} {model}" block for the models that have a hand-written
 * guide (see data/model-guides). It is what makes those pages differ from
 * the other ~1 300 model pages beyond the name, so it renders as plain
 * server HTML — no toggles hiding the text from crawlers.
 *
 * Guides exist in English only; the caller passes one only on the English
 * locale, so the copy here is not routed through the dictionary.
 */
export function ModelGuideSection({
  brand,
  model,
  guide,
}: {
  brand: string;
  model: string;
  guide: ModelGuide;
}) {
  return (
    <section
      aria-labelledby="model-guide-heading"
      className="max-w-3xl mx-auto mt-10 lg:mt-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="text-center mb-6">
        <span className="section-label">Vehicle notes</span>
        <h2
          id="model-guide-heading"
          className="mt-3 text-2xl lg:text-3xl font-bold"
        >
          About the {brand} {model}
        </h2>
      </div>

      <div className="glass-card rounded-xl p-5 sm:p-6 space-y-6 text-[15px] leading-relaxed">
        <div className="space-y-3 text-text-dim">
          {guide.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-gold/80">
            Generations
          </h3>
          <ul className="mt-3 space-y-3">
            {guide.generations.map((g) => (
              <li key={g.years} className="flex gap-3">
                <span className="shrink-0 w-24 font-semibold text-text tabular-nums">
                  {g.years}
                </span>
                <span className="text-text-dim">
                  {g.name && (
                    <span className="text-text font-medium">{g.name}. </span>
                  )}
                  {g.note}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-gold/80">
            Before you order
          </h3>
          <ul className="mt-3 space-y-2 list-disc pl-5 text-text-dim marker:text-gold/60">
            {guide.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
