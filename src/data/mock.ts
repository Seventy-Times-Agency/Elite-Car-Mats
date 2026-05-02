/**
 * Backwards-compatibility shim. The catalog has been split into
 * `src/data/catalog/*` and the customer reviews into `src/data/reviews.ts`.
 * New code should import from `@/data/catalog` and `@/data/reviews`
 * directly; this file only exists so external scripts (and any leftover
 * imports we miss) keep working.
 *
 * Safe to delete once nothing imports `@/data/mock` anymore.
 */

export {
  brands,
  mockModels,
  matSets,
  evaColors,
  edgeColors,
  badges,
  categoryLabels,
} from "./catalog";
export { mockReviews } from "./reviews";
