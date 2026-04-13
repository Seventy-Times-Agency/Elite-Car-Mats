"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  { q: "Что такое EVA коврики?", a: "EVA (этиленвинилацетат) — современный полимерный материал, используемый в спортивной обуви и детских площадках. Водонепроницаемый, лёгкий, без запаха, служит до 5 лет." },
  { q: "Как подобрать коврики для моего авто?", a: "Используйте конфигуратор — выберите марку, модель и год. Мы подберём комплект, который встанет идеально по лекалам." },
  { q: "Какие комплекты доступны?", a: "4 варианта: передние (Front Set), полный комплект (Full Set), багажник (Cargo Liner) и полный + багажник (Full Set + Cargo Liner)." },
  { q: "Как ухаживать за ковриками?", a: "Промойте водой из шланга или протрите тряпкой. EVA не впитывает влагу и быстро сохнет." },
  { q: "Какая гарантия?", a: "2 года на все коврики. Дефект материала или изготовления — заменим бесплатно." },
  { q: "Сколько времени занимает доставка?", a: "Отправка в течение 48 часов. По территории США — 3-7 рабочих дней. Трек-номер прилагается." },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 lg:py-32 bg-light">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="section-label">FAQ</span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold text-text-primary">Частые вопросы</h2>
        </motion.div>

        <div className="border-t border-light-border">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-light-border">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between py-5 text-left group"
              >
                <span className="text-text-primary text-sm font-medium pr-8 group-hover:text-gold transition-colors duration-300">
                  {faq.q}
                </span>
                <motion.span
                  animate={{ rotate: openIndex === index ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-gold text-lg shrink-0"
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 pr-12 text-text-secondary text-sm leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
