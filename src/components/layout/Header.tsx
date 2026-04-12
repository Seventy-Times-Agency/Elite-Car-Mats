"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { itemsCount } = useCart();

  const navLinks = [
    { href: "/catalog", label: "Каталог" },
    { href: "/about", label: "О нас" },
    { href: "/reviews", label: "Отзывы" },
    { href: "/contacts", label: "Контакты" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-brand-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-brand-black font-bold text-lg lg:text-xl tracking-wider uppercase">
              Elite<span className="text-brand-gold">Car</span>Mats
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-brand-gray-500 hover:text-brand-black transition-colors text-sm tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-5">
            <a
              href="tel:+1234567890"
              className="hidden lg:flex items-center gap-2 text-brand-gray-500 hover:text-brand-black transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +1 (234) 567-890
            </a>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative text-brand-gray-500 hover:text-brand-black transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {itemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-gold text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {itemsCount}
                </span>
              )}
            </Link>

            {/* Mobile menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-brand-gray-500 hover:text-brand-black transition-colors"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-brand-gray-200">
          <nav className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-brand-gray-600 hover:text-brand-gold transition-colors py-2.5 text-base"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="tel:+1234567890"
              className="block text-brand-gray-600 hover:text-brand-gold transition-colors py-2.5 text-base"
            >
              +1 (234) 567-890
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
