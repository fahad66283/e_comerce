"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/products";
import ProductImage from "@/components/ProductImage";
import OrderSummary from "@/components/OrderSummary";
import QuantityStepper from "@/components/QuantityStepper";

export default function CartPage() {
  const { items, loaded, updateQuantity, removeFromCart, clearCart } = useCart();

  if (!loaded) {
    return <p className="container-page py-16 text-grey-500">Loading cart...</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[500px] px-6 py-16 text-center">
        <p className="text-5xl">🛒</p>
        <h1 className="section-title mt-4">Your cart is empty</h1>
        <p className="mt-2 text-grey-500">Looks like you haven&apos;t added anything yet.</p>
        <Link href="/products" className="btn btn-primary mt-8">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="eyebrow">Cart</span>
          <h1 className="section-title">Your shopping cart</h1>
        </div>
        <button type="button" onClick={clearCart} className="text-sm font-bold text-grey-500 hover:text-ink">
          Clear cart
        </button>
      </div>

      <div className="grid items-start gap-9 lg:grid-cols-[1fr_370px]">
        <ul className="card px-5">
          {items.map(({ id, quantity, product }) => (
            <li key={id} className="flex items-center gap-3 border-b border-grey-200 py-4 last:border-0">
              <Link href={`/products/${id}`}>
                <ProductImage product={product} size="sm" />
              </Link>
              <div className="flex flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link href={`/products/${id}`} className="text-[0.95rem] font-extrabold hover:text-brand-700">
                    {product.name}
                  </Link>
                  <p className="text-[0.84rem] text-grey-500">{formatPrice(product.price)} each</p>
                </div>
                <div className="flex items-center gap-4">
                  <QuantityStepper
                    small
                    value={quantity}
                    min={0}
                    max={product.stock}
                    onChange={(q) => updateQuantity(id, q)}
                  />
                  <span className="w-24 text-right text-[0.9rem] font-extrabold">
                    {formatPrice(product.price * quantity)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFromCart(id)}
                className="text-lg text-grey-400 hover:text-ink"
                aria-label={`Remove ${product.name}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <OrderSummary>
          <Link href="/checkout" className="btn btn-primary mt-[18px] w-full">
            Proceed to Checkout
          </Link>
          <Link href="/products" className="mt-3 block text-center text-sm text-grey-400 hover:text-white">
            Continue Shopping
          </Link>
        </OrderSummary>
      </div>
    </div>
  );
}
