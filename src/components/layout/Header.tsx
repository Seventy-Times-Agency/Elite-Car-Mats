"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { itemsCount } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/catalog", label: "Каталог" },
    { href: "/about", label: "О нас" },
    { href: "/reviews", label: "Отзывы" },
    { href: "/contacts", label: "Контакты" },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-dark/95 backdrop-blur-lg border-b border-dark-border" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="font-bold text-lg tracking-[0.15em] uppercase">
            <span className="text-text-primary">Elite</span><span className="text-gold">Car</span><span className="text-text-primary">Mats</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-text-secondary text-sm tracking-wide hover:text-gold transition-colors">{l.label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-5">
            <a href="tel:+1234567890" className="hidden lg:block text-text-secondary text-sm hover:text-gold transition-colors">+1 (234) 567-890</a>
            <Link href="/cart" className="relative text-text-secondary hover:text-gold transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {itemsCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-gold text-dark text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{itemsCount}</span>}
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-text-secondary hover:text-gold transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden bg-dark-soft border-t border-dark-border">
          <nav className="px-6 py-4 space-y-1">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMobileMenuOpen(false)} className="block text-text-secondary hover:text-gold transition-colors py-2.5">{l.label}</Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
