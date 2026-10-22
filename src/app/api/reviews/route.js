import { ApiError, ok, readJson, route } from "@/lib/server/api";
import { getCurrentUser } from "@/lib/server/auth";
import { clientIp, rateLimit } from "@/lib/server/rateLimit";
import { addReview, listReviews } from "@/lib/server/store/reviews";

export const GET = route(async (request) => {
  const product = request.nextUrl.searchParams.get("product");
  if (!product) throw new ApiError(400, "Missing product.");
  return ok({ reviews: await listReviews(product) });
});

export const POST = route(async (request) => {
  if (!rateLimit(`review:${clientIp(request)}`, 5, 10 * 60 * 1000)) throw new ApiError(429, "Too many reviews. Please wait a few minutes.");
  const body = await readJson(request);
  await addReview(body, await getCurrentUser());
  return ok();
});
