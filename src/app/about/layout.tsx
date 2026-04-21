import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Elite Car Mats — premium EVA floor mat manufacturer for the U.S. market. Custom-cut, premium materials, 2-year warranty.",
  openGraph: {
    title: "About Elite Car Mats",
    description: "Premium EVA floor mat manufacturer for the U.S. market.",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
