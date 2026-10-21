"use client";

import { useSettings } from "@/context/SettingsContext";
import { whatsappLink } from "@/data/siteContent";
import ContactForm from "./ContactForm";

export default function ContactContent() {
  const { contact } = useSettings().settings;
  const info = [
    contact.phone && { icon: "📞", title: "Call Us", text: contact.phone, href: `tel:${contact.phone.replace(/[^\d+]/g, "")}` },
    contact.whatsapp && { icon: "💬", title: "WhatsApp", text: "Chat with us", href: whatsappLink(contact.whatsapp, contact.whatsappMessage) },
    contact.email && { icon: "✉️", title: "Email", text: contact.email, href: `mailto:${contact.email}` },
    contact.address && { icon: "📍", title: "Address", text: contact.address },
    contact.hours && { icon: "🕐", title: "Working Hours", text: contact.hours },
  ].filter(Boolean);

  return (
    <div className="container-page py-16">
      <div className="mb-8 max-w-[600px]">
        <span className="eyebrow">{contact.eyebrow}</span>
        <h1 className="section-title">{contact.title}</h1>
        <p className="section-sub">{contact.text}</p>
      </div>
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid content-start gap-3.5">
          {info.map((item) => {
            const body = (
              <>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-grey-200 bg-white text-xl">
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <h4 className="text-[0.9rem]">{item.title}</h4>
                  <p className="break-words text-[0.85rem] text-grey-500">{item.text}</p>
                </div>
              </>
            );
            const cls = "flex items-center gap-3.5 rounded-card border border-grey-200 bg-grey-50 p-[18px]";
            return item.href ? (
              <a key={item.title} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={`${cls} transition hover:border-ink`}>
                {body}
              </a>
            ) : (
              <div key={item.title} className={cls}>
                {body}
              </div>
            );
          })}
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
