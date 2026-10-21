"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const helpLinks = [
  { href: "/faqs", label: "FAQs" },
  { href: "/return-policy", label: "Return Policy" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
];

// Shared layout for FAQs and policy pages, with a side menu linking them together.
export default function InfoPageLayout({ eyebrow, title, intro, updated, children }) {
  const pathname = usePathname();

  return (
    <div className="container-page py-16">
      <div className="mb-8 max-w-[680px]">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="section-title">{title}</h1>
        {intro && <p className="section-sub">{intro}</p>}
        {updated && <p className="mt-2 text-sm text-grey-400">Last updated: {updated}</p>}
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-[240px_1fr]">
        <nav aria-label="Help pages" className="flex gap-2 overflow-x-auto pb-1.5 [scrollbar-width:none] lg:sticky lg:top-24 lg:flex-col">
          {helpLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? "page" : undefined}
              className={`pill lg:rounded-field ${pathname === l.href ? "pill-active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

// A titled block of policy text.
export function PolicySection({ title, children }) {
  return (
    <section className="border-b border-grey-200 py-6 first:pt-0 last:border-0">
      <h2 className="mb-3 text-lg">{title}</h2>
      <div className="grid gap-3 text-grey-700 [&_li]:ml-5 [&_ul]:grid [&_ul]:list-disc [&_ul]:gap-1.5">{children}</div>
    </section>
  );
}
