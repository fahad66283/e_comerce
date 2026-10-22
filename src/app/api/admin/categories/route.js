import { ok, readJson, requireStaff, route } from "@/lib/server/api";
import { addCategory, deleteCategory, updateCategory } from "@/lib/server/store/catalog";

export const POST = route(async (request) => {
  await requireStaff();
  await addCategory(await readJson(request));
  return ok();
});

// { originalName, name, icon, description }
export const PUT = route(async (request) => {
  await requireStaff();
  const body = await readJson(request);
  await updateCategory(String(body.originalName ?? ""), body);
  return ok();
});

export const DELETE = route(async (request) => {
  await requireStaff();
  const body = await readJson(request);
  await deleteCategory(String(body.name ?? ""));
  return ok();
});
