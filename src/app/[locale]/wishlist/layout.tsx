import type { Metadata } from "next";
import { localeAlternates } from "@/lib/seo/alternates";

// The page is a client component, so its canonical lives here.
export async function generateMetadata(): Promise<Metadata> {
  return { alternates: await localeAlternates("/wishlist") };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
