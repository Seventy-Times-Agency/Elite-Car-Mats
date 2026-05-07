import type { Dict } from "../dictionary";
import { storefront } from "./uk/storefront";
import { operations } from "./uk/operations";

/**
 * UK dictionary. Split by audience:
 *   storefront — public-facing UI strings (nav, hero, catalog, cart, …)
 *   operations — admin panel + transactional email templates
 *
 * Add new keys to whichever sibling matches their audience. The two
 * objects are merged here; key overlap between them is a bug.
 */
export const uk: Dict = { ...storefront, ...operations };
