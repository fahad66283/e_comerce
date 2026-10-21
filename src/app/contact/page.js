import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact Us – HAK Store",
};

const info = [
  { icon: "📞", title: "Call Us", text: "+92 300 0000000" },
  { icon: "✉️", title: "Email", text: "Kamisofts@gmail.com" },
  { icon: "📍", title: "Address", text: "Lahore, Pakistan" },
  { icon: "🕐", title: "Working Hours", text: "Mon – Sat, 9am – 6pm" },
];

export default function ContactPage() {
  return (
    <div className="container-page py-16">
      <div className="mb-8 max-w-[600px]">
        <span className="eyebrow">Contact Us</span>
        <h1 className="section-title">We&apos;re happy to help</h1>
        <p className="section-sub">Have a question? Send us a message and we&apos;ll reply as soon as possible.</p>
      </div>
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid content-start gap-3.5">
          {info.map((item) => (
            <div key={item.title} className="flex items-center gap-3.5 rounded-card border border-grey-200 bg-grey-50 p-[18px]">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-grey-200 bg-white text-xl">
                {item.icon}
              </span>
              <div>
                <h4 className="text-[0.9rem]">{item.title}</h4>
                <p className="text-[0.85rem] text-grey-500">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
