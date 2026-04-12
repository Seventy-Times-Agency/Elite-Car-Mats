import { Metadata } from "next";

export const metadata: Metadata = {
  title: "О нас",
  description: "Elite Car Mats — премиальные EVA коврики для автомобилей",
};

const values = [
  {
    title: "Качество",
    description: "Только премиальный EVA материал от проверенных поставщиков",
  },
  {
    title: "Точность",
    description: "Индивидуальный раскрой под каждую модель авто по 3D-лекалам",
  },
  {
    title: "Стиль",
    description: "Элегантный дизайн, который подчёркивает статус вашего авто",
  },
  {
    title: "Сервис",
    description: "Быстрая доставка, гарантия 2 года и поддержка клиентов",
  },
];

export default function AboutPage() {
  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl lg:text-5xl font-bold text-brand-white">
            О <span className="text-gradient-gold">Elite Car Mats</span>
          </h1>
          <p className="mt-6 text-lg text-brand-text-muted max-w-2xl mx-auto leading-relaxed">
            Мы создаём премиальные автомобильные коврики из EVA материала,
            которые сочетают безупречное качество, идеальную посадку и
            стильный дизайн.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-brand-dark-light border border-brand-gray/30 rounded-2xl p-8 lg:p-12 mb-12">
          <h2 className="text-2xl font-bold text-brand-white mb-4">
            Наша миссия
          </h2>
          <p className="text-brand-text-muted leading-relaxed">
            Дать каждому автовладельцу возможность защитить салон своего
            автомобиля с помощью ковриков элитного класса. Мы верим, что
            качественные аксессуары не должны стоить целое состояние — поэтому
            предлагаем премиальное качество по доступной цене.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {values.map((value) => (
            <div
              key={value.title}
              className="bg-brand-dark border border-brand-gray/30 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-brand-gold">
                {value.title}
              </h3>
              <p className="mt-2 text-brand-text-muted text-sm">
                {value.description}
              </p>
            </div>
          ))}
        </div>

        {/* About EVA */}
        <div className="bg-brand-dark-light border border-brand-gold/20 rounded-2xl p-8 lg:p-12 border-glow-gold">
          <h2 className="text-2xl font-bold text-brand-white mb-4">
            Что такое EVA?
          </h2>
          <p className="text-brand-text-muted leading-relaxed mb-4">
            EVA (этиленвинилацетат) — это современный полимерный материал,
            который широко используется в производстве спортивной обуви,
            детских площадок и медицинских изделий.
          </p>
          <ul className="space-y-2 text-brand-text-muted text-sm">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
              Водонепроницаемый — не пропускает влагу
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
              Износостойкий — служит до 5 лет
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
              Экологичный — безопасен для здоровья
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
              Лёгкий в уходе — моется водой
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
              Без запаха — в отличие от резиновых ковриков
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
