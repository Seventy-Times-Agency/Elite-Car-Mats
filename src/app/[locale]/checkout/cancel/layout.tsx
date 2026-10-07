import type { Metadata } from "next";
import { localeAlternates } from "@/lib/seo/alternates";

// Rendered per request, as before: the page reads the Stripe return
// query during render, and only buyers ever reach it.
export const dynamic = "force-dynamic";

// The page is a client component, so its canonical lives here.
export async function generateMetadata(): Promise<Metadata> {
  return { alternates: await localeAlternates("/checkout/cancel") };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
