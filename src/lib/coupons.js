// Shared by the cart (to show the discount) and the server (which recalculates it for every order).
export function normalizeCode(code) {
  return String(code ?? "").trim().toUpperCase().replace(/\s+/g, "");
}

// Returns { discount } or { error } for a coupon against a cart subtotal.
export function evaluateCoupon(coupon, subtotal) {
  if (!coupon || !coupon.active) return { error: "This coupon code is not valid." };
  if (subtotal < coupon.minOrder) {
    return { error: `This coupon needs a minimum order of Rs. ${Number(coupon.minOrder).toLocaleString("en-PK")}.` };
  }
  const raw = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  return { discount: Math.min(raw, subtotal) };
}
