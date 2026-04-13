export default function ContactsPage() {
  const input = "w-full border border-light-border px-4 py-3.5 text-sm text-text-primary placeholder:text-light-text/50 focus:border-gold focus:outline-none transition-colors bg-transparent";

  return (
    <div className="py-16 lg:py-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="section-label">Контакты</span>
          <h1 className="mt-4 text-3xl lg:text-4xl font-bold text-text-primary">Свяжитесь с нами</h1>
          <p className="mt-3 text-text-secondary">Мы всегда рады помочь с подбором ковриков</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="divide-y divide-light-border border-t border-light-border">
            {[
              { label: "Телефон", value: "+1 (234) 567-890", href: "tel:+1234567890" },
              { label: "Email", value: "info@elitecarmats.com", href: "mailto:info@elitecarmats.com" },
              { label: "Адрес", value: "Rochester, NY, USA" },
            ].map((c) => (
              <div key={c.label} className="py-5">
                <div className="section-label text-light-text text-[10px] mb-1">{c.label}</div>
                {c.href ? (
                  <a href={c.href} className="text-text-primary hover:text-gold transition-colors font-medium">{c.value}</a>
                ) : (
                  <div className="text-text-primary font-medium">{c.value}</div>
                )}
              </div>
            ))}
          </div>
          <form className="space-y-4">
            <input type="text" placeholder="Имя" className={input} />
            <input type="email" placeholder="Email" className={input} />
            <textarea placeholder="Сообщение" rows={5} className={input + " resize-none"} />
            <button type="submit" className="w-full bg-dark hover:bg-gold text-light text-sm font-medium tracking-wider uppercase py-3.5 transition-all duration-300">
              Отправить
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
