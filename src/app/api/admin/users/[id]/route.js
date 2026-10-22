import { ApiError, ok, readJson, requireSuperAdmin, route } from "@/lib/server/api";
import { deleteUser, updateUser } from "@/lib/server/store/users";

// { role?, status?, name? }
export const PATCH = route(async (request, { params }) => {
  const actor = await requireSuperAdmin();
  const { id } = await params;
  if (Number(id) === actor.id) throw new ApiError(403, "You can't change your own account here.");
  await updateUser(id, await readJson(request));
  return ok();
});

export const DELETE = route(async (request, { params }) => {
  const actor = await requireSuperAdmin();
  const { id } = await params;
  if (Number(id) === actor.id) throw new ApiError(403, "You can't delete your own account.");
  await deleteUser(id);
  return ok();
});
