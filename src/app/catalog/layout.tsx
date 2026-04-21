import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Car Mats Catalog",
  description:
    "EVA car mats catalog for every popular make: Toyota, BMW, Audi, Tesla, Ford, and 40+ more. Custom-cut for your exact model and year.",
  openGraph: {
    title: "EVA Car Mats Catalog",
    description: "EVA mats for 290+ vehicle models. Precision fit by year.",
  },
};

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
