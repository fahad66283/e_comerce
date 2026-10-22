import { requireSuperAdmin, route } from "@/lib/server/api";
import { buildBackupSql } from "@/lib/server/store/backup";
import { getSiteSettings } from "@/lib/server/store/settings";

// Downloads a complete SQL backup of the store data (photos included).
export const GET = route(async () => {
  await requireSuperAdmin();
  const settings = await getSiteSettings();
  const sql = await buildBackupSql(settings.general.storeName);
  const date = new Date().toISOString().slice(0, 10);
  return new Response(sql, {
    headers: {
      "Content-Type": "application/sql; charset=utf-8",
      "Content-Disposition": `attachment; filename="hak-store-backup-${date}.sql"`,
      "Cache-Control": "no-store",
    },
  });
});
