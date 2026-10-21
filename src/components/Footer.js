"use client";

import Link from "next/link";
import { usePaymentMethods, useSettings } from "@/context/SettingsContext";
import { PAYMENT_ICONS } from "@/data/siteContent";
import Logo from "./Logo";

// Every customer-facing page is linked here.
const columns = [
  {
    title: "Shop",
    links: [
      { href: "/", label: "Home" },
      { href: "/products", label: "All Products" },
      { href: "/categories", label: "Categories" },
      { href: "/products?filter=sale", label: "On Sale" },
      { href: "/wishlist", label: "Wishlist" },
      { href: "/cart", label: "Cart" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact Us" },
      { href: "/faqs", label: "FAQs" },
      { href: "/track-order", label: "Track Order" },
    ],
  },
  {
    title: "Policies",
    links: [
      { href: "/return-policy", label: "Return Policy" },
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms & Conditions" },
    ],
  },
  {
    title: "My Account",
    links: [
      { href: "/account", label: "My Account" },
      { href: "/login", label: "Login" },
      { href: "/signup", label: "Sign Up" },
      { href: "/checkout", label: "Checkout" },
    ],
  },
];

const socialNames = { facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube" };

export default function Footer() {
  const { footer, contact } = useSettings().settings;
  const methods = usePaymentMethods();
  const socials = Object.keys(socialNames).filter((key) => /^https?:\/\//i.test(footer[key] ?? ""));

  return (
    <footer className="mt-16 bg-ink pt-[52px] text-[#C9CCC8]">
      <div className="container-page">
        <div className="grid gap-9 border-b border-[#262626] pb-9 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div className="flex flex-col items-center sm:items-start">
            <Logo light className="h-8" />
            <p className="mt-3 max-w-[270px] text-[0.88rem] text-[#8C9088]">{footer.tagline}</p>
            <ul className="mt-4 grid gap-1 text-[0.85rem] text-[#A8ACA4]">
              {contact.phone && <li>📞 {contact.phone}</li>}
              {contact.email && <li className="break-all">✉️ {contact.email}</li>}
              {contact.address && <li>📍 {contact.address}</li>}
            </ul>
            {socials.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                {socials.map((key) => (
                  <a
                    key={key}
                    href={footer[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-[#1A1A1A] px-3 py-1.5 text-xs font-bold transition hover:bg-brand-500 hover:text-ink"
                  >
                    {socialNames[key]}
                  </a>
                ))}
              </div>
            )}
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h5 className="mb-3.5 text-[0.9rem] font-extrabold text-white">{col.title}</h5>
              <ul className="grid gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[0.88rem] text-[#A8ACA4] transition-colors hover:text-brand-500">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-2.5 py-5 text-[0.8rem] text-[#787C76] md:flex-row">
          <span>{footer.copyright}</span>
          <div className="flex flex-wrap justify-center gap-2 text-[0.76rem]">
            {methods.map((m) => (
              <span key={m.id} className="rounded-md bg-[#1A1A1A] px-2.5 py-1">
                {PAYMENT_ICONS[m.id] ?? "💳"} {m.title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
