import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/50">
      <div className="h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <span className="font-bold text-xl tracking-[0.12em] uppercase">Elite<span className="text-gold">Car</span>Mats</span>
            <p className="mt-5 text-text-dim text-sm leading-relaxed">Премиальные EVA коврики с индивидуальной подгонкой.</p>
          </div>
          {[
            { t: "Навигация", items: [{h:"/catalog",l:"Каталог"},{h:"/about",l:"О компании"},{h:"/contacts",l:"Контакты"},{h:"/track",l:"Отследить заказ"}] },
            { t: "Информация", items: [{h:"/delivery",l:"Доставка"},{h:"/warranty",l:"Гарантия"},{h:"/privacy",l:"Конфиденциальность"}] },
          ].map((col) => (
            <div key={col.t}>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-gold/40 font-semibold mb-5">{col.t}</h3>
              <ul className="space-y-3">{col.items.map((i) => (
                <li key={i.h}><Link href={i.h} className="text-text-dim hover:text-gold transition-colors text-sm">{i.l}</Link></li>
              ))}</ul>
            </div>
          ))}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-gold/40 font-semibold mb-5">Контакты</h3>
            <ul className="space-y-3 text-sm text-text-dim">
              <li><a href="tel:+1234567890" className="hover:text-gold transition-colors">+1 (234) 567-890</a></li>
              <li><a href="mailto:info@elitecarmats.us" className="hover:text-gold transition-colors">info@elitecarmats.us</a></li>
              <li>Rochester, NY, USA</li>
            </ul>
          </div>
        </div>
        <div className="mt-14 pt-8 border-t border-border/30 text-center text-text-faint text-xs tracking-wide">© {new Date().getFullYear()} EliteCarMats</div>
      </div>
    </footer>
  );
}
