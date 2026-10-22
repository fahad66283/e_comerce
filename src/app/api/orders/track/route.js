import { ApiError, ok, readJson, route } from "@/lib/server/api";
import { clientIp, rateLimit } from "@/lib/server/rateLimit";
import { trackOrder } from "@/lib/server/store/orders";

export const POST = route(async (request) => {
  if (!rateLimit(`track:${clientIp(request)}`, 30, 15 * 60 * 1000)) throw new ApiError(429, "Too many attempts. Please wait a few minutes.");
  const body = await readJson(request);
  const order = await trackOrder(body.id, body.contact);
  if (!order) {
    throw new ApiError(404, "We couldn't find an order with these details. Check the order ID and the email or phone used at checkout.");
  }
  return ok({ order });
});
