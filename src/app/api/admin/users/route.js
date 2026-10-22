import { ok, readJson, requireSuperAdmin, route } from "@/lib/server/api";
import { createUser, listUsers } from "@/lib/server/store/users";

export const GET = route(async () => {
  await requireSuperAdmin();
  return ok({ users: await listUsers() });
});

export const POST = route(async (request) => {
  await requireSuperAdmin();
  const body = await readJson(request);
  const user = await createUser({ name: body.name, email: body.email, password: body.password, role: body.role });
  return ok({ user });
});
