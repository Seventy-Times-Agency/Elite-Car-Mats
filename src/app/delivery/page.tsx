import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata = {
  title: "Shipping",
  description: "Elite Car Mats shipping terms for the U.S.: free on orders over $99, express 2–3 days.",
};

export default function DeliveryPage() {
  return (
    <LegalLayout
      title="Shipping"
      intro="We ship orders from Rochester, NY within 48 hours of production. Shipping nationwide across the United States."
      updatedAt="April 20, 2026"
    >
      <h2>Timelines</h2>
      <ul>
        <li><strong>Production:</strong> up to 48 hours after payment</li>
        <li><strong>USPS / UPS Ground:</strong> 3–7 business days within the U.S.</li>
        <li><strong>Express (UPS 2nd Day):</strong> 2–3 business days — $19</li>
      </ul>

      <h2>Cost</h2>
      <ul>
        <li><strong>Free</strong> on orders over $99 (standard shipping)</li>
        <li>$9 USPS / UPS Ground on orders under $99</li>
        <li>$19 express shipping 2–3 days to any destination</li>
      </ul>

      <h2>Where we ship</h2>
      <p>All 50 U.S. states + District of Columbia.</p>
      <p>
        We ship to Canada and Mexico on request — the cost is quoted individually; email{" "}
        <a href="mailto:info@elitecarmats.us">info@elitecarmats.us</a>.
      </p>

      <h2>Tracking</h2>
      <p>
        As soon as your order ships, you&apos;ll receive an email with a tracking number and a link to USPS / UPS.
        Status is also available on the{" "}
        <a href="/track">order tracking page</a>.
      </p>

      <h2>Packaging</h2>
      <p>
        Every set is packed in a heavy kraft mailer with anti-deformation protection. Badges and small accessories
        go in a separate bag inside. Packaging uses eco-friendly materials.
      </p>

      <h2>If your package doesn&apos;t arrive</h2>
      <p>
        If the tracking shows delivered but you didn&apos;t receive the package, email us. We&apos;ll open an
        investigation with the carrier — in most cases it&apos;s found within 3–5 days.
      </p>
      <p>
        If the carrier confirms the package is lost, we&apos;ll produce and ship a replacement free of charge.
      </p>

      <h2>Remote regions (Alaska, Hawaii)</h2>
      <p>
        Shipping is available, but delivery takes 7–14 days. Standard rates apply; express is not available.
      </p>
    </LegalLayout>
  );
}
