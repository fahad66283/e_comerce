import { ok, readJson, requireSuperAdmin, route } from "@/lib/server/api";
import { resetSection, saveSection } from "@/lib/server/store/settings";

export const PUT = route(async (request, { params }) => {
  await requireSuperAdmin();
  const { key } = await params;
  await saveSection(key, await readJson(request));
  return ok();
});

export const DELETE = route(async (request, { params }) => {
  await requireSuperAdmin();
  const { key } = await params;
  await resetSection(key);
  return ok();
});
