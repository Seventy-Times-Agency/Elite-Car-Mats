export default function ContactsPage() {
  const input = "w-full glass-card rounded-xl px-4 py-3.5 text-sm text-text placeholder:text-text-faint focus:border-gold/40 focus:outline-none focus:shadow-[0_0_0_1px_rgba(212,165,74,0.3)] transition-all";

  return (
    <div className="py-16 lg:py-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="section-label">Контакты</span>
          <h1 className="mt-4 text-3xl lg:text-4xl font-bold">Свяжитесь с нами</h1>
          <p className="mt-3 text-text-dim">Мы рады помочь с подбором ковриков</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            {[{l:"Телефон",v:"+1 (234) 567-890",h:"tel:+1234567890"},{l:"Email",v:"info@elitecarmats.us",h:"mailto:info@elitecarmats.us"},{l:"Адрес",v:"Rochester, NY, USA"}].map((c) => (
              <div key={c.l} className="glass-card rounded-xl p-5">
                <div className="text-[10px] uppercase tracking-[0.2em] text-gold font-semibold mb-1">{c.l}</div>
                {c.h ? <a href={c.h} className="text-text hover:text-gold transition-colors font-medium">{c.v}</a> : <div className="text-text font-medium">{c.v}</div>}
              </div>
            ))}
          </div>
          <form className="space-y-4">
            <input type="text" placeholder="Имя" className={input} />
            <input type="email" placeholder="Email" className={input} />
            <textarea placeholder="Сообщение" rows={5} className={input + " resize-none"} />
            <button type="submit" className="w-full bg-gradient-to-r from-gold to-gold-light text-bg text-sm font-semibold tracking-wider uppercase py-4 rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(212,165,74,0.25)] hover:shadow-[0_6px_28px_rgba(212,165,74,0.35)]">Отправить</button>
          </form>
        </div>
      </div>
    </div>
  );
}
