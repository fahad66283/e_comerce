import { Stack } from "expo-router";
import { useState } from "react";
import { AdminOnly } from "@/components/admin";
import { Button, Heading, Notice, Panel, Screen, T } from "@/components/ui";
import { useColors, useSettings } from "@/context/StoreContext";
import { getApiToken } from "@/lib/api";
import { API_URL } from "@/lib/config";
import { shareDownload } from "@/lib/files";

// Super admin: download the whole database as a .sql file (same as the website's Backup tab).
export default function BackupScreen() {
  const colors = useColors();
  const { storeName } = useSettings().settings.general;
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ text: "", error: false });

  async function download() {
    setBusy(true);
    setMessage({ text: "", error: false });
    try {
      const name = `${storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-backup-${new Date().toISOString().slice(0, 10)}.sql`;
      await shareDownload(`${API_URL}/api/admin/backup`, name, { Authorization: `Bearer ${getApiToken()}`, "X-Client": "app" }, "application/sql");
      setMessage({ text: "✓ Backup ready. Save it somewhere safe (Files, Google Drive, email...).", error: false });
    } catch (err) {
      setMessage({ text: err.message || "The backup could not be downloaded.", error: true });
    }
    setBusy(false);
  }

  return (
    <AdminOnly superOnly>
      <Screen>
        <Stack.Screen options={{ title: "Backup" }} />
        <Panel>
          <Heading size={18}>Download database backup</Heading>
          <T color={colors.grey[500]} style={{ marginTop: 6, marginBottom: 14 }}>
            One .sql file with everything: products and photos, categories, orders, customers, reviews, coupons, messages and all website content. To restore it, import it in phpMyAdmin after the migration files.
          </T>
          <Button title={busy ? "Preparing..." : "Download backup (.sql)"} onPress={download} loading={busy} />
          {!!message.text && (
            <Notice tone={message.error ? "error" : "success"} style={{ marginTop: 12 }}>
              {message.text}
            </Notice>
          )}
        </Panel>
        <T size={13} color={colors.grey[500]} style={{ marginTop: 14 }}>
          Hostinger also keeps automatic backups of your database (hPanel → Backups).
        </T>
      </Screen>
    </AdminOnly>
  );
}
