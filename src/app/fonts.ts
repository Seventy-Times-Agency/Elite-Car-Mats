import localFont from "next/font/local";

// Shared by both root layouts ([locale] storefront and /admin).
export const inter = localFont({
  src: "./fonts/inter-var.woff2",
  variable: "--font-inter",
  display: "swap",
});
