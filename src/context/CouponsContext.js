"use client";

import { createContext, useContext } from "react";
import { defaultCoupons } from "@/data/products";
import { createLocalStore } from "@/lib/localStore";

// Coupons: [{ code, type: "percent" | "fixed", value, minOrder, active }]
const couponsStore = createLocalStore("coupons", defaultCoupons);

const CouponsContext = createContext(null);

export function normalizeCode(code) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

// Returns { discount } or { error } for a coupon against a cart subtotal.
export function evaluateCoupon(coupon, subtotal) {
  if (!coupon || !coupon.active) return { error: "This coupon code is not valid." };
  if (subtotal < coupon.minOrder) {
    return { error: `This coupon needs a minimum order of Rs. ${coupon.minOrder.toLocaleString("en-PK")}.` };
  }
  const raw = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  return { discount: Math.min(raw, subtotal) };
}

export function CouponsProvider({ children }) {
  const coupons = couponsStore.useValue();

  function findCoupon(code) {
    return coupons.find((c) => c.code === normalizeCode(code));
  }

  function saveCoupon(data, originalCode) {
    const code = normalizeCode(data.code);
    if (coupons.some((c) => c.code === code && c.code !== originalCode)) {
      return { error: `Coupon ${code} already exists.` };
    }
    const coupon = { ...data, code };
    couponsStore.set((prev) =>
      originalCode ? prev.map((c) => (c.code === originalCode ? coupon : c)) : [...prev, coupon]
    );
    return {};
  }

  function deleteCoupon(code) {
    couponsStore.set((prev) => prev.filter((c) => c.code !== code));
  }

  return (
    <CouponsContext.Provider value={{ coupons, findCoupon, saveCoupon, deleteCoupon }}>
      {children}
    </CouponsContext.Provider>
  );
}

export function useCoupons() {
  const context = useContext(CouponsContext);
  if (!context) throw new Error("useCoupons must be used inside CouponsProvider");
  return context;
}
