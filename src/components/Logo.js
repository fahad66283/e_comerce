import Link from "next/link";

// HAK Store logo (from HAK_logo.pdf). Use `light` on dark backgrounds.
export default function Logo({ light = false, className = "h-[30px]", onClick }) {
  return (
    <Link href="/" onClick={onClick} className="flex shrink-0 items-center">
      {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG */}
      <img
        src={light ? "/logo-light.svg" : "/logo.svg"}
        alt="HAK Store"
        className={`w-auto ${className}`}
      />
    </Link>
  );
}
