import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Elite Car Mats: info@elitecarmats.us. Rochester, NY, USA. Shipping nationwide across the U.S.",
  openGraph: {
    title: "Contact Elite Car Mats",
    description: "info@elitecarmats.us · Rochester, NY · Nationwide U.S. shipping.",
  },
};

export default function ContactsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
