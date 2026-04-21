import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata = {
  title: "Returns & Exchanges",
  description: "Return and exchange policy for Elite Car Mats: 30 days, no questions asked.",
};

export default function RefundPage() {
  return (
    <LegalLayout
      title="Returns & Exchanges"
      intro="If the mats don&apos;t work for you, we&apos;ll refund you. If you picked the wrong set, we&apos;ll exchange them with no additional production charge."
      updatedAt="April 20, 2026"
    >
      <h2>30-day return window</h2>
      <p>
        You have <strong>30 calendar days</strong> from the delivery date to decide whether to keep or return your
        mats.
      </p>

      <h2>Return conditions</h2>
      <ul>
        <li>Mats must be in their <strong>original packaging</strong></li>
        <li>No signs of use (no dirt, scuffs, or odors)</li>
        <li>Badges and labels intact</li>
      </ul>

      <h2>How to return</h2>
      <ol>
        <li>Email <a href="mailto:info@elitecarmats.us">info@elitecarmats.us</a> with the subject &ldquo;Return&rdquo; and your order number</li>
        <li>We&apos;ll send the return address and instructions</li>
        <li>Pack the mats in the original box and ship them back</li>
        <li>Once we receive the package, we&apos;ll refund you within 5 business days</li>
      </ol>

      <h2>Who pays for return shipping</h2>
      <ul>
        <li><strong>Defect or our mistake</strong> — we cover return shipping</li>
        <li><strong>Wrong fit or change of mind</strong> — customer covers return shipping (~$10–15 USPS Ground)</li>
      </ul>

      <h2>Exchanges</h2>
      <p>
        If you picked the wrong set or color, we&apos;ll exchange them with no additional production charge. You
        only cover the return shipping.
      </p>

      <h2>Refunds</h2>
      <p>
        Refunds are issued to the original payment method (card, Apple Pay, Google Pay). Settlement timing depends
        on your bank — usually 3–7 business days after we issue the refund.
      </p>

      <h2>What can&apos;t be returned</h2>
      <ul>
        <li>Mats with signs of use</li>
        <li>Custom-designed mats produced outside our standard catalog</li>
        <li>Orders placed more than 30 days ago</li>
      </ul>

      <h2>Damage on arrival</h2>
      <p>
        If the package arrives damaged or you find a manufacturing defect, photograph the issue and email us within
        48 hours at <a href="mailto:info@elitecarmats.us">info@elitecarmats.us</a>. We&apos;ll replace it free or
        refund the full amount.
      </p>
    </LegalLayout>
  );
}
