import { formatPrice } from "@/data/products";
import ProductImage from "./ProductImage";

// Line items and totals of a saved order.
export default function OrderItems({ order }) {
  return (
    <div>
      <ul className="divide-y divide-grey-200">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-3">
            <ProductImage product={{ name: item.name, emoji: item.emoji, images: item.image ? [item.image] : [] }} size="sm" />
            <span className="flex-1 text-[0.9rem] font-bold">
              {item.name} <span className="font-normal text-grey-500">× {item.quantity}</span>
            </span>
            <span className="text-[0.9rem] font-extrabold">{formatPrice(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-2 border-t border-grey-200 pt-3 text-[0.9rem]">
        <div className="flex justify-between py-1 text-grey-500">
          <dt>Subtotal</dt>
          <dd>{formatPrice(order.subtotal)}</dd>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between py-1 text-brand-700">
            <dt>Discount{order.couponCode && ` (${order.couponCode})`}</dt>
            <dd>−{formatPrice(order.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between py-1 text-grey-500">
          <dt>Shipping</dt>
          <dd>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</dd>
        </div>
        <div className="flex justify-between pt-2 text-[1.05rem] font-extrabold">
          <dt>Total</dt>
          <dd>{formatPrice(order.total)}</dd>
        </div>
      </dl>
    </div>
  );
}
