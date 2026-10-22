import { ApiError, ok, readJson, requireUser, route } from "@/lib/server/api";
import { claimGuestOrders, listOrdersForUser } from "@/lib/server/store/orders";

export const GET = route(async () => {
  const user = await requireUser();
  return ok({ orders: await listOrdersForUser(user) });
});

// { orders: [{ id, key }] } – guest orders from this browser, proven by their secret keys.
export const POST = route(async (request) => {
  const user = await requireUser();
  const { orders } = await readJson(request);
  if (!Array.isArray(orders)) throw new ApiError(400, "Invalid request.");
  await claimGuestOrders(user, orders);
  return ok();
});
