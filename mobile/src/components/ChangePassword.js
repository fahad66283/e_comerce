import { useState } from "react";
import { Pressable, View } from "react-native";
import { useAuth, useColors } from "@/context/StoreContext";
import { Button, Field, Notice, Panel, Row, T } from "./ui";

export default function ChangePassword() {
  const colors = useColors();
  const { changePassword } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [message, setMessage] = useState({ text: "", error: false });
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  async function save() {
    if (form.next !== form.confirm) return setMessage({ text: "The new passwords do not match.", error: true });
    setBusy(true);
    const result = await changePassword(form.current, form.next);
    setBusy(false);
    if (result.error) return setMessage({ text: result.error, error: true });
    setForm({ current: "", next: "", confirm: "" });
    setOpen(false);
    setMessage({ text: "✓ Your password was changed.", error: false });
  }

  return (
    <Panel>
      <Row style={{ justifyContent: "space-between" }}>
        <T weight="extrabold" size={17}>
          Password
        </T>
        {!open && (
          <Pressable onPress={() => setOpen(true)} accessibilityRole="button" hitSlop={8}>
            <T weight="extrabold" size={14} color={colors.brand700}>
              Change
            </T>
          </Pressable>
        )}
      </Row>
      {!!message.text && (
        <Notice tone={message.error ? "error" : "success"} style={{ marginTop: 10 }}>
          {message.text}
        </Notice>
      )}
      {open && (
        <View style={{ marginTop: 12 }}>
          <Field label="Current password" value={form.current} onChangeText={set("current")} secureTextEntry autoComplete="current-password" />
          <Field label="New password" value={form.next} onChangeText={set("next")} secureTextEntry autoComplete="new-password" />
          <Field label="Confirm new password" value={form.confirm} onChangeText={set("confirm")} secureTextEntry autoComplete="new-password" />
          <Row>
            <Button title={busy ? "Saving..." : "Save"} size="sm" onPress={save} loading={busy} />
            <Button
              title="Cancel"
              size="sm"
              variant="outline"
              onPress={() => {
                setOpen(false);
                setMessage({ text: "", error: false });
              }}
            />
          </Row>
        </View>
      )}
    </Panel>
  );
}
