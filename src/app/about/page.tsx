export default function AboutPage() {
  return (
    <div>
      <section className="py-24 lg:py-32 border-b border-dark-border">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <span className="section-label">О компании</span>
          <h1 className="mt-4 text-3xl lg:text-5xl font-bold text-text-primary leading-tight">Коврики элитного класса</h1>
          <p className="mt-6 text-text-secondary text-lg max-w-xl mx-auto leading-relaxed">Премиальный EVA. Индивидуальная подгонка. Безупречное качество.</p>
        </div>
      </section>
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <span className="section-label">Миссия</span>
            <p className="mt-4 text-text-secondary leading-relaxed">Дать каждому автовладельцу возможность защитить салон ковриками элитного класса по доступной цене.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
            {[{t:"Качество",d:"Только премиальный EVA"},{t:"Точность",d:"Раскрой по 3D-лекалам"},{t:"Стиль",d:"Подчёркивает статус авто"},{t:"Сервис",d:"Быстрая доставка и гарантия"}].map((v) => (
              <div key={v.t}><h3 className="text-text-primary font-semibold mb-2">{v.t}</h3><p className="text-text-secondary text-sm">{v.d}</p></div>
            ))}
          </div>
          <div className="border border-gold/20 bg-gold-muted p-8 lg:p-10 rounded-lg">
            <span className="section-label">Материал EVA</span>
            <p className="mt-4 text-text-secondary text-sm leading-relaxed mb-5">Современный полимер из спортивной обуви и медицины.</p>
            <ul className="space-y-2.5 text-text-secondary text-sm">
              {["Водонепроницаемый","Износостойкий — до 5 лет","Экологичный","Легко моется","Без запаха"].map((i) => (
                <li key={i} className="flex items-center gap-3"><span className="w-1 h-1 bg-gold rounded-full shrink-0"/>{i}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
