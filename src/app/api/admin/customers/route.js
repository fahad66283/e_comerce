import { ok, requireStaff, route } from "@/lib/server/api";
import { listCustomers } from "@/lib/server/store/users";

export const GET = route(async () => {
  await requireStaff();
  return ok({ customers: await listCustomers() });
});
