import { ApiError, ok, readJson, route } from "@/lib/server/api";
import { clientIp, rateLimit } from "@/lib/server/rateLimit";
import { checkCoupon } from "@/lib/server/store/coupons";

export const POST = route(async (request) => {
  if (!rateLimit(`coupon:${clientIp(request)}`, 20, 10 * 60 * 1000)) throw new ApiError(429, "Too many attempts. Please wait a few minutes.");
  const body = await readJson(request);
  return ok({ coupon: await checkCoupon(body.code, body.subtotal) });
});
