import { notFound } from "next/navigation";
import { isMatSetType } from "@/lib/mat-set-variant";
import { renderProductPage } from "../../product-page";

// `?set=` deep links (Merchant / Meta feed items) land here through a
// rewrite in src/proxy.ts, so the server HTML carries that set's price.
// The visitor's URL and the canonical (inherited from ../../layout.tsx)
// stay the plain model URL. Rendered on first hit, then ISR-cached like
// the plain page; at most one copy per set id.
export function generateStaticParams() {
  return [];
}

interface Params {
  params: Promise<{ brand: string; model: string; set: string }>;
}

export default async function ProductSetPage({ params }: Params) {
  const { brand, model, set } = await params;
  if (!isMatSetType(set)) notFound();
  return renderProductPage(brand, model, set);
}
