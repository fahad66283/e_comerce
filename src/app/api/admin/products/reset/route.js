import { ok, requireStaff, route } from "@/lib/server/api";
import { resetProducts } from "@/lib/server/store/catalog";

export const POST = route(async () => {
  await requireStaff();
  await resetProducts();
  return ok();
});
