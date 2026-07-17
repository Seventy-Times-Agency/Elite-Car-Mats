"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { META_PIXEL_ID } from "@/lib/analytics";
import { getConsent, CONSENT_EVENT } from "@/lib/consent";

/**
 * Meta Pixel bootstrap. Renders nothing until NEXT_PUBLIC_META_PIXEL_ID
 * is configured AND the visitor has accepted cookies — the privacy
 * policy promises analytics only with consent, so loading fbevents.js
 * unconditionally would make that promise false (an FTC §5 / CPRA
 * "sharing" problem, not just a courtesy). The init snippet fires the
 * first PageView; App Router client-side navigations fire follow-up
 * PageViews from the pathname effect (the browser never reloads, so the
 * snippet alone would only count the landing page).
 */
export function MetaPixel() {
  const pathname = usePathname();
  const first = useRef(true);
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    const update = () => setConsented(getConsent() === "accepted");
    update();
    window.addEventListener(CONSENT_EVENT, update);
    return () => window.removeEventListener(CONSENT_EVENT, update);
  }, []);

  useEffect(() => {
    if (!META_PIXEL_ID || !consented) return;
    if (first.current) {
      first.current = false;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [pathname, consented]);

  if (!META_PIXEL_ID || !consented) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
