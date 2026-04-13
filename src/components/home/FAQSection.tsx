"use client";
import { useState } from "react";

const faqs = [
  { q: "Что такое EVA коврики?", a: "EVA — современный полимер из спортивной обуви. Водонепроницаемый, без запаха, до 5 лет службы." },
  { q: "Как подобрать коврики?", a: "Конфигуратор на главной — выберите марку, модель и год." },
  { q: "Какие комплекты?", a: "Передние, полный, багажник и полный + багажник." },
  { q: "Как ухаживать?", a: "Промойте водой. Не впитывает влагу, быстро сохнет." },
  { q: "Гарантия?", a: "2 года. Дефект — заменим бесплатно." },
  { q: "Сроки доставки?", a: "Отправка за 48 часов. По США — 3-7 дней с трек-номером." },
];

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="section-label">FAQ</span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold">Частые вопросы</h2>
        </div>
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <div key={i} className={`glass-card rounded-xl overflow-hidden transition-all duration-300 ${openIdx === i ? "border-gold/20" : ""}`}>
              <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left group">
                <span className="text-text text-sm font-medium pr-6 group-hover:text-gold transition-colors">{f.q}</span>
                <span className={`text-gold text-lg shrink-0 transition-transform duration-200 ${openIdx === i ? "rotate-45" : ""}`}>+</span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openIdx === i ? "max-h-40 opacity-100 px-5 pb-5" : "max-h-0 opacity-0"}`}>
                <p className="text-text-dim text-sm leading-relaxed">{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
