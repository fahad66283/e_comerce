import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 bg-gray-900 text-gray-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <h3 className="text-lg font-bold text-white">🛍️ ShopEase</h3>
          <p className="mt-2 text-sm">Quality products at great prices, delivered to your door.</p>
        </div>
        <div>
          <h4 className="font-semibold text-white">Shop</h4>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link href="/products" className="hover:text-white">All Products</Link></li>
            <li><Link href="/cart" className="hover:text-white">Cart</Link></li>
            <li><Link href="/checkout" className="hover:text-white">Checkout</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white">Contact</h4>
          <ul className="mt-2 space-y-1 text-sm">
            <li>support@shopease.example</li>
            <li>Mon – Sat, 9am – 6pm</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-sm">
        © 2026 ShopEase. All rights reserved.
      </div>
    </footer>
  );
}
