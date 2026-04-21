import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingCTA } from "@/components/layout/FloatingCTA";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { CartProvider } from "@/context/CartContext";
import { I18nProvider } from "@/i18n/I18nProvider";
import { getDictionary } from "@/i18n/getDictionary";
import { LOCALE_HTML_LANG, LOCALE_OG } from "@/i18n/config";

const inter = localFont({
  src: "./fonts/inter-var.woff2",
  variable: "--font-inter",
  display: "swap",
});

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitecarmats.us";

export const viewport: Viewport = {
  themeColor: "#0F0F0F",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getDictionary();
  // Title/description stay in Russian as the primary canonical metadata;
  // localized strings in UI come from dictionary at render time.
  return {
    metadataBase: new URL(SITE),
    title: {
      default: "Elite Car Mats — Премиальные EVA коврики для авто",
      template: "%s | Elite Car Mats",
    },
    description:
      "Индивидуальные автоковрики из EVA материала премиум-класса. Точная подгонка под вашу модель авто. Бесплатная доставка по США от $99. Гарантия 2 года.",
    applicationName: "Elite Car Mats",
    authors: [{ name: "Elite Car Mats", url: SITE }],
    generator: "Next.js",
    keywords: [
      "автоковрики",
      "EVA коврики",
      "коврики в машину",
      "car mats",
      "EVA mats",
      "килимки",
      "elite car mats",
      "premium car mats",
      "custom car mats USA",
      "auto floor mats",
    ],
    category: "automotive",
    openGraph: {
      type: "website",
      locale: LOCALE_OG[locale],
      siteName: "Elite Car Mats",
      title: "Elite Car Mats — Премиальные EVA коврики для авто",
      description:
        "Индивидуальные EVA коврики премиум-класса. CNC-раскрой под вашу модель. Бесплатная доставка по США от $99.",
      url: SITE,
    },
    twitter: {
      card: "summary_large_image",
      title: "Elite Car Mats — Премиальные EVA коврики",
      description:
        "Индивидуальные EVA коврики под вашу модель авто. Доставка по США.",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: SITE,
      languages: {
        ru: SITE,
        en: SITE,
        uk: SITE,
      },
    },
    formatDetection: {
      telephone: true,
      email: true,
      address: true,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, dict, fallback } = await getDictionary();
  const skipLabel =
    (dict["nav.skipToContent"] as string | undefined) ??
    (fallback["nav.skipToContent"] as string);

  return (
    <html
      lang={LOCALE_HTML_LANG[locale]}
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-gold focus:text-bg focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold focus:text-sm"
        >
          {skipLabel}
        </a>
        <I18nProvider locale={locale} dict={dict} fallback={fallback}>
          <CartProvider>
            <Header />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
            <FloatingCTA />
            <CookieBanner />
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
