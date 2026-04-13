const features = [
  { icon: "🛡️", title: "Премиум EVA", desc: "Водонепроницаемый, износостойкий, экологичный. До 5 лет службы." },
  { icon: "📐", title: "Точная подгонка", desc: "3D-лекала для каждой модели. Идеальная посадка гарантирована." },
  { icon: "🎨", title: "Ваш стиль", desc: "Выбор цвета, окантовки и шильдика с логотипом марки." },
  { icon: "🚚", title: "Быстрая доставка", desc: "Отправка за 48 часов. По всей территории США." },
  { icon: "✅", title: "Гарантия 2 года", desc: "Полная гарантия на материал и изготовление." },
  { icon: "💧", title: "Лёгкий уход", desc: "Промойте водой — готово. Без запаха, быстро сохнет." },
];

export function FeaturesSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="section-label">Преимущества</span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold">Почему Elite Car Mats</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="glass-card glow-hover rounded-xl p-7 group">
              <div className="text-2xl mb-4">{f.icon}</div>
              <h3 className="text-base font-semibold group-hover:text-gold transition-colors duration-300">{f.title}</h3>
              <p className="mt-2 text-text-dim text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
