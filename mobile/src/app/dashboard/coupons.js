import { Stack } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { formatPrice } from "@shared/data/products";
import { confirmAction, SwitchRow, Tag } from "@/components/admin";
import { Button, Card, Field, Heading, Loading, Notice, Panel, Pill, Row, Screen, T } from "@/components/ui";
import { useColors } from "@/context/StoreContext";
import { api, useApiData } from "@/lib/api";

const empty = { code: "", type: "percent", value: "10", minOrder: "0", active: true };

export default function CouponsAdminScreen() {
  const colors = useColors();
  const { data, reload, loading, error: loadError } = useApiData("/api/admin/coupons");
  const coupons = data?.coupons ?? [];
  const [editing, setEditing] = useState(null); // null | "new" | coupon
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  function open(target) {
    setEditing(target);
    setForm(target === "new" ? empty : { ...target, value: String(target.value), minOrder: String(target.minOrder) });
    setError("");
  }

  const save = (coupon, originalCode) => api("/api/admin/coupons", { method: "POST", body: { ...coupon, originalCode } });

  async function submit() {
    const coupon = { code: form.code, type: form.type, value: Number(form.value), minOrder: Number(form.minOrder), active: form.active };
    if (coupon.type === "percent" && (coupon.value < 1 || coupon.value > 90)) return setError("Percentage discounts must be between 1 and 90.");
    try {
      await save(coupon, editing === "new" ? null : editing.code);
      setEditing(null);
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  async function run(action) {
    try {
      await action();
      setError("");
    } catch (err) {
      setError(err.message);
    }
    reload();
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: "Coupons" }} />
      <T size={14} color={colors.grey[500]} style={{ marginBottom: 12 }}>
        For sale prices on single products, set an “Original Price” on the product.
      </T>
      <Button title="+ Add Coupon" size="sm" onPress={() => open("new")} style={{ alignSelf: "flex-start", marginBottom: 14 }} />
      <Notice tone="error" style={{ marginBottom: 12 }}>
        {loadError || (!editing && error)}
      </Notice>

      {editing && (
        <Panel style={{ marginBottom: 14 }}>
          <Heading size={17} style={{ marginBottom: 10 }}>
            {editing === "new" ? "Add Coupon" : `Edit: ${editing.code}`}
          </Heading>
          <Field label="Code" value={form.code} onChangeText={(v) => set("code")(v.toUpperCase())} maxLength={20} placeholder="e.g. EID20" autoCapitalize="characters" />
          <T weight="bold" size={13.5} color={colors.grey[700]}>
            Discount Type
          </T>
          <Row gap={8} style={{ marginTop: 6, marginBottom: 14 }}>
            <Pill label="Percentage (%)" active={form.type === "percent"} onPress={() => set("type")("percent")} />
            <Pill label="Fixed amount (Rs.)" active={form.type === "fixed"} onPress={() => set("type")("fixed")} />
          </Row>
          <Row gap={10} style={{ alignItems: "flex-start" }}>
            <Field label={form.type === "percent" ? "Discount (%)" : "Discount (Rs.)"} value={form.value} onChangeText={set("value")} keyboardType="number-pad" style={{ flex: 1 }} />
            <Field label="Minimum Order (Rs.)" value={form.minOrder} onChangeText={set("minOrder")} keyboardType="number-pad" style={{ flex: 1 }} />
          </Row>
          <SwitchRow label="Active (customers can use it)" on={form.active} onChange={set("active")} />
          <Notice tone="error" style={{ marginVertical: 8 }}>
            {error}
          </Notice>
          <Row gap={10}>
            <Button title="Save Coupon" size="sm" onPress={submit} disabled={!form.code.trim()} />
            <Button title="Cancel" size="sm" variant="outline" onPress={() => setEditing(null)} />
          </Row>
        </Panel>
      )}

      {loading && !data ? (
        <Loading />
      ) : coupons.length === 0 ? (
        <T center color={colors.grey[500]} style={{ padding: 20 }}>
          No coupons yet.
        </T>
      ) : (
        <View style={{ gap: 10 }}>
          {coupons.map((c) => (
            <Card key={c.code} style={{ padding: 14, gap: 6 }}>
              <Row style={{ justifyContent: "space-between" }}>
                <T weight="extrabold" size={16} style={{ letterSpacing: 0.6 }}>
                  {c.code}
                </T>
                <Pressable onPress={() => run(() => save({ ...c, active: !c.active }, c.code))} accessibilityRole="switch" accessibilityState={{ checked: c.active }} accessibilityLabel={`${c.code} active`}>
                  <Tag bg={c.active ? colors.brand100 : colors.grey[100]} color={c.active ? colors.brand700 : colors.grey[500]}>
                    {c.active ? "Active" : "Inactive"}
                  </Tag>
                </Pressable>
              </Row>
              <T>
                {c.type === "percent" ? `${c.value}% off` : `${formatPrice(c.value)} off`} · Min. order {c.minOrder > 0 ? formatPrice(c.minOrder) : "none"}
              </T>
              <T size={13} color={colors.grey[500]}>
                Used {c.uses}× · {formatPrice(c.saved)} saved
              </T>
              <Row gap={16} style={{ justifyContent: "flex-end" }}>
                <Pressable onPress={() => open(c)} accessibilityRole="button" accessibilityLabel={`Edit ${c.code}`} hitSlop={6}>
                  <T weight="bold" size={14}>
                    Edit
                  </T>
                </Pressable>
                <Pressable onPress={() => confirmAction(`Delete coupon ${c.code}?`, () => run(() => api("/api/admin/coupons", { method: "DELETE", body: { code: c.code } })))} accessibilityRole="button" accessibilityLabel={`Delete ${c.code}`} hitSlop={6}>
                  <T weight="bold" size={14} color={colors.red}>
                    Delete
                  </T>
                </Pressable>
              </Row>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
