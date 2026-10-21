import Link from "next/link";
import Logo from "./Logo";

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/products", label: "All Products" },
      { href: "/categories", label: "Categories" },
      { href: "/cart", label: "Cart" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact Us" },
      { href: "/faqs", label: "FAQs" },
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
    title: "Account",
    links: [
      { href: "/account", label: "My Account" },
      { href: "/login", label: "Login" },
      { href: "/signup", label: "Sign Up" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 bg-ink pt-[52px] text-[#C9CCC8]">
      <div className="container-page">
        <div className="grid gap-9 border-b border-[#262626] pb-9 text-center md:grid-cols-2 md:text-left lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div className="flex flex-col items-center md:items-start">
            <Logo light className="h-8" />
            <p className="mt-3 max-w-[270px] text-[0.88rem] text-[#8C9088]">
              Your store for everything you need, delivered to every city.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h5 className="mb-3.5 text-[0.9rem] font-extrabold text-white">{col.title}</h5>
              <ul className="grid gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[0.88rem] text-[#A8ACA4] transition-colors hover:text-brand-500"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-2.5 py-5 text-[0.8rem] text-[#787C76] md:flex-row">
          <span>© 2026 HAK Store. All rights reserved.</span>
          <span className="rounded-md bg-[#1A1A1A] px-2.5 py-1 text-[0.76rem]">💵 Cash on Delivery</span>
        </div>
      </div>
    </footer>
  );
}
