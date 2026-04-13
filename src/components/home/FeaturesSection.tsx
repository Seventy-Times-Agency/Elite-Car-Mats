const features = [
  { n: "01", title: "Премиум EVA", desc: "Водонепроницаемый, износостойкий, экологически безопасный. Служит до 5 лет." },
  { n: "02", title: "Точная подгонка", desc: "Раскрой по 3D-лекалам вашей модели. Идеальная посадка." },
  { n: "03", title: "Ваш стиль", desc: "Цвет коврика, окантовки и шильдик с логотипом марки." },
  { n: "04", title: "Быстрая доставка", desc: "Отправка за 48 часов. По всей территории США с трек-номером." },
  { n: "05", title: "Гарантия 2 года", desc: "Полная гарантия на материал и изготовление." },
  { n: "06", title: "Лёгкий уход", desc: "Промойте водой — готово. Без запаха." },
];

export function FeaturesSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="section-label">Преимущества</span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold text-text-primary">Почему Elite Car Mats</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-dark-border rounded-lg overflow-hidden">
          {features.map((f) => (
            <div key={f.n} className="bg-dark-soft p-8 lg:p-10 group hover:bg-dark-card transition-colors duration-300">
              <span className="text-gold/30 text-xs font-mono tracking-wider">{f.n}</span>
              <h3 className="mt-3 text-lg font-semibold text-text-primary group-hover:text-gold transition-colors duration-300">{f.title}</h3>
              <p className="mt-2 text-text-secondary text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
