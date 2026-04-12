import { Metadata } from "next";

export const metadata: Metadata = {
  title: "О нас",
  description: "Elite Car Mats — премиальные EVA коврики для автомобилей",
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Header block */}
      <div className="bg-brand-black py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-brand-gold text-sm tracking-[0.3em] uppercase font-medium mb-4">О компании</p>
          <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight">
            Коврики элитного класса для вашего автомобиля
          </h1>
          <p className="mt-6 text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
            Мы создаём премиальные автомобильные коврики из EVA материала, которые сочетают качество, посадку и стиль.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* Mission */}
        <div className="mb-16">
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-brand-gold font-medium mb-4">Наша миссия</h2>
          <p className="text-brand-text-secondary leading-relaxed">
            Дать каждому автовладельцу возможность защитить салон с помощью ковриков элитного класса. Премиальное качество не должно стоить целое состояние.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
          {[
            { title: "Качество", text: "Только премиальный EVA от проверенных поставщиков" },
            { title: "Точность", text: "Индивидуальный раскрой по 3D-лекалам каждой модели" },
            { title: "Стиль", text: "Элегантный дизайн, который подчёркивает статус авто" },
            { title: "Сервис", text: "Быстрая доставка, гарантия и поддержка клиентов" },
          ].map((v) => (
            <div key={v.title}>
              <h3 className="text-brand-black font-semibold mb-2">{v.title}</h3>
              <p className="text-brand-text-secondary text-sm">{v.text}</p>
            </div>
          ))}
        </div>

        {/* EVA */}
        <div className="border border-brand-gold/30 p-8 lg:p-10">
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-brand-gold font-medium mb-4">Что такое EVA</h2>
          <p className="text-brand-text-secondary text-sm leading-relaxed mb-5">
            EVA (этиленвинилацетат) — современный полимер, используемый в спортивной обуви и медицине.
          </p>
          <ul className="space-y-2 text-brand-text-secondary text-sm">
            {[
              "Водонепроницаемый",
              "Износостойкий — до 5 лет",
              "Экологичный и безопасный",
              "Легко моется водой",
              "Без запаха",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="w-1 h-1 bg-brand-gold rounded-full shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
