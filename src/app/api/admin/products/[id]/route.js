import { ok, readJson, requireStaff, route } from "@/lib/server/api";
import { deleteProduct, setProductFlags, updateProduct } from "@/lib/server/store/catalog";

export const PUT = route(async (request, { params }) => {
  await requireStaff();
  const { id } = await params;
  await updateProduct(id, await readJson(request));
  return ok();
});

// Featured / New switches.
export const PATCH = route(async (request, { params }) => {
  await requireStaff();
  const { id } = await params;
  const body = await readJson(request);
  await setProductFlags(id, { featured: body.featured, isNew: body.isNew });
  return ok();
});

export const DELETE = route(async (request, { params }) => {
  await requireStaff();
  const { id } = await params;
  await deleteProduct(id);
  return ok();
});
