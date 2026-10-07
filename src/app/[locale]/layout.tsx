import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "../globals.css";
import { inter } from "../fonts";
import { Header } from "@/components/layout/Header";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { FloatingCTA } from "@/components/layout/FloatingCTA";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { PriceOverridesProvider } from "@/context/PriceOverridesContext";
import { loadPriceOverridesCached } from "@/lib/pricing-overrides";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { OrganizationJsonLd } from "@/components/seo/ProductJsonLd";
import { I18nProvider } from "@/i18n/I18nProvider";
import { MetaPixel } from "@/components/analytics/MetaPixel";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { FunnelTracker } from "@/components/analytics/FunnelTracker";
import { AttributionTracker } from "@/components/analytics/AttributionTracker";
import { getDictionary } from "@/i18n/getDictionary";
import { LOCALES, LOCALE_HTML_LANG, LOCALE_OG } from "@/i18n/config";
import { makeT } from "@/i18n/dictionary";
import { getShippingCopyVars } from "@/lib/pricing-overrides";
import { alt as ogAlt, size as ogSize, contentType as ogType } from "../opengraph-image";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitecarmats.us";
// The default share card is app/opengraph-image.tsx, one segment above
// this layout, so the openGraph object below would replace it rather
// than merge with it. Restated explicitly (twitter falls back to it).
const SHARE_CARD = {
  url: "/opengraph-image",
  width: ogSize.width,
  height: ogSize.height,
  alt: ogAlt,
  type: ogType,
};
const BUILD_SHA =
  process.env.VERCEL_GIT_COMMIT_SHA ??
  process.env.NEXT_PUBLIC_BUILD_SHA ??
  "local";

export const viewport: Viewport = {
  themeColor: "#0F0F0F",
  width: "device-width",
  initialScale: 1,
};

// Every storefront page is static per locale: the plain pages are
// prerendered here for all three, dynamic-segment pages (brand, model,
// blog post) render on first request, and all of them are then served
// from the ISR cache until their data tags are revalidated.
// src/proxy.ts maps the visitor's URL onto one locale copy.
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  const ship = await getShippingCopyVars();
  return {
    metadataBase: new URL(SITE),
    title: {
      default: t("root.title"),
      template: "%s | Elite Car Mats",
    },
    description: t("root.description", ship),
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
      description: t("root.ogDesc", ship),
      url: SITE,
      images: [SHARE_CARD],
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
    // No `alternates` here: a layout can't see the page path once the
    // page is static, and an inherited canonical would point every page
    // at the homepage. Each route sets its own via localeAlternates().
    formatDetection: {
      telephone: true,
      email: true,
      address: true,
    },
    // Meta (Facebook) Business Manager domain verification. Set
    // NEXT_PUBLIC_META_DOMAIN_VERIFICATION to the code from Business
    // Settings → Brand Safety → Domains; required for Aggregated Event
    // Measurement, link-preview editing and catalog ads.
    ...(process.env.NEXT_PUBLIC_META_DOMAIN_VERIFICATION
      ? {
          other: {
            "facebook-domain-verification":
              process.env.NEXT_PUBLIC_META_DOMAIN_VERIFICATION,
          },
        }
      : {}),
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
  // Admin price overrides for client-side price display — keeps every
  // price the customer sees in sync with what the server bills. Cached
  // (tag `pricing`, busted by the /admin/pricing POST) and fails to an
  // empty map on DB errors, so it never blocks rendering.
  const priceOverrideEntries = Array.from(
    (await loadPriceOverridesCached()).entries(),
  );

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
          <PriceOverridesProvider entries={priceOverrideEntries}>
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
          </PriceOverridesProvider>
        </I18nProvider>
        {/* Vercel Web Analytics — cookieless, same-origin script, so it
            needs no CSP allowance and no cookie-banner consent gate.
            Enable the Analytics tab for the project in the Vercel
            dashboard to start collecting. */}
        <Analytics />
        {/* Speed Insights — real-visitor Core Web Vitals (LCP, CLS, INP).
            Same deal as Analytics above: cookieless and served from our
            own origin (/_vercel/speed-insights/*), so `script-src 'self'`
            already covers it and it stays outside the consent gate.
            Worth having before the product-page video lands — it is the
            measurement that tells us whether the video hurt LCP. */}
        <SpeedInsights />
        {/* Own-side conversion funnel for /admin. Anonymous counters only —
            no cookie, no identifier, nothing personal — so it sits outside
            the consent gate for the same reason Analytics does. Inert
            until Upstash is configured; see lib/analytics/funnel.ts. */}
        <FunnelTracker />
        {/* Order attribution (utm / referrer / landing) — stored locally,
            sent only with an order. useSearchParams needs Suspense. */}
        <Suspense fallback={null}>
          <AttributionTracker />
        </Suspense>
        {/* Meta Pixel — inert until NEXT_PUBLIC_META_PIXEL_ID is set. */}
        <MetaPixel />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
