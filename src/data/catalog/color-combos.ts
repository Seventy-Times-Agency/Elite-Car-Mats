import type { EdgeColor, EvaColor } from "@/types";
import { edgeColors, evaColors } from "./colors";

/**
 * One (EVA base × edge trim) pair — the unit of the Facebook / Instagram
 * shop feed and of the /colors/<slug> landing pages. Slug format matches
 * the studio cards in public/mats: `<evaId>-<edgeId>`.
 */
export interface ColorCombo {
  slug: string;
  eva: EvaColor;
  edge: EdgeColor;
}

export const COLOR_COMBOS: ColorCombo[] = evaColors.flatMap((eva) =>
  edgeColors.map((edge) => ({ slug: `${eva.id}-${edge.id}`, eva, edge })),
);

/**
 * Colour ids themselves contain hyphens (`dark-brown`, `light-gray`), so
 * a slug can't be split on "-"; it is matched against the known pairs.
 */
export function parseColorCombo(slug: string): ColorCombo | null {
  return COLOR_COMBOS.find((c) => c.slug === slug) ?? null;
}

/**
 * Catalog id of a colour combo in the Meta feed. Pixel events on the
 * combo landing page must send exactly this id to match the item.
 */
export function colorComboFeedId(evaId: string, edgeId: string): string {
  return `ECM-COLOR-${evaId}-${edgeId}`;
}
