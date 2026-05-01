import type { NextConfig } from "next";

const SECURITY_HEADERS = [
  // Disallow being framed by other origins. Stops clickjacking on the
  // checkout / admin pages.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
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
