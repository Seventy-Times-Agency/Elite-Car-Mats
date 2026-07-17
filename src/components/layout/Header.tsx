"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useT } from "@/i18n/I18nProvider";
import { splitLocaleFromPath } from "@/i18n/locale-path";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { HeaderSearch } from "./HeaderSearch";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  // Strip the /ru//uk URL prefix so active-link checks keep matching
  // the unprefixed hrefs used throughout the nav.
  const pathname = splitLocaleFromPath(usePathname() ?? "/").path;
  const { itemsCount, openCart } = useCart();
  const { count: wishCount } = useWishlist();
  const t = useT();

  useEffect(() => {
    const fn = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setPastHero(y > 600);
    };
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const ctaVisible =
    pastHero &&
    pathname !== "/cart" &&
    pathname !== "/checkout" &&
    !(pathname?.startsWith("/admin") ?? false) &&
    !(pathname?.startsWith("/order/") ?? false);

  const links = [
    { href: "/catalog", label: t("nav.catalog") },
    { href: "/reviews", label: t("nav.reviews") },
    { href: "/about", label: t("nav.about") },
    { href: "/contacts", label: t("nav.contact") },
  ];

  const ctaHref = pathname === "/" ? "#configurator" : "/catalog";
  const cartAria =
    itemsCount > 0
      ? t("nav.cartAriaWithCount", { n: itemsCount })
      : t("nav.cartAriaEmpty");

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? "bg-bg/90 backdrop-blur-xl shadow-[0_1px_0_rgba(212,165,74,0.08)]" : ""}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 lg:h-20">
        <Link
          href="/"
          className="font-bold text-lg lg:text-xl tracking-[0.12em] uppercase"
          aria-label={t("nav.logoAria")}
        >
          Elite<span className="text-gold">Car</span>Mats
        </Link>

        <nav
          className="hidden md:flex items-center gap-7"
          aria-label={t("nav.mainAria")}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-[13px] tracking-wide transition-colors duration-300 ${pathname === l.href ? "text-gold" : "text-text-dim hover:text-gold"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 lg:gap-3">
          <HeaderSearch />

          <LanguageSwitcher />

          <a
            href={ctaHref}
            className={`hidden md:inline-flex items-center gap-1.5 bg-gradient-to-r from-gold to-gold-light text-bg text-xs font-semibold tracking-[0.15em] uppercase px-4 py-2 rounded-lg shadow-[0_2px_12px_rgba(212,165,74,0.25)] hover:shadow-[0_4px_18px_rgba(212,165,74,0.4)] transition-all ${ctaVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"}`}
            aria-hidden={!ctaVisible}
            // pointer-events-none doesn't remove keyboard focus — without
            // this, Tab lands on an invisible link the screen reader also
            // ignores (classic aria-hidden-focus failure).
            tabIndex={ctaVisible ? 0 : -1}
          >
            {t("nav.ctaShort")}
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>

          <Link
            href="/wishlist"
            className="relative text-text-dim hover:text-gold transition-colors p-1.5"
            aria-label={
              wishCount > 0
                ? t("nav.wishAriaWithCount", { n: wishCount })
                : t("nav.wishAriaEmpty")
            }
          >
            <svg
              className="w-[20px] h-[20px]"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.7}
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.687-4.5-1.935 0-3.597 1.126-4.313 2.733-.715-1.607-2.378-2.733-4.312-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              />
            </svg>
            {wishCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gold text-bg text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={openCart}
            className="relative text-text-dim hover:text-gold transition-colors p-1"
            aria-label={cartAria}
          >
            <svg
              className="w-[22px] h-[22px]"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            {itemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-bg text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(212,165,74,0.4)]">
                {itemsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-text-dim hover:text-gold p-1"
            aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={
                  menuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-surface/95 backdrop-blur-xl border-t border-border"
        >
          <nav
            className="px-6 py-4 space-y-1"
            aria-label={t("nav.mobileAria")}
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={`block py-2.5 transition-colors ${pathname === l.href ? "text-gold" : "text-text-dim hover:text-gold"}`}
              >
                {l.label}
              </Link>
            ))}
            <a
              href={ctaHref}
              onClick={() => setMenuOpen(false)}
              className="mt-3 block text-center bg-gradient-to-r from-gold to-gold-light text-bg text-sm font-semibold tracking-[0.15em] uppercase py-3 rounded-lg"
            >
              {t("nav.ctaMobile")}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
