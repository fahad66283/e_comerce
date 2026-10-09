"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/products";
import ProductImage from "@/components/ProductImage";
import OrderSummary from "@/components/OrderSummary";

export default function CartPage() {
  const { items, loaded, updateQuantity, removeFromCart, clearCart } = useCart();

  if (!loaded) {
    return <p className="mx-auto max-w-6xl px-4 py-10 text-gray-500">Loading cart...</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-6xl">🛒</p>
        <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-gray-500">Looks like you haven&apos;t added anything yet.</p>
        <Link
          href="/products"
          className="mt-8 inline-block rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <button
          type="button"
          onClick={clearCart}
          className="text-sm text-red-600 hover:underline"
        >
          Clear cart
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <ul className="space-y-4 lg:col-span-2">
          {items.map(({ id, quantity, product }) => (
            <li key={id} className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm">
              <Link href={`/products/${id}`} className="shrink-0">
                <ProductImage product={product} size="sm" />
              </Link>
              <div className="flex flex-1 flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <Link href={`/products/${id}`} className="font-semibold hover:text-indigo-600">
                    {product.name}
                  </Link>
                  <p className="text-sm text-gray-500">{formatPrice(product.price)} each</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-lg border border-gray-300">
                    <button
                      type="button"
                      onClick={() => updateQuantity(id, quantity - 1)}
                      className="px-3 py-1 hover:bg-gray-100"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-8 text-center">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(id, Math.min(product.stock, quantity + 1))}
                      className="px-3 py-1 hover:bg-gray-100"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <span className="w-24 text-right font-semibold">
                    {formatPrice(product.price * quantity)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFromCart(id)}
                    className="text-gray-400 hover:text-red-600"
                    aria-label={`Remove ${product.name}`}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <OrderSummary>
          <Link
            href="/checkout"
            className="mt-6 block rounded-lg bg-indigo-600 py-3 text-center font-medium text-white hover:bg-indigo-700"
          >
            Proceed to Checkout
          </Link>
          <Link
            href="/products"
            className="mt-3 block text-center text-sm text-indigo-600 hover:underline"
          >
            Continue Shopping
          </Link>
        </OrderSummary>
      </div>
    </div>
  );
}
