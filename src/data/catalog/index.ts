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
 *   categoryLabels — UI labels for car / suv / truck / commercial buckets
 */

import { brands as brandsList } from "./brands";
import { mockModels as modelsList } from "./models";

// Hydrate brand.modelsCount from the model list. Done here (not in
// brands.ts) to avoid a circular import.
for (const b of brandsList) {
  b.modelsCount = modelsList.filter((m) => m.brandId === b.id).length;
}

export const brands = brandsList;
export const mockModels = modelsList;

export { evaColors, edgeColors } from "./colors";
export { matSets, categoryLabels } from "./mat-sets";
export { badges } from "./brands";
