const steps = [
  {
    n: "01",
    title: "Выбор модели",
    desc: "Указываете марку, модель и год — наш конфигуратор мгновенно подбирает подходящее лекало из базы 290+ моделей.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
  {
    n: "02",
    title: "Индивидуальный раскрой",
    desc: "CNC-плоттер режет EVA-плиту по 3D-лекалу с точностью до 1 мм. Каждый коврик точно повторяет форму пола вашего авто.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
      </svg>
    ),
  },
  {
    n: "03",
    title: "Пошив и отделка",
    desc: "Окантовка пристрачивается высокопрочной нитью, ставится шильдик с логотипом марки, нашивка ELITECARMATS.US сбоку.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
      </svg>
    ),
  },
  {
    n: "04",
    title: "Отправка по США",
    desc: "Упаковка в плотный крафт-конверт, отправка USPS или UPS Ground в течение 48 часов. Бесплатная доставка от $99.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375c-.621 0-1.125-.504-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-5.625m-8.25 4.5h-3.75M8.25 3.75H3.375c-.621 0-1.125.504-1.125 1.125v9.75c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125V11.25m-5.625-7.5H14.25m-5.625 0v1.5m0 0V12m-4.5-1.5h15.375c.621 0 1.125.504 1.125 1.125v1.5" />
      </svg>
    ),
  },
];

export function ProcessSection() {
  return (
    <section className="py-14 lg:py-20 relative">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='104' viewBox='0 0 60 104' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L60 17.32 L60 51.96 L30 69.28 L0 51.96 L0 17.32 Z M30 34.64 L60 51.96 M30 34.64 L0 51.96 M30 34.64 L30 0' stroke='%23D4A54A' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`,
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="section-label">Производство</span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold">Как мы делаем ваш комплект</h2>
          <p className="mt-3 text-text-dim text-base max-w-2xl mx-auto leading-relaxed">
            От заявки до упакованной посылки — 4 этапа, каждый с контролем качества. Делаем под заказ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <a key={s.n} href="#configurator" className="relative group block">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[calc(100%-12px)] w-5 h-px bg-gradient-to-r from-gold/50 to-transparent z-10" />
              )}
              <div className="glass-card glow-hover rounded-2xl p-6 h-full flex flex-col">
                <div className="flex items-start justify-between mb-5">
                  <div className="text-gold/50 text-xs font-mono tracking-[0.25em]">{s.n}</div>
                  <div className="text-gold group-hover:text-gold-light transition-colors">{s.icon}</div>
                </div>
                <h3 className="text-base lg:text-lg font-semibold mb-2 group-hover:text-gold transition-colors">{s.title}</h3>
                <p className="text-text-dim text-sm leading-relaxed">{s.desc}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="#configurator"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-gold to-gold-light text-bg px-7 py-3.5 text-sm font-semibold tracking-[0.15em] uppercase rounded-xl shadow-[0_4px_24px_rgba(212,165,74,0.25)] hover:shadow-[0_6px_32px_rgba(212,165,74,0.4)] transition-all"
          >
            Оформить свой комплект
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
