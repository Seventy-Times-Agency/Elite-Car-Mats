import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-brand-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block">
              <span className="font-bold text-xl tracking-wider uppercase">
                Elite<span className="text-brand-gold">Car</span>Mats
              </span>
            </Link>
            <p className="mt-4 text-white/50 text-sm leading-relaxed">
              Премиальные EVA коврики для вашего автомобиля. Индивидуальная подгонка под каждую модель.
            </p>
          </div>

          {/* Nav */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-white/30 font-medium mb-5">
              Навигация
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/catalog", label: "Каталог" },
                { href: "/about", label: "О компании" },
                { href: "/reviews", label: "Отзывы" },
                { href: "/contacts", label: "Контакты" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/50 hover:text-brand-gold transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-white/30 font-medium mb-5">
              Информация
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/delivery", label: "Доставка и оплата" },
                { href: "/warranty", label: "Гарантия" },
                { href: "/privacy", label: "Конфиденциальность" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/50 hover:text-brand-gold transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-white/30 font-medium mb-5">
              Контакты
            </h3>
            <ul className="space-y-3 text-sm text-white/50">
              <li>
                <a href="tel:+1234567890" className="hover:text-brand-gold transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
              <li>
                <a href="mailto:info@elitecarmats.com" className="hover:text-brand-gold transition-colors">
                  info@elitecarmats.com
                </a>
              </li>
              <li>Rochester, NY, USA</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 text-center text-white/30 text-xs tracking-wide">
          &copy; {new Date().getFullYear()} EliteCarMats. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
