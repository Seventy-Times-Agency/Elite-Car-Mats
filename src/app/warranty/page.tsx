import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata = {
  title: "Warranty",
  description: "2-year warranty on materials and stitching for Elite Car Mats. Free replacement on manufacturing defects.",
};

export default function WarrantyPage() {
  return (
    <LegalLayout
      title="2-Year Warranty"
      intro="Full warranty on materials and workmanship. Manufacturing defects are replaced free — no inspections, no hassle."
      updatedAt="April 20, 2026"
    >
      <h2>What the warranty covers</h2>
      <ul>
        <li>Edge stitching that comes apart or tears</li>
        <li>Mat deformation under normal use</li>
        <li>EVA cracking within the normal temperature range (−40°F to 160°F)</li>
        <li>Metal badge delamination or breakage</li>
        <li>Edge color defects (fading, inconsistency) during the first year</li>
      </ul>

      <h2>What the warranty does not cover</h2>
      <ul>
        <li>Normal wear (worn heel areas, heel scuffs) — EVA typically lasts 4–5 years of active use</li>
        <li>Damage from sharp objects, chemicals, or open flame</li>
        <li>Stains that can&apos;t be removed with standard cleaning</li>
        <li>Deformation from long-term storage while rolled up</li>
        <li>Improper installation (mats interfering with pedals, etc.)</li>
      </ul>

      <h2>Warranty period</h2>
      <p>
        <strong>2 years</strong> from the delivery date of your order. The start date is the delivery date recorded
        by USPS / UPS tracking.
      </p>

      <h2>How to claim a warranty</h2>
      <ol>
        <li>Take photos of the defect (a wide shot and a close-up)</li>
        <li>Email <a href="mailto:info@elitecarmats.us">info@elitecarmats.us</a> with the subject &ldquo;Warranty&rdquo; and your order number</li>
        <li>Attach the photos and describe when the issue appeared</li>
        <li>We respond within 1 business day</li>
        <li>If the defect is confirmed, we produce and ship a replacement at no cost</li>
      </ol>

      <h2>Replacement or refund</h2>
      <p>
        By default we offer a replacement mat. If production is no longer possible (for example, the pattern has
        been discontinued), we issue a full refund.
      </p>

      <h2>Shipping for replacements</h2>
      <p>
        In most cases you <strong>don&apos;t need</strong> to ship the old mat back — photos are enough. If a
        physical inspection is needed, we cover return shipping.
      </p>
    </LegalLayout>
  );
}
