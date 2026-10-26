import { createContext, useContext, useEffect, useState } from "react";
import { shippingFor } from "@shared/data/siteContent";
import { evaluateCoupon } from "@shared/lib/coupons";
import { api } from "@/lib/api";
import { loadJson, saveJson } from "@/lib/storage";
import { useProducts, useSettings } from "./StoreContext";

// The cart stays on the phone until checkout ([{ id, quantity }]), like the website's cart in the
// browser. The coupon is checked by the server; prices, stock and the discount are recalculated
// again when the order is placed.
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [rawItems, setRawItems] = useState([]);
  const [coupon, setCoupon] = useState(null); // { code, type, value, minOrder, active }
  const [loaded, setLoaded] = useState(false);
  const { getProduct } = useProducts();
  const { settings } = useSettings();

  useEffect(() => {
    Promise.all([loadJson("cart", []), loadJson("cartCoupon", null)]).then(([items, savedCoupon]) => {
      setRawItems(Array.isArray(items) ? items : []);
      setCoupon(savedCoupon && typeof savedCoupon === "object" ? savedCoupon : null);
      setLoaded(true);
    });
  }, []);

  function updateItems(update) {
    setRawItems((prev) => {
      const next = update(prev);
      saveJson("cart", next);
      return next;
    });
  }
  function updateCoupon(value) {
    setCoupon(value);
    saveJson("cartCoupon", value);
  }

  function addToCart(id, quantity = 1) {
    updateItems((prev) =>
      prev.some((item) => item.id === id)
        ? prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + quantity } : item))
        : [...prev, { id, quantity }]
    );
  }
  function removeFromCart(id) {
    updateItems((prev) => prev.filter((item) => item.id !== id));
  }
  function updateQuantity(id, quantity) {
    if (quantity < 1) return removeFromCart(id);
    updateItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  }
  function clearCart() {
    updateItems(() => []);
    updateCoupon(null);
  }

  // Products removed by the admin simply drop out of the cart.
  const items = rawItems
    .map((item) => ({ ...item, product: getProduct(item.id) }))
    .filter((item) => item.product && item.quantity > 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  async function applyCoupon(code) {
    try {
      const { coupon: checked } = await api("/api/coupons/check", { method: "POST", body: { code, subtotal } });
      updateCoupon(checked);
      return {};
    } catch (err) {
      return { error: err.message };
    }
  }

  // Re-checked whenever the cart changes (e.g. it drops below the coupon's minimum).
  const couponResult = coupon ? evaluateCoupon(coupon, subtotal) : null;
  const discount = couponResult?.discount ?? 0;
  const shipping = shippingFor(subtotal - discount, settings.shipping);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        couponCode: coupon?.code ?? null,
        couponError: couponResult?.error ?? null,
        discount,
        shipping,
        total: subtotal - discount + shipping,
        loaded,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon: () => updateCoupon(null),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
