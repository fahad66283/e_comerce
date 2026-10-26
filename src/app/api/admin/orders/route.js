import { ok, requireStaff, route } from "@/lib/server/api";
import { listAllOrders } from "@/lib/server/store/orders";
import { reconcileStripeOrders } from "@/lib/server/store/payments";

export const GET = route(async () => {
  await requireStaff();
  await reconcileStripeOrders(); // card payments whose webhook was missed
  return ok({ orders: await listAllOrders() });
});
