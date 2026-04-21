import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata = {
  title: "Privacy Policy",
  description: "How Elite Car Mats collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      intro="We respect your privacy and collect only the minimum data required to process and deliver your order."
      updatedAt="April 20, 2026"
    >
      <h2>1. Data we collect</h2>
      <p>
        To process your order we collect: name, email, phone, and shipping address. This information is used solely
        for order fulfillment and related communication.
      </p>
      <p>
        When you visit the site, we automatically collect: IP address (for spam protection), browser technical data,
        and pages viewed. This data is anonymized and used to analyze site performance.
      </p>

      <h2>2. How we use your data</h2>
      <ul>
        <li>Processing and shipping your order</li>
        <li>Communicating with you about order status (email, phone)</li>
        <li>Shipment notifications and tracking numbers</li>
        <li>Improving the website (anonymized analytics)</li>
      </ul>
      <p>
        We do <strong>not</strong> share your data with third parties, except with shipping carriers (USPS, UPS) for
        the physical delivery of your order.
      </p>

      <h2>3. Cookies</h2>
      <p>
        The site uses essential cookies for cart functionality and interface language preferences. Analytics cookies
        are enabled only with your consent (banner on your first visit).
      </p>

      <h2>4. Storage & security</h2>
      <p>
        Order data is stored in a secure database on U.S.-based servers. Only our staff has access. We do{" "}
        <strong>not</strong> store card details — payments are processed by a certified processor (Stripe).
      </p>

      <h2>5. Your rights</h2>
      <p>
        You may request a copy of your data, correction, or complete deletion. Email{" "}
        <a href="mailto:info@elitecarmats.us">info@elitecarmats.us</a> with the subject &ldquo;Privacy request&rdquo;.
      </p>
      <p>
        California residents (CCPA) and EU residents (GDPR) have expanded rights regarding data access, portability,
        and deletion — all requests are processed within 30 days.
      </p>

      <h2>6. Children</h2>
      <p>
        This site is not intended for individuals under 16. We don&apos;t knowingly collect data from children. If
        you believe we have received such data, please contact us — we&apos;ll remove it within 72 hours.
      </p>

      <h2>7. Policy changes</h2>
      <p>
        We may update this policy. The last update date is shown at the top. For material changes, we&apos;ll also
        email customers with active orders.
      </p>

      <h2>8. Contact</h2>
      <p>
        Elite Car Mats · Rochester, NY, USA · <a href="mailto:info@elitecarmats.us">info@elitecarmats.us</a>
      </p>
    </LegalLayout>
  );
}
