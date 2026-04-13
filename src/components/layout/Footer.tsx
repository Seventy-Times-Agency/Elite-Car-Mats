import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-dark-border">
      <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <span className="font-bold text-xl tracking-[0.15em] uppercase"><span className="text-text-primary">Elite</span><span className="text-gold">Car</span><span className="text-text-primary">Mats</span></span>
            <p className="mt-5 text-text-secondary text-sm leading-relaxed">Премиальные EVA коврики с индивидуальной подгонкой.</p>
          </div>
          <div>
            <h3 className="section-label text-gold/40 mb-5">Навигация</h3>
            <ul className="space-y-3">
              {[{h:"/catalog",l:"Каталог"},{h:"/about",l:"О компании"},{h:"/reviews",l:"Отзывы"},{h:"/contacts",l:"Контакты"}].map((i) => (
                <li key={i.h}><Link href={i.h} className="text-text-secondary hover:text-gold transition-colors text-sm">{i.l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="section-label text-gold/40 mb-5">Информация</h3>
            <ul className="space-y-3">
              {[{h:"/delivery",l:"Доставка"},{h:"/warranty",l:"Гарантия"},{h:"/privacy",l:"Конфиденциальность"}].map((i) => (
                <li key={i.h}><Link href={i.h} className="text-text-secondary hover:text-gold transition-colors text-sm">{i.l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="section-label text-gold/40 mb-5">Контакты</h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li><a href="tel:+1234567890" className="hover:text-gold transition-colors">+1 (234) 567-890</a></li>
              <li><a href="mailto:info@elitecarmats.com" className="hover:text-gold transition-colors">info@elitecarmats.com</a></li>
              <li>Rochester, NY, USA</li>
            </ul>
          </div>
        </div>
        <div className="mt-14 pt-8 border-t border-dark-border text-center text-text-muted text-xs tracking-wide">
          &copy; {new Date().getFullYear()} EliteCarMats
        </div>
      </div>
    </footer>
  );
}
