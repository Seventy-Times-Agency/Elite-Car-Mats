"use client";

import { useState } from "react";

const faqs = [
  {
    question: "Что такое EVA коврики?",
    answer: "EVA (этиленвинилацетат) — современный полимерный материал, который используется в спортивной обуви и детских площадках. Водонепроницаемый, лёгкий, без запаха, служит до 5 лет.",
  },
  {
    question: "Как подобрать коврики для моего авто?",
    answer: "Используйте конфигуратор на главной странице — выберите марку, модель и год. Мы подберём комплект, который встанет идеально по лекалам вашего авто.",
  },
  {
    question: "Какие комплекты доступны?",
    answer: "4 варианта: передние коврики (Front Set), полный комплект салона (Full Set), коврик в багажник (Cargo Liner) и полный комплект с багажником (Full Set + Cargo Liner).",
  },
  {
    question: "Как ухаживать за ковриками?",
    answer: "Промойте водой из шланга или протрите влажной тряпкой. EVA не впитывает влагу и быстро сохнет.",
  },
  {
    question: "Какая гарантия?",
    answer: "2 года на все коврики. Если обнаружится дефект материала или изготовления — заменим бесплатно.",
  },
  {
    question: "Сколько времени занимает доставка?",
    answer: "Отправка в течение 48 часов. По территории США — 3-7 рабочих дней. Вы получите трек-номер.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 lg:py-28 bg-brand-offwhite">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-brand-gold text-sm tracking-[0.3em] uppercase font-medium mb-3">
            FAQ
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-brand-black">
            Частые вопросы
          </h2>
        </div>

        <div className="divide-y divide-brand-gray-200 border-t border-b border-brand-gray-200">
          {faqs.map((faq, index) => (
            <div key={index}>
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between py-5 text-left group"
              >
                <span className="text-brand-black text-sm font-medium pr-8 group-hover:text-brand-gold transition-colors">
                  {faq.question}
                </span>
                <span className={`text-brand-gold text-lg shrink-0 transition-transform duration-200 ${openIndex === index ? "rotate-45" : ""}`}>
                  +
                </span>
              </button>
              {openIndex === index && (
                <div className="pb-5 pr-12">
                  <p className="text-brand-text-secondary text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
