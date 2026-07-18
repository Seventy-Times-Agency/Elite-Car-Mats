import type { NextConfig } from "next";

// Conservative CSP. Next.js App Router relies on inline scripts for
// hydration and Tailwind/React on inline styles, so 'unsafe-inline' stays —
// the policy's main value is blocking externally-hosted script injection
// and plugin/object embeds. `img-src https:` covers admin-entered blog
// covers and custom-brand logos; vercel.live keeps the preview-deployment
// feedback toolbar working. Stripe Checkout is a full-page redirect, no
// embed, so js.stripe.com is not needed.
const CSP = [
  "default-src 'self'",
  // va.vercel-scripts.com serves the @vercel/analytics debug build in
  // dev/preview; production loads the same-origin /_vercel/insights copy.
  // connect.facebook.net serves the Meta Pixel loader (fbevents.js);
  // its beacons are already covered by img-src/connect-src https:.
  "script-src 'self' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com https://connect.facebook.net https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https: wss:",
  "frame-src https://vercel.live",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
  // Disallow being framed by other origins. Stops clickjacking on the
  // checkout / admin pages.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: CSP },
  // Don't sniff MIME types — closes a class of XSS vectors.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Force HTTPS on every subdomain for two years.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Don't leak the previous URL to third-party assets / outbound links.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // We ask for nothing. Ensures a future buggy library can't quietly pop a
  // permission prompt.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self 'https://js.stripe.com')",
  },
  // Older browsers need this even though modern ones ignore it.
  { key: "X-XSS-Protection", value: "0" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "vl.imgix.net" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "commons.wikimedia.org" },
      { protocol: "https", hostname: "cdn.imagin.studio" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
