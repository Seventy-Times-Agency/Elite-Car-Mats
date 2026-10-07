import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "../globals.css";
import { inter } from "../fonts";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";
import { I18nProvider } from "@/i18n/I18nProvider";
import { LOCALE_HTML_LANG } from "@/i18n/config";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitecarmats.us";

// Root layout of its own: the storefront root lives under [locale] and is
// static, while the panel stays per-request (session cookie, locale from
// the cookie / Accept-Language).

export const viewport: Viewport = {
  themeColor: "#0F0F0F",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  return {
    metadataBase: new URL(SITE),
    title: `${t("admin.metaTitle")} | Elite Car Mats`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale, dict, fallback } = await getDictionary();
  return (
    <html
      lang={LOCALE_HTML_LANG[locale]}
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <I18nProvider locale={locale} dict={dict} fallback={fallback}>
          <main id="main-content" className="flex-1">
            <div className="admin-root min-h-screen">{children}</div>
          </main>
        </I18nProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
