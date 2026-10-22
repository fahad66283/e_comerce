import { ApiError, ok, readJson, route } from "@/lib/server/api";
import { clientIp, rateLimit } from "@/lib/server/rateLimit";
import { addContactMessage } from "@/lib/server/store/messages";

export const POST = route(async (request) => {
  if (!rateLimit(`contact:${clientIp(request)}`, 5, 10 * 60 * 1000)) throw new ApiError(429, "Too many messages. Please wait a few minutes.");
  await addContactMessage(await readJson(request));
  return ok();
});
