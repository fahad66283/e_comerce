import { Tajawal } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import StoreShell, { StoreLoading } from "@/components/StoreShell";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["latin", "arabic"],
  weight: ["300", "400", "500", "700", "800", "900"],
});

export const metadata = {
  title: "HAK Store – Everything you need, in one basket",
  description:
    "Shop electronics, fashion, home goods and accessories at HAK Store, with fast delivery across the country.",
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: browser extensions (Grammarly, Dark Reader, translators...)
    // often add attributes to <html> before React loads. Only affects this one element.
    <html
      lang="en"
      className={`${tajawal.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">
        {/* Store data (products, settings, login) is read from MySQL for every request. */}
        <Suspense fallback={<StoreLoading />}>
          <StoreShell>{children}</StoreShell>
        </Suspense>
      </body>
    </html>
  );
}
