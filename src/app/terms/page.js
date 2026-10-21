import Link from "next/link";
import InfoPageLayout, { PolicySection } from "@/components/InfoPageLayout";

export const metadata = {
  title: "Terms & Conditions – HAK Store",
};

export default function TermsPage() {
  return (
    <InfoPageLayout
      eyebrow="Policies"
      title="Terms & Conditions"
      intro="Please read these terms carefully before using HAK Store."
      updated="21 October 2026"
    >
      <PolicySection title="1. About these terms">
        <p>
          By using this website or placing an order, you agree to these Terms &amp; Conditions. If you
          do not agree, please do not use the website.
        </p>
      </PolicySection>

      <PolicySection title="2. Your account">
        <ul>
          <li>You must give accurate information when creating an account.</li>
          <li>You are responsible for keeping your password safe and for all activity on your account.</li>
          <li>We may suspend accounts that are used for fraud or misuse.</li>
        </ul>
      </PolicySection>

      <PolicySection title="3. Products and prices">
        <ul>
          <li>We try to show products, colours and descriptions as accurately as possible.</li>
          <li>Prices are in Pakistani Rupees (Rs.) and may change without notice.</li>
          <li>If a product is listed at an incorrect price, we may cancel the order and let you know.</li>
        </ul>
      </PolicySection>

      <PolicySection title="4. Orders">
        <p>
          Your order is an offer to buy. We may accept or decline it, for example if an item is out of
          stock. We will contact you if there is a problem with your order.
        </p>
      </PolicySection>

      <PolicySection title="5. Payment">
        <p>
          We currently accept Cash on Delivery. Please have the full amount ready when your order
          arrives.
        </p>
      </PolicySection>

      <PolicySection title="6. Delivery">
        <p>
          Delivery times are estimates and may vary. Shipping is free on orders over Rs. 5,000; a flat
          fee applies to smaller orders.
        </p>
      </PolicySection>

      <PolicySection title="7. Returns">
        <p>
          Returns and refunds are handled according to our{" "}
          <Link href="/return-policy" className="font-bold text-brand-700 underline">Return Policy</Link>.
        </p>
      </PolicySection>

      <PolicySection title="8. Limitation of liability">
        <p>
          To the extent allowed by law, HAK Store is not liable for indirect or unexpected losses
          arising from the use of this website or our products.
        </p>
      </PolicySection>

      <PolicySection title="9. Contact">
        <p>
          Questions about these terms? Email us at Kamisofts@gmail.com or use our{" "}
          <Link href="/contact" className="font-bold text-brand-700 underline">contact page</Link>.
        </p>
      </PolicySection>
    </InfoPageLayout>
  );
}
