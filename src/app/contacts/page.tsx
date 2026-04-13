export default function ContactsPage() {
  const input = "w-full border border-dark-border rounded-lg bg-dark-soft px-4 py-3.5 text-sm text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none transition-colors";

  return (
    <div className="py-16 lg:py-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="section-label">Контакты</span>
          <h1 className="mt-4 text-3xl lg:text-4xl font-bold text-text-primary">Свяжитесь с нами</h1>
          <p className="mt-3 text-text-secondary">Мы рады помочь с подбором ковриков</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="divide-y divide-dark-border border-t border-dark-border">
            {[{l:"Телефон",v:"+1 (234) 567-890",h:"tel:+1234567890"},{l:"Email",v:"info@elitecarmats.com",h:"mailto:info@elitecarmats.com"},{l:"Адрес",v:"Rochester, NY, USA"}].map((c) => (
              <div key={c.l} className="py-5">
                <div className="section-label text-gold/40 text-[10px] mb-1">{c.l}</div>
                {c.h ? <a href={c.h} className="text-text-primary hover:text-gold transition-colors font-medium">{c.v}</a> : <div className="text-text-primary font-medium">{c.v}</div>}
              </div>
            ))}
          </div>
          <form className="space-y-4">
            <input type="text" placeholder="Имя" className={input} />
            <input type="email" placeholder="Email" className={input} />
            <textarea placeholder="Сообщение" rows={5} className={input + " resize-none"} />
            <button type="submit" className="w-full bg-gold hover:bg-gold-light text-dark text-sm font-medium tracking-wider uppercase py-3.5 rounded-lg transition-all duration-300">Отправить</button>
          </form>
        </div>
      </div>
    </div>
  );
}
