import Link from "next/link";
import InfoPageLayout, { PolicySection } from "@/components/InfoPageLayout";

export const metadata = {
  title: "Return Policy – HAK Store",
};

export default function ReturnPolicyPage() {
  return (
    <InfoPageLayout
      eyebrow="Policies"
      title="Return & Refund Policy"
      intro="We want you to love what you buy. If something isn't right, here's how returns work."
      updated="21 October 2026"
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: "📅", title: "7 days", text: "to request a return" },
          { icon: "📦", title: "Unused items", text: "in original packaging" },
          { icon: "💵", title: "Refund", text: "within 5–7 working days" },
        ].map((c) => (
          <div key={c.title} className="rounded-card border border-grey-200 bg-grey-50 p-5 text-center">
            <div className="text-2xl">{c.icon}</div>
            <p className="mt-2 font-extrabold">{c.title}</p>
            <p className="text-sm text-grey-500">{c.text}</p>
          </div>
        ))}
      </div>

      <PolicySection title="1. Eligibility">
        <p>You can return an item within 7 days of delivery if:</p>
        <ul>
          <li>It is unused, unwashed and in the same condition you received it.</li>
          <li>It is in its original packaging with all tags, accessories and manuals.</li>
          <li>You have your order number as proof of purchase.</li>
        </ul>
      </PolicySection>

      <PolicySection title="2. Items that cannot be returned">
        <ul>
          <li>Personal care and hygiene products once opened.</li>
          <li>Items marked as final sale.</li>
          <li>Items damaged through misuse after delivery.</li>
        </ul>
      </PolicySection>

      <PolicySection title="3. Damaged or wrong items">
        <p>
          If your item arrives damaged, faulty or is not what you ordered, contact us within 48 hours of
          delivery with your order number and photos. We will replace it or refund you in full,
          including shipping costs.
        </p>
      </PolicySection>

      <PolicySection title="4. How to return an item">
        <ul>
          <li>
            <Link href="/contact" className="font-bold text-brand-700 underline">Contact us</Link> with your
            order number and the item you want to return.
          </li>
          <li>We will confirm your return and arrange a pickup or give you a return address.</li>
          <li>Pack the item securely in its original packaging.</li>
        </ul>
      </PolicySection>

      <PolicySection title="5. Refunds">
        <p>
          Once we receive and inspect your return, we will process your refund within 5–7 working days.
          For Cash on Delivery orders, refunds are made by bank transfer or mobile wallet. Original
          shipping fees are non-refundable unless the item was damaged or incorrect.
        </p>
      </PolicySection>

      <PolicySection title="6. Exchanges">
        <p>
          Want a different size or colour? Request an exchange within 7 days, subject to availability.
        </p>
      </PolicySection>
    </InfoPageLayout>
  );
}
