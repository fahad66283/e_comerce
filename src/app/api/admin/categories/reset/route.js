import { ok, requireStaff, route } from "@/lib/server/api";
import { resetCategories } from "@/lib/server/store/catalog";

export const POST = route(async () => {
  await requireStaff();
  await resetCategories();
  return ok();
});
