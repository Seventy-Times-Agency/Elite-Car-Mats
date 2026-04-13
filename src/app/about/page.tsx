export default function AboutPage() {
  return (
    <div>
      <section className="bg-dark eva-pattern py-24 lg:py-32">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <span className="section-label">О компании</span>
          <h1 className="mt-4 text-3xl lg:text-5xl font-bold text-text-inverse leading-tight">
            Коврики элитного класса для вашего автомобиля
          </h1>
          <p className="mt-6 text-text-inverse-muted text-lg max-w-xl mx-auto leading-relaxed">
            Премиальный EVA. Индивидуальная подгонка. Безупречное качество.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <span className="section-label">Миссия</span>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Дать каждому автовладельцу возможность защитить салон с помощью ковриков элитного класса. Премиальное качество не должно стоить целое состояние.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
            {[
              { title: "Качество", text: "Только премиальный EVA от проверенных поставщиков" },
              { title: "Точность", text: "Индивидуальный раскрой по 3D-лекалам каждой модели" },
              { title: "Стиль", text: "Элегантный дизайн, подчёркивающий статус авто" },
              { title: "Сервис", text: "Быстрая доставка, гарантия и поддержка" },
            ].map((v) => (
              <div key={v.title}>
                <h3 className="text-text-primary font-semibold mb-2">{v.title}</h3>
                <p className="text-text-secondary text-sm">{v.text}</p>
              </div>
            ))}
          </div>

          <div className="border border-gold/20 bg-gold-muted p-8 lg:p-10">
            <span className="section-label">Материал EVA</span>
            <p className="mt-4 text-text-secondary text-sm leading-relaxed mb-5">
              Современный полимер, используемый в спортивной обуви и медицине.
            </p>
            <ul className="space-y-2.5 text-text-secondary text-sm">
              {["Водонепроницаемый","Износостойкий — до 5 лет","Экологичный","Легко моется","Без запаха"].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="w-1 h-1 bg-gold rounded-full shrink-0" />{item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
