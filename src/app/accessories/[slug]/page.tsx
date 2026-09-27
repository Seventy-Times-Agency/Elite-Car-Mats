import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ACCESSORIES, accessorySku, findAccessory } from "@/data/accessories";
import { getAddonAvailabilityCached } from "@/lib/availability";
import { loadPriceOverridesCached } from "@/lib/pricing-overrides";
import { getAccessoryPrice } from "@/lib/pricing";
import { getDictionary } from "@/i18n/getDictionary";
import { makeT } from "@/i18n/dictionary";
import { localeAlternates } from "@/lib/seo/alternates";
import { jsonLdString } from "@/lib/seo/json-ld";
import { AccessoryClient } from "./AccessoryClient";

export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitecarmats.us";

interface Params {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string }>;
}

export function generateStaticParams() {
  return ACCESSORIES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { dict, fallback } = await getDictionary();
  const t = makeT(dict, fallback);
  const accessory = findAccessory(slug);
  if (!accessory) return { title: t("acc.listTitle") };
  return {
    title: t(`acc.${slug}.name`),
    description: t(`acc.${slug}.metaDesc`),
    alternates: await localeAlternates(`/accessories/${slug}`),
    openGraph: {
      type: "website",
      title: t(`acc.${slug}.name`),
      description: t(`acc.${slug}.metaDesc`),
      images: [`${SITE}${accessory.variants[0].images[0]}`],
    },
  };
}

export default async function AccessoryPage({ params, searchParams }: Params) {
  const { slug } = await params;
  const { variant } = await searchParams;
  // Catalog lookup only — no database on this page.
  const accessory = findAccessory(slug);
  if (!accessory) notFound();

  const [{ dict, fallback }, availability, overrides] = await Promise.all([
    getDictionary(),
    getAddonAvailabilityCached(),
    loadPriceOverridesCached(),
  ]);
  const t = makeT(dict, fallback);
  const price = getAccessoryPrice(slug, overrides);
  const available = slug === "trunk-organizer" ? availability.organizer : true;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: t(`acc.${slug}.name`),
    description: t(`acc.${slug}.metaDesc`),
    image: accessory.variants.flatMap((v) => v.images.map((i) => `${SITE}${i}`)),
    brand: { "@type": "Brand", name: "Elite Car Mats" },
    material: "EVA",
    offers: accessory.variants.map((v) => ({
      "@type": "Offer",
      sku: accessorySku(slug, v.id),
      name: t(`acc.variant.${v.id}`),
      url: `${SITE}/accessories/${slug}?variant=${v.id}`,
      price: price.toFixed(2),
      priceCurrency: "USD",
      availability: available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "USD" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
      },
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t("acc.breadcrumb"), item: `${SITE}/accessories` },
      { "@type": "ListItem", position: 2, name: t(`acc.${slug}.name`), item: `${SITE}/accessories/${slug}` },
    ],
  };

  return (
    <div className="py-10 lg:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumbJsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-[11px] text-text-faint mb-6" aria-label="Breadcrumb">
          <Link href="/accessories" className="hover:text-text">
            {t("acc.breadcrumb")}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-text-dim">{t(`acc.${slug}.name`)}</span>
        </nav>
        <AccessoryClient
          accessory={accessory}
          available={available}
          initialVariant={variant}
        />
      </div>
    </div>
  );
}
