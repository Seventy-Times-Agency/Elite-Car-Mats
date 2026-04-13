import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-dark eva-pattern">
      {/* Gold divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block">
              <span className="font-bold text-xl tracking-[0.15em] uppercase">
                <span className="text-text-inverse">Elite</span>
                <span className="text-gold">Car</span>
                <span className="text-text-inverse">Mats</span>
              </span>
            </Link>
            <p className="mt-5 text-text-inverse-muted text-sm leading-relaxed">
              Премиальные EVA коврики с индивидуальной подгонкой под каждую модель автомобиля.
            </p>
          </div>

          {/* Nav */}
          <div>
            <h3 className="section-label text-gold/60 mb-5">Навигация</h3>
            <ul className="space-y-3">
              {[
                { href: "/catalog", label: "Каталог" },
                { href: "/about", label: "О компании" },
                { href: "/reviews", label: "Отзывы" },
                { href: "/contacts", label: "Контакты" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-text-inverse-muted hover:text-gold transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="section-label text-gold/60 mb-5">Информация</h3>
            <ul className="space-y-3">
              {[
                { href: "/delivery", label: "Доставка и оплата" },
                { href: "/warranty", label: "Гарантия" },
                { href: "/privacy", label: "Конфиденциальность" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-text-inverse-muted hover:text-gold transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="section-label text-gold/60 mb-5">Контакты</h3>
            <ul className="space-y-3 text-sm text-text-inverse-muted">
              <li><a href="tel:+1234567890" className="hover:text-gold transition-colors">+1 (234) 567-890</a></li>
              <li><a href="mailto:info@elitecarmats.com" className="hover:text-gold transition-colors">info@elitecarmats.com</a></li>
              <li>Rochester, NY, USA</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-dark-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-text-inverse-muted/40 text-xs tracking-wide">
            &copy; {new Date().getFullYear()} EliteCarMats
          </span>
          <div className="flex gap-5">
            {["Instagram", "Facebook"].map((social) => (
              <a key={social} href="#" className="text-text-inverse-muted/40 hover:text-gold text-xs tracking-wide transition-colors">
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
