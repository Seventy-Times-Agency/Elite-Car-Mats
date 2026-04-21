interface Props {
  brand: string;
  model: string;
  price: number;
  description?: string;
  image?: string;
  url: string;
}

export function ProductJsonLd({ brand, model, price, description, image, url }: Props) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `EVA автоковрики для ${brand} ${model}`,
    description:
      description ??
      `Премиальные EVA коврики с индивидуальным раскроем для ${brand} ${model}. CNC-резка по 3D-лекалу, окантовка 4 цвета на выбор.`,
    brand: { "@type": "Brand", name: "Elite Car Mats" },
    category: "Auto Floor Mats",
    sku: `ECM-${brand.toLowerCase().replace(/\s+/g, "-")}-${model.toLowerCase().replace(/\s+/g, "-")}`,
    image: image ? [image] : undefined,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "USD",
      price: price.toFixed(2),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "Elite Car Mats" },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "USD" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "US",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitecarmats.us";
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Elite Car Mats",
    url: SITE,
    logo: `${SITE}/icon`,
    email: "info@elitecarmats.us",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Rochester",
      addressRegion: "NY",
      addressCountry: "US",
    },
    sameAs: [],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
