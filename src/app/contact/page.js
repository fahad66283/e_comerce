import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact Us – ShopEase",
};

const info = [
  { icon: "📧", title: "Email", text: "Kamisofts@gmail.com" },
  { icon: "📞", title: "Phone", text: "+92 300 0000000" },
  { icon: "📍", title: "Address", text: "Lahore, Pakistan" },
  { icon: "🕘", title: "Working Hours", text: "Mon – Sat, 9am – 6pm" },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Contact Us</h1>
        <p className="mt-3 text-gray-600">
          Have a question about an order or a product? We&apos;re here to help.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4">
          {info.map((item) => (
            <div key={item.title} className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
              <span className="text-3xl">{item.icon}</span>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-2">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
