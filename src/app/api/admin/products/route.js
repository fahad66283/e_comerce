import { ok, readJson, requireStaff, route } from "@/lib/server/api";
import { addProduct } from "@/lib/server/store/catalog";

export const POST = route(async (request) => {
  await requireStaff();
  const id = await addProduct(await readJson(request));
  return ok({ id });
});
