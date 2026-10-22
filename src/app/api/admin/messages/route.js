import { ok, readJson, requireStaff, route } from "@/lib/server/api";
import { deleteMessage, listMessages, markMessage } from "@/lib/server/store/messages";

export const GET = route(async () => {
  await requireStaff();
  return ok(await listMessages());
});

// { id, read }
export const PATCH = route(async (request) => {
  await requireStaff();
  const body = await readJson(request);
  await markMessage(body.id, body.read);
  return ok();
});

export const DELETE = route(async (request) => {
  await requireStaff();
  const body = await readJson(request);
  await deleteMessage(body.id);
  return ok();
});
