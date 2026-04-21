import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Отследить заказ",
  description: "Проверьте статус вашего заказа Elite Car Mats по номеру.",
  robots: { index: false, follow: false },
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
