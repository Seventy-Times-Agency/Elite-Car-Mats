"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  getConsent,
  scrubOrderTokenFromUrl,
  CONSENT_EVENT,
} from "@/lib/consent";

export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID ?? "";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * GA4 bootstrap. Renders nothing until NEXT_PUBLIC_GA4_ID is configured
 * AND the visitor accepted the cookie banner — same consent gate as the
 * Meta Pixel, keeping the privacy policy's "analytics only with your
 * consent" promise true. App Router navigations don't reload the page,
 * so follow-up page_views fire from the pathname effect.
 */
export function GoogleAnalytics() {
  const pathname = usePathname();
  const first = useRef(true);
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    const update = () => {
      const ok = getConsent() === "accepted";
      // Drop the order token from the address bar BEFORE gtag.js mounts —
      // it would otherwise ship to GA inside page_location.
      if (ok && GA4_ID) scrubOrderTokenFromUrl();
      setConsented(ok);
    };
    update();
    window.addEventListener(CONSENT_EVENT, update);
    return () => window.removeEventListener(CONSENT_EVENT, update);
  }, []);

  useEffect(() => {
    if (!GA4_ID || !consented) return;
    if (first.current) {
      first.current = false;
      return;
    }
    window.gtag?.("event", "page_view", { page_path: pathname });
  }, [pathname, consented]);

  if (!GA4_ID || !consented) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA4_ID}');`}
      </Script>
    </>
  );
}
