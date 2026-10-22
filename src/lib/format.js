export function formatDate(iso, withTime = false) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime && { hour: "2-digit", minute: "2-digit" }),
  });
}

export const ORDER_STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled"];
export const PAYMENT_STATUSES = ["Pending", "Paid", "Refunded"];
