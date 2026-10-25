import { ApiError, ok, readJson, route } from "@/lib/server/api";
import { createSession, isAppRequest, publicUser } from "@/lib/server/auth";
import { clientIp, rateLimit } from "@/lib/server/rateLimit";
import { checkLogin } from "@/lib/server/store/users";

export const POST = route(async (request) => {
  const body = await readJson(request);
  const ip = clientIp(request);
  if (!rateLimit(`login:${ip}`, 10, 15 * 60 * 1000)) {
    throw new ApiError(429, "Too many login attempts. Please wait 15 minutes and try again.");
  }
  const user = await checkLogin(body.login, body.password);
  // The mobile app keeps the token itself; the website gets a cookie.
  const app = await isAppRequest();
  const token = await createSession(user.id, { cookie: !app });
  return ok({ user: publicUser(user), ...(app && { token }) });
});
