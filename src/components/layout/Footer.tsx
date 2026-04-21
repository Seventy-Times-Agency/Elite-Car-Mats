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
              Premium EVA car mats custom-fit to your vehicle. Made in the USA.
            </p>
            <div className="mt-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold/60 font-semibold mb-3">
                Get launch updates
              </p>
              <NewsletterForm />
            </div>
          </div>

          {[
            { t: "Navigation", items: [
              { h: "/catalog", l: "Catalog" },
              { h: "/about", l: "About Us" },
              { h: "/contacts", l: "Contact" },
              { h: "/track", l: "Track Order" },
            ]},
            { t: "Information", items: [
              { h: "/delivery", l: "Shipping" },
              { h: "/warranty", l: "Warranty" },
              { h: "/refund", l: "Returns" },
              { h: "/privacy", l: "Privacy Policy" },
              { h: "/terms", l: "Terms of Service" },
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
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-gold/60 font-semibold mb-4">Contact</h3>
            <ul className="space-y-2.5 text-sm text-text-dim">
              <li>
                <a href="mailto:info@elitecarmats.us" className="hover:text-gold transition-colors">
                  info@elitecarmats.us
                </a>
              </li>
              <li>Rochester, NY, USA</li>
              <li className="pt-2">
                <Link href="/contacts" className="text-gold/80 hover:text-gold text-xs uppercase tracking-wider">
                  All contacts →
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
