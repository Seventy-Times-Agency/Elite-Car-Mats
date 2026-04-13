"use client";

import { useState } from "react";

const faqs = [
  { q: "Что такое EVA коврики?", a: "EVA (этиленвинилацетат) — современный полимер, используемый в спортивной обуви. Водонепроницаемый, без запаха, служит до 5 лет." },
  { q: "Как подобрать коврики?", a: "Используйте конфигуратор — выберите марку, модель и год." },
  { q: "Какие комплекты доступны?", a: "Передние, полный комплект, багажник и полный + багажник." },
  { q: "Как ухаживать?", a: "Промойте водой. EVA не впитывает влагу и быстро сохнет." },
  { q: "Какая гарантия?", a: "2 года. Дефект — заменим бесплатно." },
  { q: "Сроки доставки?", a: "Отправка за 48 часов. По США — 3-7 дней. Трек-номер прилагается." },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="section-label">FAQ</span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold text-text-primary">Частые вопросы</h2>
        </div>
        <div className="border-t border-dark-border">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-dark-border">
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between py-5 text-left group">
                <span className="text-text-primary text-sm font-medium pr-8 group-hover:text-gold transition-colors">{faq.q}</span>
                <span className={`text-gold text-lg shrink-0 transition-transform duration-200 ${openIndex === i ? "rotate-45" : ""}`}>+</span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? "max-h-40 opacity-100 pb-5" : "max-h-0 opacity-0"}`}>
                <p className="pr-12 text-text-secondary text-sm leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
