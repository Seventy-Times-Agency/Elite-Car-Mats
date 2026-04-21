const materials = [
  {
    label: "EVA base",
    title: "EVA премиум",
    spec: "10 мм, закрытоячеистая структура",
    desc: "Пена этилен-винилацетат медицинского класса — та же, что в спортивной обуви и ортопедических стельках. Не впитывает воду, не пахнет, не выделяет летучих веществ. Стабильна от −40°C до +70°C.",
    facts: ["Плотность 100 кг/м³", "5–7 лет службы", "Соответствует REACH"],
    pattern: "honeycomb",
  },
  {
    label: "Edge",
    title: "Окантовка",
    spec: "Мягкий ПВХ, 8 мм профиль",
    desc: "Бортик по периметру удерживает внутри до 1,5 литров воды, грязи и снега. Доступна в 4 цветах: чёрная, серая, золотая и красная. Пришивается двойной строчкой поверх коврика.",
    facts: ["Высота бортика 30 мм", "4 цвета на выбор", "Не ломается на морозе"],
    pattern: "stripes",
  },
  {
    label: "Thread & tag",
    title: "Нить и шильдик",
    spec: "Полиэстер 40S/2, металлический логотип",
    desc: "Высокопрочная автомобильная нить не выгорает и не гниёт. Металлический шильдик марки авто на переднем коврике водителя — тонкая деталь, которая отличает премиум от массового продукта.",
    facts: ["UV-стойкая нить", "Шильдики 30+ марок", "Нашивка ELITECARMATS.US"],
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
    <section className="py-24 lg:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="section-label">Материалы</span>
          <h2 className="mt-4 text-3xl lg:text-5xl font-bold">Из чего сделан ваш комплект</h2>
          <p className="mt-5 text-text-dim text-base max-w-2xl mx-auto leading-relaxed">
            Три составляющих премиум-коврика. Каждая выбрана по спецификации — не по цене.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {materials.map((m) => (
            <div key={m.title} className="group glass-card rounded-2xl overflow-hidden flex flex-col">
              <div className="relative aspect-[4/3] bg-gradient-to-br from-bg-elevated to-bg border-b border-border/40 overflow-hidden">
                <PatternFill kind={m.pattern} />
                <div className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.2em] text-gold/70 font-semibold">
                  {m.label}
                </div>
                <div className="absolute bottom-4 right-4 text-[9px] uppercase tracking-[0.15em] text-text-faint">
                  Фото скоро
                </div>
              </div>
              <div className="p-7 flex-1 flex flex-col">
                <h3 className="text-xl font-semibold group-hover:text-gold transition-colors">{m.title}</h3>
                <p className="mt-1 text-gold/70 text-[11px] uppercase tracking-wider font-mono">{m.spec}</p>
                <p className="mt-4 text-text-dim text-sm leading-relaxed">{m.desc}</p>
                <ul className="mt-5 pt-5 border-t border-border/30 space-y-2">
                  {m.facts.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-xs text-text-dim">
                      <span className="w-1 h-1 rounded-full bg-gold shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
