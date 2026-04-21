import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata = {
  title: "Terms of Service",
  description: "Terms for using the elitecarmats.us website and placing orders with Elite Car Mats.",
};

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      intro="By using elitecarmats.us and placing an order, you agree to the terms below."
      updatedAt="April 20, 2026"
    >
      <h2>1. About us</h2>
      <p>
        The elitecarmats.us website is owned and operated by Elite Car Mats, a company registered in the United
        States (Rochester, NY). We manufacture and sell custom EVA floor mats.
      </p>

      <h2>2. Orders & payment</h2>
      <ul>
        <li>An order is considered accepted once payment is received</li>
        <li>Prices are in U.S. dollars (USD) and include production</li>
        <li>Sales tax is added at checkout where applicable</li>
        <li>Shipping within the U.S. is free on orders over $99, otherwise $9 USPS Ground</li>
      </ul>

      <h2>3. Production & timelines</h2>
      <p>
        Every set is made to order — typically within 48 hours of payment. Standard USPS / UPS Ground shipping
        within the U.S. takes 3–7 business days.
      </p>

      <h2>4. Returns & exchanges</h2>
      <p>
        Full details are in our <a href="/refund">return policy</a>. In short: return within 30 days of delivery,
        in original packaging and with no signs of use.
      </p>

      <h2>5. Warranty</h2>
      <p>
        2 years on materials and stitching. Full details on the <a href="/warranty">warranty page</a>.
      </p>

      <h2>6. Intellectual property</h2>
      <p>
        All site materials (text, design, photos, the Elite Car Mats logo) are copyrighted and belong to Elite Car
        Mats. Unauthorized use is prohibited.
      </p>
      <p>
        Car manufacturer names and logos (Toyota, BMW, Ford, etc.) belong to their respective owners and are used
        solely to identify product compatibility.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        The site is provided &ldquo;as is.&rdquo; We don&apos;t guarantee continuous availability and are not
        liable for indirect damages. Our maximum liability for any order is limited to the amount of that order.
      </p>
      <p>
        Mats are designed for interior floor protection. We are not responsible for vehicle damage caused by
        improper installation or misuse.
      </p>

      <h2>8. Governing law</h2>
      <p>
        These terms are governed by the laws of the State of New York, USA. Any disputes are handled in the courts
        of that state.
      </p>

      <h2>9. Changes to these terms</h2>
      <p>
        We may update these terms. The last update date is shown at the top. By continuing to use the site after
        changes, you agree to the updated version.
      </p>

      <h2>10. Contact</h2>
      <p>
        For any questions: <a href="mailto:info@elitecarmats.us">info@elitecarmats.us</a>
      </p>
    </LegalLayout>
  );
}
