import type { Dict } from "../dictionary";
import { storefront } from "./en/storefront";
import { operations } from "./en/operations";

/**
 * EN dictionary. Split by audience:
 *   storefront — public-facing UI strings (nav, hero, catalog, cart, …)
 *   operations — admin panel + transactional email templates
 *
 * Add new keys to whichever sibling matches their audience. The two
 * objects are merged here; key overlap between them is a bug.
 */
export const en: Dict = { ...storefront, ...operations };
