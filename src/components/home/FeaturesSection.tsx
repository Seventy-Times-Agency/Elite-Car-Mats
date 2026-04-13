"use client";

import { motion } from "framer-motion";

const features = [
  { number: "01", title: "Премиум EVA", desc: "Водонепроницаемый, износостойкий и экологически безопасный материал. Служит до 5 лет." },
  { number: "02", title: "Точная подгонка", desc: "Каждый комплект раскроен по 3D-лекалам вашей модели. Идеальная посадка." },
  { number: "03", title: "Ваш стиль", desc: "Выберите цвет коврика и окантовки. Добавьте шильдик с логотипом марки." },
  { number: "04", title: "Быстрая доставка", desc: "Отправка за 48 часов. Доставка по всей территории США с трек-номером." },
  { number: "05", title: "Гарантия 2 года", desc: "Полная гарантия на материал и изготовление. Дефект — заменим." },
  { number: "06", title: "Лёгкий уход", desc: "Промойте водой — готово. Не впитывают влагу, без запаха." },
];

export function FeaturesSection() {
  return (
    <section className="py-24 lg:py-32 bg-dark eva-pattern relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -left-40 top-1/2 w-80 h-80 bg-gold/[0.04] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="section-label">Преимущества</span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold text-text-inverse">
            Почему Elite Car Mats
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-dark-border">
          {features.map((f, i) => (
            <motion.div
              key={f.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-dark-soft p-8 lg:p-10 group hover:bg-dark-card transition-colors duration-500"
            >
              <span className="text-gold/40 text-xs font-mono tracking-wider">{f.number}</span>
              <h3 className="mt-3 text-lg font-semibold text-text-inverse group-hover:text-gold transition-colors duration-300">
                {f.title}
              </h3>
              <p className="mt-2 text-text-inverse-muted text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
