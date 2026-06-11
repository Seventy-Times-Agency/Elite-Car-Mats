import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { FloatingCTA } from "@/components/layout/FloatingCTA";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { OrganizationJsonLd } from "@/components/seo/ProductJsonLd";
import { I18nProvider } from "@/i18n/I18nProvider";
import { getDictionary } from "@/i18n/getDictionary";
import { LOCALE_HTML_LANG, LOCALE_OG } from "@/i18n/config";
import { makeT } from "@/i18n/dictionary";
import { localeAlternates } from "@/lib/seo/alternates";
import { headers } from "next/headers";

const inter = localFont({
  src: "./fonts/inter-var.woff2",
  variable: "--font-inter",
  display: "swap",
});

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitecarmats.us";
const BUILD_SHA =
  process.env.VERCEL_GIT_COMMIT_SHA ??
  process.env.NEXT_PUBLIC_BUILD_SHA ??
  "local";

export const viewport: Viewport = {
  themeColor: "#0F0F0F",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  // Unprefixed route path injected by src/proxy.ts — used for the
  // per-page canonical + hreflang set below. Defaults to "/" outside a
  // request scope (build-time metadata for static shells).
  let path = "/";
  try {
    path = (await headers()).get("x-pathname") ?? "/";
  } catch {}
  return {
    metadataBase: new URL(SITE),
    title: {
      default: t("root.title"),
      template: "%s | Elite Car Mats",
    },
    description: t("root.description"),
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
      title: t("root.ogTitle"),
      description: t("root.ogDesc"),
      url: SITE,
    },
    twitter: {
      card: "summary_large_image",
      title: t("root.twitterTitle"),
      description: t("root.twitterDesc"),
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
    // Locale lives on a path prefix now (src/proxy.ts): / = EN,
    // /ru/* and /uk/* serve the translations at their own URLs, so each
    // page gets a locale-aware canonical plus the full hreflang set.
    // This also fixes the old bug where every page inherited
    // `canonical: SITE` and told Google the real page was the homepage.
    alternates: await localeAlternates(path),
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
      <head>
        <meta name="x-build-sha" content={BUILD_SHA} />
        <OrganizationJsonLd />
      </head>
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-gold focus:text-bg focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold focus:text-sm"
        >
          {skipLabel}
        </a>
        <I18nProvider locale={locale} dict={dict} fallback={fallback}>
          <CartProvider>
            <WishlistProvider>
              <AnnouncementBar />
              <Header />
              <main id="main-content" className="flex-1">
                {children}
              </main>
              <Footer />
              <FloatingCTA />
              <CookieBanner />
              <CartDrawer />
            </WishlistProvider>
          </CartProvider>
        </I18nProvider>
        {/* Vercel Web Analytics — cookieless, same-origin script, so it
            needs no CSP allowance and no cookie-banner consent gate.
            Enable the Analytics tab for the project in the Vercel
            dashboard to start collecting. */}
        <Analytics />
      </body>
    </html>
  );
}
