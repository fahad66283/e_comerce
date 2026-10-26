import { router, Stack, useLocalSearchParams, usePreventRemove } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { SECTIONS } from "@shared/components/settingsSections";
import { defaultSettings } from "@shared/data/siteContent";
import { AdminOnly, confirmAction } from "@/components/admin";
import SectionField from "@/components/SectionFields";
import { Button, Notice, Panel, Row, Screen, T } from "@/components/ui";
import { useColors, useSettings } from "@/context/StoreContext";
import { deleteUploads } from "@/lib/api";

const imageUrls = (value, out = new Set()) => {
  if (typeof value === "string" && value.startsWith("/api/images/")) out.add(value);
  else if (value && typeof value === "object") Object.values(value).forEach((v) => imageUrls(v, out));
  return out;
};

function StripeStatus({ stripe }) {
  if (!stripe?.ready) return <Notice tone="plain">💳 Card payments (Stripe) are off. Add STRIPE_SECRET_KEY to the website&apos;s .env file (or Hostinger&apos;s environment variables) and restart it.</Notice>;
  return (
    <Notice>
      💳 Stripe is connected{stripe.testMode ? " in test mode (payments are not real)" : ""}.{" "}
      {stripe.webhook ? "Payment updates (webhook) are set up." : "Add STRIPE_WEBHOOK_SECRET so payments are confirmed even if a customer closes the page."}
    </Notice>
  );
}

// Super admin: edit one section of the website content or store settings.
export default function SectionScreen() {
  const colors = useColors();
  const { key } = useLocalSearchParams();
  const { rawSettings, saveSection, resetSection, stripe } = useSettings();
  const section = SECTIONS.find((s) => s.key === key);
  const [draft, setDraft] = useState(null); // null = no unsaved changes
  const [uploaded, setUploaded] = useState([]);
  const [message, setMessage] = useState({ text: "", error: false });
  const [busy, setBusy] = useState(false);
  const value = draft ?? rawSettings[key];
  const dirty = draft !== null;
  const customized = JSON.stringify(rawSettings[key]) !== JSON.stringify(defaultSettings[key]);

  // Ask before leaving with unsaved changes.
  usePreventRemove(dirty, ({ repeat }) => {
    confirmAction(
      "You have unsaved changes. Discard them?",
      () => {
        deleteUploads(uploaded);
        setDraft(null);
        repeat();
      },
      { yes: "Discard" }
    );
  });

  if (!section) return null;

  async function save() {
    setBusy(true);
    try {
      await saveSection(key, draft);
      const kept = imageUrls(draft);
      deleteUploads([...imageUrls(rawSettings[key]), ...uploaded].filter((url) => !kept.has(url)));
      setUploaded([]);
      setDraft(null);
      setMessage({ text: `✓ ${section.title} saved. Changes are live on the website and in the app.`, error: false });
    } catch (err) {
      setMessage({ text: err.message, error: true });
    }
    setBusy(false);
  }

  function reset() {
    confirmAction(
      `Reset "${section.title}" to the original content? Your changes in this section will be lost.`,
      async () => {
        setBusy(true);
        try {
          await resetSection(key);
          deleteUploads([...imageUrls(rawSettings[key]), ...uploaded]);
          setDraft(null);
          setUploaded([]);
          setMessage({ text: `${section.title} was reset to the original content.`, error: false });
        } catch (err) {
          setMessage({ text: err.message, error: true });
        }
        setBusy(false);
      },
      { yes: "Reset" }
    );
  }

  return (
    <AdminOnly superOnly>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
        <Screen
          footer={
            <View style={{ borderTopWidth: 1, borderTopColor: colors.grey[200], backgroundColor: colors.white, padding: 12, paddingBottom: 28, gap: 8 }}>
              {dirty && (
                <T weight="bold" size={13} color={colors.amber}>
                  Unsaved changes
                </T>
              )}
              <Row gap={10}>
                <Button title={busy ? "Saving..." : "Save Changes"} onPress={save} disabled={!dirty} loading={busy} style={{ flex: 1 }} />
                <Button
                  title="Discard"
                  variant="outline"
                  disabled={!dirty || busy}
                  onPress={() => {
                    deleteUploads(uploaded);
                    setUploaded([]);
                    setDraft(null);
                    setMessage({ text: "", error: false });
                  }}
                />
              </Row>
              <Button title="Reset to default" size="sm" variant="light" disabled={busy || (!customized && !dirty)} onPress={reset} />
            </View>
          }
        >
          <Stack.Screen options={{ title: section.title }} />
          {!!section.description && (
            <T color={colors.grey[500]} style={{ marginBottom: 12 }}>
              {section.description}
            </T>
          )}
          {section.group === "website" && (
            <T size={12.5} color={colors.grey[500]} style={{ marginBottom: 12 }}>
              Tip: write {"{storeName}"} to insert your store name. Long text supports **bold**, [links](/page) and “- ” bullets.
            </T>
          )}
          {key === "payments" && (
            <View style={{ marginBottom: 14 }}>
              <StripeStatus stripe={stripe} />
            </View>
          )}
          <Panel>
            {section.fields.map((field) => (
              <SectionField
                key={field.name}
                field={field}
                value={value[field.name]}
                onUploaded={(urls) => setUploaded((prev) => [...prev, ...urls])}
                onChange={(v) => {
                  setDraft({ ...value, [field.name]: v });
                  setMessage({ text: "", error: false });
                }}
              />
            ))}
          </Panel>
          {!!message.text && (
            <Notice tone={message.error ? "error" : "success"} style={{ marginTop: 12 }}>
              {message.text}
            </Notice>
          )}
          {!!section.view && (
            <Button title="View page" variant="outline" size="sm" onPress={() => router.push(section.view)} style={{ alignSelf: "flex-start", marginTop: 12 }} />
          )}
        </Screen>
      </KeyboardAvoidingView>
    </AdminOnly>
  );
}
