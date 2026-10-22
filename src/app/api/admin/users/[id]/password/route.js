import { ok, readJson, requireSuperAdmin, route } from "@/lib/server/api";
import { setUserPassword } from "@/lib/server/store/users";

export const POST = route(async (request, { params }) => {
  const actor = await requireSuperAdmin();
  const { id } = await params;
  const body = await readJson(request);
  await setUserPassword(id, body.password, actor);
  return ok();
});
