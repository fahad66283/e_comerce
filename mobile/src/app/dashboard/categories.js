import { Stack } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { confirmAction } from "@/components/admin";
import { Button, Card, Field, Heading, Notice, Panel, Row, Screen, T } from "@/components/ui";
import { useColors, useProducts } from "@/context/StoreContext";

const empty = { icon: "🛍️", name: "", description: "" };

export default function CategoriesAdminScreen() {
  const colors = useColors();
  const { products, categories, addCategory, updateCategory, deleteCategory, resetCategories } = useProducts();
  const [editing, setEditing] = useState(null); // null | "new" | category
  const [form, setForm] = useState(empty);
  const [message, setMessage] = useState({ text: "", error: false });
  const [busy, setBusy] = useState(false);
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  function open(target) {
    setEditing(target);
    setForm(target === "new" ? empty : { icon: target.icon, name: target.name, description: target.description ?? "" });
    setMessage({ text: "", error: false });
  }

  async function run(action, done) {
    setBusy(true);
    const result = await action();
    setBusy(false);
    setMessage(result.error ? { text: result.error, error: true } : { text: done, error: false });
    return !result.error;
  }

  async function save() {
    const data = { ...form, name: form.name.trim(), icon: form.icon.trim() || "🛍️", description: form.description.trim() };
    const ok = editing === "new" ? await run(() => addCategory(data), `"${data.name}" was added.`) : await run(() => updateCategory(editing.name, data), `"${data.name}" was updated.`);
    if (ok) setEditing(null);
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: "Categories" }} />
      <Row gap={10} style={{ marginBottom: 14 }}>
        <Button title="+ Add Category" size="sm" onPress={() => open("new")} />
        <Button
          title="Reset to Default"
          size="sm"
          variant="outline"
          onPress={() => confirmAction("Reset categories to the original list?", () => run(resetCategories, "Categories were reset."), { yes: "Reset" })}
        />
      </Row>
      {!!message.text && (
        <Notice tone={message.error ? "error" : "success"} style={{ marginBottom: 12 }}>
          {message.text}
        </Notice>
      )}

      {editing && (
        <Panel style={{ marginBottom: 14 }}>
          <Heading size={17} style={{ marginBottom: 10 }}>
            {editing === "new" ? "Add Category" : `Edit: ${editing.name}`}
          </Heading>
          <Row gap={10} style={{ alignItems: "flex-start" }}>
            <Field label="Icon (emoji)" value={form.icon} onChangeText={set("icon")} style={{ width: 100 }} inputStyle={{ textAlign: "center", fontSize: 20 }} />
            <Field label="Name" value={form.name} onChangeText={set("name")} maxLength={40} style={{ flex: 1 }} />
          </Row>
          <Field label="Description" value={form.description} onChangeText={set("description")} />
          {editing !== "new" && (
            <T size={12.5} color={colors.grey[500]} style={{ marginBottom: 10 }}>
              Renaming moves all of its products to the new name.
            </T>
          )}
          <Row gap={10}>
            <Button title={busy ? "Saving..." : "Save Category"} size="sm" onPress={save} loading={busy} disabled={!form.name.trim()} />
            <Button title="Cancel" size="sm" variant="outline" onPress={() => setEditing(null)} />
          </Row>
        </Panel>
      )}

      <View style={{ gap: 10 }}>
        {categories.map((c) => {
          const count = products.filter((p) => p.category === c.name).length;
          return (
            <Card key={c.name} style={{ padding: 14, gap: 8 }}>
              <Row gap={12}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.brand100, alignItems: "center", justifyContent: "center" }}>
                  <T size={21}>{c.icon}</T>
                </View>
                <View style={{ flex: 1 }}>
                  <T weight="extrabold">{c.name}</T>
                  <T size={13} color={colors.grey[500]}>
                    {count} {count === 1 ? "product" : "products"}
                  </T>
                </View>
                <Row gap={16}>
                  <Pressable onPress={() => open(c)} accessibilityRole="button" accessibilityLabel={`Edit ${c.name}`} hitSlop={6}>
                    <T weight="bold" size={14}>
                      Edit
                    </T>
                  </Pressable>
                  <Pressable onPress={() => confirmAction(`Delete the category "${c.name}"?`, () => run(() => deleteCategory(c.name), `"${c.name}" was deleted.`))} accessibilityRole="button" accessibilityLabel={`Delete ${c.name}`} hitSlop={6}>
                    <T weight="bold" size={14} color={colors.red}>
                      Delete
                    </T>
                  </Pressable>
                </Row>
              </Row>
              {!!c.description && (
                <T size={13.5} color={colors.grey[500]}>
                  {c.description}
                </T>
              )}
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}
