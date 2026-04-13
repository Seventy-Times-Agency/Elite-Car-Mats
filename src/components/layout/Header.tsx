"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { itemsCount } = useCart();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { href: "/catalog", label: "Каталог" },
    { href: "/about", label: "О нас" },
    { href: "/reviews", label: "Отзывы" },
    { href: "/contacts", label: "Контакты" },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? "bg-bg/90 backdrop-blur-xl shadow-[0_1px_0_rgba(212,165,74,0.08)]" : ""}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 lg:h-20">
        <Link href="/" className="font-bold text-lg lg:text-xl tracking-[0.12em] uppercase">
          Elite<span className="text-gold">Car</span>Mats
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-text-dim text-[13px] tracking-wide hover:text-gold transition-colors duration-300">{l.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <a href="tel:+1234567890" className="hidden lg:block text-text-dim text-[13px] hover:text-gold transition-colors">+1 (234) 567-890</a>

          <Link href="/cart" className="relative text-text-dim hover:text-gold transition-colors">
            <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {itemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-bg text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(212,165,74,0.4)]">{itemsCount}</span>
            )}
          </Link>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-text-dim hover:text-gold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-surface border-t border-border">
          <nav className="px-6 py-4 space-y-1">
            {links.map((l) => <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="block text-text-dim hover:text-gold py-2.5 transition-colors">{l.label}</Link>)}
          </nav>
        </div>
      )}
    </header>
  );
}
