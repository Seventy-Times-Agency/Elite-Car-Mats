/**
 * Serialize a JSON-LD payload for a <script type="application/ld+json">
 * block. JSON.stringify alone does NOT escape "<", so a value containing
 * "</script>" (today: admin-controlled review/blog text; tomorrow: who
 * knows) would break out of the script element — classic stored XSS via
 * structured data. Escaping "<" as a unicode sequence is still valid
 * JSON and neutralizes it. U+2028/U+2029 are legal in JSON but illegal
 * in inline JS source, so they get escaped as well.
 */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
