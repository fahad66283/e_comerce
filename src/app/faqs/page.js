import Link from "next/link";
import InfoPageLayout from "@/components/InfoPageLayout";

export const metadata = {
  title: "FAQs – HAK Store",
};

const groups = [
  {
    title: "Orders & Delivery",
    items: [
      {
        q: "How long does delivery take?",
        a: "Orders are usually delivered within 2–5 working days, depending on your city.",
      },
      {
        q: "How much does shipping cost?",
        a: "Shipping is free on orders over Rs. 5,000. Smaller orders have a flat shipping fee of Rs. 250.",
      },
      {
        q: "How can I track my order?",
        a: "Log in and open My Account to see all your orders and their status (Processing, Shipped, Delivered).",
      },
      {
        q: "Can I change or cancel my order?",
        a: "Yes, as long as it hasn't been shipped yet. Contact us as soon as possible with your order number.",
      },
    ],
  },
  {
    title: "Payments",
    items: [
      {
        q: "Which payment methods do you accept?",
        a: "We currently accept Cash on Delivery. Card payments are coming soon.",
      },
      {
        q: "Are prices inclusive of taxes?",
        a: "Yes, all prices shown on the website include applicable taxes.",
      },
    ],
  },
  {
    title: "Returns & Refunds",
    items: [
      {
        q: "What is your return policy?",
        a: "You can return most items within 7 days of delivery if they are unused and in their original packaging.",
        link: { href: "/return-policy", label: "Read the full Return Policy" },
      },
      {
        q: "What if my item arrives damaged?",
        a: "Contact us within 48 hours of delivery with photos of the item and we'll arrange a replacement or refund.",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        q: "Do I need an account to order?",
        a: "No, you can check out as a guest. With an account you can see all your orders in one place.",
      },
      {
        q: "I forgot my password. What should I do?",
        a: "Please contact our support team and we'll help you get back into your account.",
      },
    ],
  },
];

export default function FaqsPage() {
  return (
    <InfoPageLayout
      eyebrow="Help"
      title="Frequently asked questions"
      intro="Quick answers to the questions we hear most often."
    >
      <div className="grid gap-10">
        {groups.map((group) => (
          <section key={group.title}>
            <h2 className="mb-4 text-xl">{group.title}</h2>
            <div className="grid gap-3">
              {group.items.map((item) => (
                <details key={item.q} className="card group px-5 py-4 open:border-ink">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-extrabold">
                    {item.q}
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-grey-100 transition group-open:rotate-45 group-open:bg-brand-500"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-grey-700">{item.a}</p>
                  {item.link && (
                    <Link href={item.link.href} className="mt-2 inline-block text-sm font-extrabold text-brand-700 hover:underline">
                      {item.link.label} →
                    </Link>
                  )}
                </details>
              ))}
            </div>
          </section>
        ))}

        <div className="flex flex-col items-start justify-between gap-4 rounded-panel bg-brand-50 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg">Still have a question?</h2>
            <p className="text-grey-500">Our team is happy to help.</p>
          </div>
          <Link href="/contact" className="btn btn-dark">
            Contact Us
          </Link>
        </div>
      </div>
    </InfoPageLayout>
  );
}
