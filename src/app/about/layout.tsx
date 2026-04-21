import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "О компании",
  description:
    "EliteCarMats — производитель премиальных EVA автоковриков для рынка США. Индивидуальный раскрой, высокое качество материалов, гарантия 2 года.",
  openGraph: {
    title: "О компании Elite Car Mats",
    description: "Производитель премиальных EVA автоковриков для рынка США.",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
