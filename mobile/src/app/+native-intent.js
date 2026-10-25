import { isPaymentReturn, paymentState } from "@/lib/payment";

// Links that open the app. Stripe's return link ("hakstore://payment?...") goes to the checkout
// screen that is waiting for it; if the app had to restart, the /payment screen handles it.
export function redirectSystemPath({ path, initial }) {
  if (isPaymentReturn(path) && paymentState.waiting && !initial) return null;
  return path;
}
