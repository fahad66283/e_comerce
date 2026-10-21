import { Tajawal } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ProductsProvider } from "@/context/ProductsContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
        <AuthProvider>
          <ProductsProvider>
            <CartProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </CartProvider>
          </ProductsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
