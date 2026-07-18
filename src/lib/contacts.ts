/**
 * Single source of truth for the company's contact channels. Client-safe
 * (no server imports) — used by the header, footer, contacts page, email
 * templates and Organization JSON-LD.
 *
 * The phone line handles ANY question — orders, returns, sizing help —
 * and the same number answers on WhatsApp.
 */

export const CONTACT_PHONE_DISPLAY = "(585) 880-8472";
export const CONTACT_PHONE_E164 = "+15858808472";
export const CONTACT_PHONE_HREF = `tel:${CONTACT_PHONE_E164}`;

/** wa.me deep link — opens a WhatsApp chat with the same number. */
export const WHATSAPP_HREF = "https://wa.me/15858808472";

/**
 * Social profiles. Empty string = the icon simply doesn't render, so
 * these can go live the moment the URLs are set on Vercel — no code
 * change needed.
 */
export const FACEBOOK_URL = process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "";
export const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "";
