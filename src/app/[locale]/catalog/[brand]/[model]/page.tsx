import { renderProductPage } from "./product-page";

// No paths at build time: each one renders on its first request and is
// then served from the ISR cache until a data tag it read (`catalog`,
// `pricing`, …) is revalidated or the week-long data-cache TTL runs out.
export function generateStaticParams() {
  return [];
}

interface Params {
  params: Promise<{ brand: string; model: string }>;
}

export default async function ProductPage({ params }: Params) {
  const { brand, model } = await params;
  return renderProductPage(brand, model);
}
