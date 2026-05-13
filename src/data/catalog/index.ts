/**
 * Catalog of every brand / model / mat-set / colour / badge the storefront
 * knows about. Until we wire up an admin CRUD flow this is the source of
 * truth — `lib/db/seed.ts` mirrors it into Postgres on first run.
 *
 *   brands        — the master brand list (45+ marques + commercial trucks)
 *   models        — every CarModel with year ranges + body type
 *   matSets       — front / full / cargo / full+cargo
 *   evaColors     — base mat colours
 *   edgeColors    — surrounding-edge colours
 *   badges        — metal logo badges (only for brands the supplier stocks)
 */

import type { VehicleCategory } from "@/types";
import { brands as brandsList, BRAND_POPULARITY } from "./brands";
import { mockModels as modelsList } from "./models";

// Hydrate brand.modelsCount, popularity and the set of distinct
// VehicleCategory values its models cover. Done here (not in brands.ts)
// because it depends on the model list and we want a single pass.
for (const b of brandsList) {
  const myModels = modelsList.filter((m) => m.brandId === b.id);
  b.modelsCount = myModels.length;
  b.popularity = BRAND_POPULARITY[b.id] ?? 999;
  const cats = new Set<VehicleCategory>();
  for (const m of myModels) cats.add(m.category);
  b.categories = Array.from(cats);
}

export const brands = brandsList;
export const mockModels = modelsList;

export { evaColors, edgeColors } from "./colors";
export { matSets } from "./mat-sets";
export { badges } from "./brands";
