import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Свяжитесь с нами — Elite Car Mats",
};

export default function ContactsPage() {
  const inputClasses = "w-full border border-brand-gray-200 px-4 py-3 text-sm text-brand-text placeholder:text-brand-gray-300 focus:border-brand-gold focus:outline-none transition-colors";

  return (
    <div className="py-12 lg:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-brand-gold text-sm tracking-[0.3em] uppercase font-medium mb-3">Контакты</p>
          <h1 className="text-3xl lg:text-4xl font-bold text-brand-black">Свяжитесь с нами</h1>
          <p className="mt-3 text-brand-text-secondary">Мы всегда рады помочь с подбором ковриков</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info */}
          <div className="space-y-6">
            {[
              { label: "Телефон", value: "+1 (234) 567-890", href: "tel:+1234567890" },
              { label: "Email", value: "info@elitecarmats.com", href: "mailto:info@elitecarmats.com" },
              { label: "Адрес", value: "Rochester, NY, USA" },
            ].map((c) => (
              <div key={c.label} className="border-b border-brand-gray-100 pb-5">
                <div className="text-[10px] uppercase tracking-[0.2em] text-brand-gray-400 font-medium mb-1">{c.label}</div>
                {c.href ? (
                  <a href={c.href} className="text-brand-black hover:text-brand-gold transition-colors font-medium">{c.value}</a>
                ) : (
                  <div className="text-brand-black font-medium">{c.value}</div>
                )}
              </div>
            ))}
          </div>

          {/* Form */}
          <div>
            <form className="space-y-4">
              <input type="text" placeholder="Имя" className={inputClasses} />
              <input type="email" placeholder="Email" className={inputClasses} />
              <textarea placeholder="Сообщение" rows={5} className={inputClasses + " resize-none"} />
              <button type="submit" className="w-full bg-brand-black hover:bg-brand-gold text-white text-sm font-medium tracking-wide uppercase py-3.5 transition-colors">
                Отправить
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
