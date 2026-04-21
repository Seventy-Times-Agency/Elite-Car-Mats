import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Каталог автоковриков",
  description:
    "Каталог EVA автоковриков под все популярные марки авто: Toyota, BMW, Audi, Tesla, Ford и более 40 других. Индивидуальный раскрой под вашу модель и год.",
  openGraph: {
    title: "Каталог EVA автоковриков",
    description: "EVA коврики под 290+ моделей авто. Точная подгонка по году выпуска.",
  },
};

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
