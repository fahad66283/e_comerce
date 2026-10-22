import { ApiError, ok, readJson, route } from "@/lib/server/api";
import { getCurrentUser } from "@/lib/server/auth";
import { clientIp, rateLimit } from "@/lib/server/rateLimit";
import { placeOrder } from "@/lib/server/store/orders";

// Place an order (guests and logged-in customers). Prices, stock and coupons are checked here.
export const POST = route(async (request) => {
  if (!rateLimit(`order:${clientIp(request)}`, 20, 60 * 60 * 1000)) throw new ApiError(429, "Too many orders. Please try again later.");
  const body = await readJson(request);
  const user = await getCurrentUser();
  return ok(await placeOrder(body, user));
});
