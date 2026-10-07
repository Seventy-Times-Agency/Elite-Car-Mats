import type { MatSetType } from "@/types";

// Every mat-set id; which of them a vehicle offers depends on its profile.
const MAT_SET_TYPES: readonly MatSetType[] = ["front", "full", "cargo", "full-cargo"];

export function isMatSetType(v: unknown): v is MatSetType {
  return typeof v === "string" && (MAT_SET_TYPES as readonly string[]).includes(v);
}

/** /catalog/<brand>/<model> — the only page a `?set=` deep link targets. */
export const MODEL_PAGE_PATH = /^\/catalog\/[^/]+\/[^/]+$/;

/**
 * Internal route a `?set=` model request is rewritten onto by
 * src/proxy.ts (/catalog/<brand>/<model>/set/<set>). Never a public
 * address: a direct request is redirected back to the `?set=` form.
 */
export const SET_VARIANT_PATH = /^(\/catalog\/[^/]+\/[^/]+)\/set\/([^/]+)$/;
