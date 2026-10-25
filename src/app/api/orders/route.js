import { ApiError, ok, readJson, route } from "@/lib/server/api";
import { getCurrentUser } from "@/lib/server/auth";
import { clientIp, rateLimit } from "@/lib/server/rateLimit";
import { placeOrder } from "@/lib/server/store/orders";
import { startStripeCheckout } from "@/lib/server/store/payments";

// Place an order (guests and logged-in customers). Prices, stock and coupons are checked here.
// Card orders also get a Stripe payment page to send the customer to (redirect).
export const POST = route(async (request) => {
  if (!rateLimit(`order:${clientIp(request)}`, 20, 60 * 60 * 1000)) throw new ApiError(429, "Too many orders. Please try again later.");
  const body = await readJson(request);
  const user = await getCurrentUser();
  const { id, key, method } = await placeOrder(body, user);
  if (method === "stripe") {
    const app = body.client === "app";
    return ok({ id, key, redirect: await startStripeCheckout({ id, key }, request, { app, appReturn: app ? body.appReturn : undefined }) });
  }
  return ok({ id, key });
});
