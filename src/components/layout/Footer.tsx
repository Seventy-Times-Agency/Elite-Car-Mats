import Link from "next/link";
import { NewsletterForm } from "./NewsletterForm";

export function Footer() {
  return (
    <footer className="border-t border-border/50">
      <div className="h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <span className="font-bold text-xl tracking-[0.12em] uppercase">Elite<span className="text-gold">Car</span>Mats</span>
            <p className="mt-4 text-text-dim text-sm leading-relaxed">
              Премиальные EVA коврики с индивидуальной подгонкой. Производство в США.
            </p>
            <div className="mt-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold/60 font-semibold mb-3">
                Узнать о запуске
              </p>
              <NewsletterForm />
            </div>
          </div>

          {[
            { t: "Навигация", items: [
              { h: "/catalog", l: "Каталог" },
              { h: "/about", l: "О компании" },
              { h: "/contacts", l: "Контакты" },
              { h: "/track", l: "Отследить заказ" },
            ]},
            { t: "Информация", items: [
              { h: "/delivery", l: "Доставка" },
              { h: "/warranty", l: "Гарантия" },
              { h: "/refund", l: "Возврат" },
              { h: "/privacy", l: "Конфиденциальность" },
              { h: "/terms", l: "Условия" },
            ]},
          ].map((col) => (
            <div key={col.t}>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-gold/60 font-semibold mb-4">{col.t}</h3>
              <ul className="space-y-2.5">
                {col.items.map((i) => (
                  <li key={i.h}>
                    <Link href={i.h} className="text-text-dim hover:text-gold transition-colors text-sm">
                      {i.l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-gold/60 font-semibold mb-4">Контакты</h3>
            <ul className="space-y-2.5 text-sm text-text-dim">
              <li>
                <a href="mailto:info@elitecarmats.us" className="hover:text-gold transition-colors">
                  info@elitecarmats.us
                </a>
              </li>
              <li>Rochester, NY, USA</li>
              <li className="pt-2">
                <Link href="/contacts" className="text-gold/80 hover:text-gold text-xs uppercase tracking-wider">
                  Все контакты →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-text-faint text-xs tracking-wide">
          <div>© {new Date().getFullYear()} Elite Car Mats. All rights reserved.</div>
          <div className="text-[10px] uppercase tracking-[0.15em]">Premium EVA · Made in USA</div>
        </div>
      </div>
    </footer>
  );
}
