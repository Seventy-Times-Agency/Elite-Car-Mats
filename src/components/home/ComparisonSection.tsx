import { Reveal } from "@/components/common/Reveal";

const rows = [
  { feat: "Точность подгонки", ours: "1 мм (CNC-раскрой по 3D-лекалу)", others: "Универсальный размер, зазоры по краям" },
  { feat: "Материал", ours: "EVA премиум 10 мм, закрытоячеистый", others: "Резина или TPR, впитывает запахи" },
  { feat: "Удержание жидкости", ours: "До 1,5 литров воды и грязи внутри", others: "Стекает на ковролин и обивку" },
  { feat: "Температурный диапазон", ours: "−40°C до +70°C без трещин", others: "Дубеют на морозе, трескаются" },
  { feat: "Вес пары передних", ours: "≈2,2 кг", others: "5–7 кг (резина)" },
  { feat: "Уход", ours: "Промыл из шланга — готов", others: "Пылесос + спецсредства" },
  { feat: "Срок службы", ours: "5–7 лет", others: "1–2 года до разрушения" },
  { feat: "Персонализация", ours: "4 цвета окантовки, шильдик марки", others: "Только чёрный универсал" },
  { feat: "Гарантия", ours: "2 года", others: "30 дней или нет" },
];

export function ComparisonSection() {
  return (
    <section className="py-14 lg:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-10">
          <span className="section-label">Сравнение</span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold">Elite vs обычные коврики</h2>
          <p className="mt-3 text-text-dim text-base max-w-2xl mx-auto leading-relaxed">
            Чем наш комплект отличается от резиновых и универсальных ковриков из автомагазина.
          </p>
        </Reveal>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[1.1fr_1fr_1fr] lg:grid-cols-[1.3fr_1fr_1fr] divide-x divide-border/30">
            <div className="p-5 lg:p-6 bg-bg/50">
              <span className="section-label text-[10px]">Параметр</span>
            </div>
            <div className="p-5 lg:p-6 bg-gold/[0.08] border-b border-gold/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gold shadow-[0_0_8px_rgba(212,165,74,0.6)]" />
                <span className="text-gold font-semibold text-sm uppercase tracking-[0.15em]">Elite Car Mats</span>
              </div>
            </div>
            <div className="p-5 lg:p-6 bg-bg/50">
              <span className="text-text-faint font-semibold text-sm uppercase tracking-[0.15em]">Обычные</span>
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
            Заказать Elite
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
