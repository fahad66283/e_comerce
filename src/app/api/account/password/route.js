import { ApiError, ok, readJson, requireUser, route } from "@/lib/server/api";
import { rateLimit } from "@/lib/server/rateLimit";
import { changeOwnPassword } from "@/lib/server/store/users";

export const POST = route(async (request) => {
  const user = await requireUser();
  if (!rateLimit(`password:${user.id}`, 10, 15 * 60 * 1000)) throw new ApiError(429, "Too many attempts. Please wait a few minutes.");
  const body = await readJson(request);
  await changeOwnPassword(user.id, body.current, body.next);
  return ok();
});
