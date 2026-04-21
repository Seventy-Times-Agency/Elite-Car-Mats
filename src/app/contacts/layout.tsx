import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Контакты",
  description:
    "Свяжитесь с EliteCarMats: info@elitecarmats.us. Rochester, NY, USA. Доставка по всей территории США.",
  openGraph: {
    title: "Контакты Elite Car Mats",
    description: "info@elitecarmats.us · Rochester, NY · Доставка по США.",
  },
};

export default function ContactsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
