import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Свяжитесь с нами — Elite Car Mats",
};

export default function ContactsPage() {
  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-brand-white">
            <span className="text-gradient-gold">Свяжитесь</span> с нами
          </h1>
          <p className="mt-4 text-brand-text-muted text-lg">
            Мы всегда рады помочь с подбором ковриков
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                ),
                label: "Телефон",
                value: "+1 (234) 567-890",
                href: "tel:+1234567890",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                ),
                label: "Email",
                value: "info@elitecarmats.com",
                href: "mailto:info@elitecarmats.com",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                ),
                label: "Адрес",
                value: "Rochester, NY, USA",
              },
            ].map((contact) => (
              <div
                key={contact.label}
                className="flex items-start gap-4 bg-brand-dark-light border border-brand-gray/30 rounded-xl p-6"
              >
                <div className="text-brand-gold shrink-0">{contact.icon}</div>
                <div>
                  <div className="text-brand-text-muted text-sm">
                    {contact.label}
                  </div>
                  {contact.href ? (
                    <a
                      href={contact.href}
                      className="text-brand-white hover:text-brand-gold transition-colors font-medium"
                    >
                      {contact.value}
                    </a>
                  ) : (
                    <div className="text-brand-white font-medium">
                      {contact.value}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="bg-brand-dark-light border border-brand-gray/30 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-brand-white mb-4">
              Напишите нам
            </h2>
            <form className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Ваше имя"
                  className="w-full bg-brand-dark border border-brand-gray-light rounded-lg px-4 py-3 text-brand-text placeholder:text-brand-text-muted/50 focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/50 transition-colors"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full bg-brand-dark border border-brand-gray-light rounded-lg px-4 py-3 text-brand-text placeholder:text-brand-text-muted/50 focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/50 transition-colors"
                />
              </div>
              <div>
                <textarea
                  placeholder="Сообщение"
                  rows={5}
                  className="w-full bg-brand-dark border border-brand-gray-light rounded-lg px-4 py-3 text-brand-text placeholder:text-brand-text-muted/50 focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/50 transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-brand-gold hover:bg-brand-gold-light text-brand-black font-semibold py-3 rounded-lg transition-all duration-200"
              >
                Отправить
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
