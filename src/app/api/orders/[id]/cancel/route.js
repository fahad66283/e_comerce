import { ok, readJson, route } from "@/lib/server/api";
import { cancelStripeOrder } from "@/lib/server/store/payments";

// The customer left Stripe's payment page without paying ({ key } from the return link).
export const POST = route(async (request, { params }) => {
  const { id } = await params;
  const { key } = await readJson(request);
  return ok(await cancelStripeOrder(id, key));
});
