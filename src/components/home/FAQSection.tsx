"use client";

import { useState } from "react";

const faqs = [
  {
    question: "Что такое EVA коврики?",
    answer:
      "EVA (этиленвинилацетат) — это современный полимерный материал, который используется в производстве спортивной обуви и детских площадок. Он водонепроницаемый, лёгкий, не имеет запаха и служит до 5 лет.",
  },
  {
    question: "Как подобрать коврики для моего автомобиля?",
    answer:
      "Используйте наш конфигуратор — выберите марку, модель и год выпуска вашего авто. Мы подберём идеальный комплект, который встанет точно по лекалам вашего автомобиля.",
  },
  {
    question: "Какие комплекты доступны?",
    answer:
      "Мы предлагаем 4 варианта: передние коврики (Front Set), полный комплект салона (Full Set), коврик в багажник (Cargo Liner) и полный комплект с багажником (Full Set + Cargo Liner).",
  },
  {
    question: "Как ухаживать за ковриками?",
    answer:
      "EVA коврики очень просты в уходе — достаточно промыть водой из шланга или протереть влажной тряпкой. Они не впитывают влагу и быстро сохнут.",
  },
  {
    question: "Какая гарантия?",
    answer:
      "Мы предоставляем гарантию 2 года на все наши коврики. Если в течение этого срока обнаружится дефект материала или изготовления, мы заменим коврик бесплатно.",
  },
  {
    question: "Сколько времени занимает доставка?",
    answer:
      "Стандартные заказы отправляются в течение 48 часов. Доставка по территории США занимает 3-7 рабочих дней в зависимости от региона. Вы получите трек-номер для отслеживания.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 lg:py-24 bg-brand-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-brand-white">
            Частые <span className="text-gradient-gold">вопросы</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-brand-gray/30 rounded-xl overflow-hidden"
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="w-full flex items-center justify-between p-5 text-left hover:bg-brand-dark-light transition-colors"
              >
                <span className="text-brand-text font-medium text-sm lg:text-base pr-4">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-brand-gold shrink-0 transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-5 pb-5">
                  <p className="text-brand-text-muted text-sm leading-relaxed">
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
