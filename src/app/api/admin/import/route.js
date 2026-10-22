import { ok, readJson, requireSuperAdmin, route } from "@/lib/server/api";
import { importBrowserData } from "@/lib/server/store/importer";

// One-time import of data from the old browser-only version (sent by Dashboard → Backup).
export const POST = route(async (request) => {
  await requireSuperAdmin();
  const data = await readJson(request, 60_000_000);
  return ok({ imported: await importBrowserData(data) });
});
