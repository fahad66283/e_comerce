import { ApiError, ok, readJson, route } from "@/lib/server/api";
import { createSession } from "@/lib/server/auth";
import { clientIp, rateLimit } from "@/lib/server/rateLimit";
import { createUser } from "@/lib/server/store/users";

export const POST = route(async (request) => {
  const body = await readJson(request);
  if (!rateLimit(`register:${clientIp(request)}`, 5, 60 * 60 * 1000)) {
    throw new ApiError(429, "Too many sign-ups from this connection. Please try again later.");
  }
  const user = await createUser({ name: body.name, email: body.email, password: body.password, role: "customer" });
  await createSession(user.id);
  return ok({ user });
});
