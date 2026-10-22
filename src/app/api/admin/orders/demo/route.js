import { ok, requireStaff, route } from "@/lib/server/api";
import { addDemoOrders, removeDemoOrders } from "@/lib/server/store/orders";

export const POST = route(async () => {
  await requireStaff();
  await addDemoOrders();
  return ok();
});

export const DELETE = route(async () => {
  await requireStaff();
  await removeDemoOrders();
  return ok();
});
