const features = [
  {
    number: "01",
    title: "Премиум EVA",
    description: "Водонепроницаемый, износостойкий и экологически безопасный материал. Служит до 5 лет.",
  },
  {
    number: "02",
    title: "Точная подгонка",
    description: "Каждый комплект раскроен по 3D-лекалам вашей модели. Идеальная посадка.",
  },
  {
    number: "03",
    title: "Ваш стиль",
    description: "Выберите цвет коврика и окантовки. Добавьте шильдик с логотипом марки.",
  },
  {
    number: "04",
    title: "Быстрая доставка",
    description: "Отправка за 48 часов. Доставка по всей территории США с трек-номером.",
  },
  {
    number: "05",
    title: "Гарантия 2 года",
    description: "Полная гарантия на материал и изготовление. Если есть дефект — заменим.",
  },
  {
    number: "06",
    title: "Лёгкий уход",
    description: "Промойте водой — готово. Не впитывают влагу, не деформируются, без запаха.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 lg:py-28 bg-brand-offwhite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-brand-gold text-sm tracking-[0.3em] uppercase font-medium mb-3">
            Преимущества
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-brand-black">
            Почему Elite Car Mats
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12">
          {features.map((f) => (
            <div key={f.number} className="group">
              <div className="text-brand-gold text-xs font-medium tracking-[0.2em] mb-3">
                {f.number}
              </div>
              <h3 className="text-lg font-semibold text-brand-black mb-2">
                {f.title}
              </h3>
              <p className="text-brand-text-secondary text-sm leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
