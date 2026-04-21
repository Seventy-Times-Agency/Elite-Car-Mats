export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-24 lg:py-40 border-b border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.04] to-transparent pointer-events-none" aria-hidden />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <span className="section-label">О компании</span>
          <h1 className="mt-5 text-4xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
            Коврики, которые<br />
            <span className="text-gold-gradient">подчёркивают статус</span>
          </h1>
          <p className="mt-8 text-text-dim text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            EliteCarMats — американская марка премиальных EVA ковриков. Мы делаем аксессуар, который многие считают
            мелочью, произведением инженерной точности и дизайнерского вкуса.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-28">
              <span className="section-label">Наша история</span>
              <h2 className="mt-4 text-3xl lg:text-4xl font-bold leading-tight">От гаража в Рочестере до национального бренда</h2>
            </div>
            <div className="space-y-5 text-text-dim text-[15px] lg:text-base leading-relaxed">
              <p>
                EliteCarMats родилась в 2023 году в небольшом гараже в Рочестере, штат Нью-Йорк. Основатели — иммигранты
                из Восточной Европы — приехали в США с двумя ценностями: любовь к автомобилям и немецкая педантичность
                в деталях. Они заметили, что американский рынок автоковриков застрял между дешёвой резиной из супермаркета
                и непомерно дорогим OEM-текстилем от дилеров.
              </p>
              <p>
                Мы решили занять эту нишу честным продуктом: материал EVA премиум-класса, индивидуальный раскрой под каждый
                VIN-диапазон, безупречная окантовка и дизайн, достойный премиальных брендов. Никаких универсальных «one-size-fits-all»
                половиков — только точная геометрия пола конкретной модели и года.
              </p>
              <p>
                Сегодня наш каталог охватывает более 40 марок и 300 моделей — от Toyota Camry до Rolls-Royce Cullinan,
                от Ford F-150 до Tesla Cybertruck. Мы отправляем коврики во все 50 штатов, и каждый заказ упаковывается
                вручную с персональной благодарственной запиской.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-28 border-t border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-label">Принципы</span>
            <h2 className="mt-4 text-3xl lg:text-4xl font-bold">Что отличает EliteCarMats</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { t: "Точность посадки", d: "Лекала раскроены с погрешностью ±2 мм по геометрии пола каждой модели. Коврик ложится как родной — без зазоров, без перекрытия педалей." },
              { t: "Премиальный EVA", d: "Плотность 75-80 кг/м³ — в полтора раза больше, чем у бюджетных аналогов. Сотовая структура удерживает до 1,5 литров влаги и грязи." },
              { t: "Ручная сборка", d: "Окантовка прошивается вручную на промышленной машине. Никакой термосварки — только нитяной шов, который не расходится годами." },
              { t: "Прямо с производства", d: "Мы сами производители и сами продавцы. Между заводом и вашей машиной — только упаковка и FedEx. Никаких посредников и наценок." },
            ].map((v, i) => (
              <div key={v.t} className="glass-card rounded-2xl p-7 relative overflow-hidden group hover:border-gold/30 transition-colors">
                <div className="text-[10px] text-gold/40 font-semibold tracking-[0.25em] mb-4">0{i + 1}</div>
                <h3 className="text-gold font-semibold text-lg mb-3">{v.t}</h3>
                <p className="text-text-dim text-sm leading-relaxed">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Material */}
      <section className="py-20 lg:py-28 border-t border-border/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="section-label">Материал</span>
              <h2 className="mt-4 text-3xl lg:text-4xl font-bold leading-tight">Почему именно EVA</h2>
              <p className="mt-6 text-text-dim text-[15px] leading-relaxed">
                Этилен-винилацетат — полимер из мира профессионального спорта и ортопедии. Из него делают подошвы Nike,
                ортопедические стельки и спасательные жилеты. Материал, который справляется с экстремальными нагрузками,
                идеально подошёл для салона автомобиля.
              </p>
              <p className="mt-4 text-text-dim text-[15px] leading-relaxed">
                EVA не впитывает воду, соль и реагенты. Не трескается на морозе до −40°C и не деформируется на жаре до +70°C.
                Весит в 3 раза меньше резины и не издаёт характерного «каучукового» запаха в закрытой машине.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-8 lg:p-10 border-gold/20">
              <div className="text-[10px] text-gold font-semibold tracking-[0.25em] mb-6">ТЕХ. ХАРАКТЕРИСТИКИ</div>
              <dl className="space-y-4 text-sm">
                {[
                  ["Плотность", "75–80 кг/м³"],
                  ["Толщина", "10 мм (основа) + 3 мм (окантовка)"],
                  ["Рабочая температура", "−40°C до +70°C"],
                  ["Водопоглощение", "менее 3%"],
                  ["Срок службы", "5–7 лет активной эксплуатации"],
                  ["Сертификация", "ROHS, REACH (без токсинов)"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-4 pb-3 border-b border-border/40 last:border-0 last:pb-0">
                    <dt className="text-text-dim">{k}</dt>
                    <dd className="text-text font-medium text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / stats */}
      <section className="py-20 lg:py-28 border-t border-border/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { n: "40+", l: "брендов в каталоге" },
              { n: "300+", l: "моделей авто" },
              { n: "50", l: "штатов доставки" },
              { n: "2 года", l: "гарантии" },
            ].map((s) => (
              <div key={s.l} className="text-center py-8 glass-card rounded-2xl">
                <div className="text-3xl lg:text-5xl font-bold text-gold-gradient">{s.n}</div>
                <div className="mt-2 text-text-dim text-[11px] lg:text-xs uppercase tracking-[0.18em]">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 border-t border-border/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
            Готовы защитить салон <span className="text-gold-gradient">достойно?</span>
          </h2>
          <p className="mt-5 text-text-dim text-base max-w-xl mx-auto">
            Откройте каталог и подберите коврики под свою машину за пару минут.
          </p>
          <a
            href="/catalog"
            className="mt-8 inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-gold to-gold-light text-bg text-sm font-semibold tracking-[0.15em] uppercase shadow-[0_4px_24px_rgba(212,165,74,0.3)] hover:shadow-[0_6px_32px_rgba(212,165,74,0.45)] transition-all"
          >
            Открыть каталог →
          </a>
        </div>
      </section>
    </div>
  );
}
