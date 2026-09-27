/**
 * Accessories — products that are NOT cut for a specific car. Code is the
 * source of truth here, like the mat catalog in src/data/catalog/: admin
 * can override price and availability (same tables as the mat add-ons)
 * but not invent products. Copy lives in the i18n dictionaries under
 * `acc.<slug>.*` and `acc.variant.<id>`.
 *
 * Variant colours reuse the mat EVA / edge colour ids on purpose: the
 * order row can then keep its colorId / edgeColorId foreign keys, every
 * renderer localises the names through the existing colour tables, and
 * the configurator can pick the trim that matches the customer's mats.
 */

export interface AccessoryVariant {
  id: string;
  /** EVA (body) colour id from src/data/catalog/colors.ts. */
  evaColorId: string;
  /** Edge (trim) colour id from src/data/catalog/colors.ts. */
  edgeColorId: string;
  /** Public paths, first one is the card image. */
  images: string[];
}

export interface Accessory {
  slug: string;
  /** Default USD price; admin override key is `accessory:<slug>`. */
  price: number;
  variants: AccessoryVariant[];
  /** Lifestyle shots shared by all variants (gallery tail). */
  gallery: string[];
}

const ORGANIZER_IMG = "/accessories/trunk-organizer";

export const ACCESSORIES: Accessory[] = [
  {
    slug: "trunk-organizer",
    price: 49,
    variants: [
      {
        id: "black-red",
        evaColorId: "black",
        edgeColorId: "red",
        images: [
          `${ORGANIZER_IMG}/organizer-black-red-closed.jpg`,
          `${ORGANIZER_IMG}/organizer-black-red-open.jpg`,
          `${ORGANIZER_IMG}/organizer-black-red-trunk.jpg`,
        ],
      },
      {
        id: "gray",
        evaColorId: "gray",
        edgeColorId: "light-gray",
        images: [
          `${ORGANIZER_IMG}/organizer-grey-closed.jpg`,
          `${ORGANIZER_IMG}/organizer-grey-open.jpg`,
          `${ORGANIZER_IMG}/organizer-grey-trunk.jpg`,
          `${ORGANIZER_IMG}/organizer-grey-trunk-2.jpg`,
        ],
      },
    ],
    // Deliberately empty: a shared shot would put the wrong colour into
    // a variant's gallery. Every image belongs to exactly one variant.
    gallery: [],
  },
];

export type AccessorySlug = (typeof ACCESSORIES)[number]["slug"];

export const ACCESSORY_SLUGS = ACCESSORIES.map((a) => a.slug) as [
  AccessorySlug,
  ...AccessorySlug[],
];

export function findAccessory(slug: string): Accessory | undefined {
  return ACCESSORIES.find((a) => a.slug === slug);
}

export function findAccessoryVariant(
  slug: string,
  variantId: string,
): { accessory: Accessory; variant: AccessoryVariant } | undefined {
  const accessory = findAccessory(slug);
  const variant = accessory?.variants.find((v) => v.id === variantId);
  return accessory && variant ? { accessory, variant } : undefined;
}

/**
 * The organizer trim that goes with a chosen mat edge colour: red edge →
 * black/red organizer, anything else → grey. Used by the configurator
 * cross-sell so the suggested item matches what the customer just built.
 */
export function organizerVariantForEdge(edgeColorId: string): AccessoryVariant {
  const organizer = findAccessory("trunk-organizer")!;
  return (
    organizer.variants.find((v) => v.edgeColorId === edgeColorId) ??
    organizer.variants.find((v) => v.id === "gray")!
  );
}

/** Stable id used by the Meta pixel / CAPI and the Merchant feed. */
export function accessorySku(slug: string, variantId: string): string {
  return `ECM-ACC-${slug}-${variantId}`;
}
