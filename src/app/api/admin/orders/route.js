import { ok, requireStaff, route } from "@/lib/server/api";
import { listAllOrders } from "@/lib/server/store/orders";

export const GET = route(async () => {
  await requireStaff();
  return ok({ orders: await listAllOrders() });
});
