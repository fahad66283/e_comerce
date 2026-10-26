import { Stack } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { ROLE_LABELS } from "@shared/data/roles";
import { formatDate } from "@shared/lib/format";
import { AdminOnly, confirmAction, Tag } from "@/components/admin";
import { Button, Card, Field, Heading, Loading, Notice, Panel, Pill, Row, Screen, T } from "@/components/ui";
import { useAuth, useColors } from "@/context/StoreContext";
import { api, useApiData } from "@/lib/api";

const ROLES = ["admin", "customer"];

function AddUser({ onAdd, busy, onCancel }) {
  const colors = useColors();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "admin" });
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  return (
    <Panel style={{ marginBottom: 14 }}>
      <Heading size={17} style={{ marginBottom: 10 }}>
        Add a user
      </Heading>
      <Field label="Full Name" value={form.name} onChangeText={set("name")} />
      <Field label="Email" value={form.email} onChangeText={set("email")} keyboardType="email-address" autoCapitalize="none" />
      <Field label="Password (min. 6 characters)" value={form.password} onChangeText={set("password")} secureTextEntry autoComplete="new-password" />
      <T weight="bold" size={13.5} color={colors.grey[700]}>
        Role
      </T>
      <Row gap={8} style={{ marginTop: 6, marginBottom: 14 }}>
        {ROLES.map((r) => (
          <Pill key={r} label={ROLE_LABELS[r]} active={form.role === r} onPress={() => set("role")(r)} />
        ))}
      </Row>
      <Row gap={10}>
        <Button title={busy ? "Saving..." : "Add User"} size="sm" onPress={() => onAdd(form)} loading={busy} />
        <Button title="Cancel" size="sm" variant="outline" onPress={onCancel} />
      </Row>
    </Panel>
  );
}

export default function UsersScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const { data, reload, loading, error: loadError } = useApiData("/api/admin/users");
  const accounts = data?.users ?? [];
  const [adding, setAdding] = useState(false);
  const [passwordFor, setPasswordFor] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState({ text: "", error: false });
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("all");
  const list = accounts.filter((a) => filter === "all" || (filter === "staff" ? a.role !== "customer" : a.role === "customer"));

  async function run(action, done) {
    setBusy(true);
    try {
      await action();
      setMessage({ text: done, error: false });
      return true;
    } catch (err) {
      setMessage({ text: err.message, error: true });
      return false;
    } finally {
      setBusy(false);
      reload();
    }
  }

  const update = (a, changes, done) => run(() => api(`/api/admin/users/${a.id}`, { method: "PATCH", body: changes }), done);

  return (
    <AdminOnly superOnly>
      <Screen>
        <Stack.Screen options={{ title: "Users & Admins" }} />
        <T size={14} color={colors.grey[500]} style={{ marginBottom: 12 }}>
          Admins can manage orders and products. Only you (super admin) can edit the website and users.
        </T>
        <Button title="+ Add User" size="sm" onPress={() => setAdding((v) => !v)} style={{ alignSelf: "flex-start", marginBottom: 14 }} />
        <Notice tone="error" style={{ marginBottom: 12 }}>
          {loadError}
        </Notice>
        {!!message.text && (
          <Notice tone={message.error ? "error" : "success"} style={{ marginBottom: 12 }}>
            {message.text}
          </Notice>
        )}
        {adding && (
          <AddUser
            busy={busy}
            onCancel={() => setAdding(false)}
            onAdd={async (body) => {
              if (await run(() => api("/api/admin/users", { method: "POST", body }), `${body.name} was added as ${ROLE_LABELS[body.role]}.`)) setAdding(false);
            }}
          />
        )}
        <Row gap={8} style={{ marginBottom: 12 }}>
          {[
            ["all", "All"],
            ["staff", "Staff"],
            ["customers", "Customers"],
          ].map(([key, label]) => (
            <Pill key={key} label={label} active={filter === key} onPress={() => setFilter(key)} style={{ paddingHorizontal: 13, paddingVertical: 6 }} />
          ))}
        </Row>
        {loading && !data ? (
          <Loading />
        ) : (
          <View style={{ gap: 10 }}>
            {list.map((a) => {
              const locked = a.role === "superadmin" || a.id === user.id;
              return (
                <Card key={a.id} style={{ padding: 14, gap: 6 }}>
                  <Row style={{ justifyContent: "space-between" }}>
                    <T weight="extrabold" style={{ flex: 1 }}>
                      {a.name}
                      {a.id === user.id ? " (you)" : ""}
                    </T>
                    <Tag bg={a.role === "superadmin" ? colors.ink : a.role === "admin" ? colors.brand100 : colors.grey[100]} color={a.role === "superadmin" ? colors.white : a.role === "admin" ? colors.brand700 : colors.grey[700]}>
                      {ROLE_LABELS[a.role]}
                    </Tag>
                  </Row>
                  <T size={13.5} color={colors.grey[500]}>
                    {a.email}
                    {a.username ? ` · ${a.username}` : ""}
                  </T>
                  <T size={12.5} color={colors.grey[500]}>
                    Joined {formatDate(a.createdAt)} · {a.orders} orders
                  </T>
                  {!locked && (
                    <>
                      <Row gap={6} style={{ flexWrap: "wrap", marginTop: 4 }}>
                        {ROLES.map((r) => (
                          <Pill key={r} label={ROLE_LABELS[r]} active={a.role === r} onPress={() => a.role !== r && update(a, { role: r }, `${a.name} is now ${ROLE_LABELS[r]}.`)} style={{ paddingHorizontal: 11, paddingVertical: 5 }} />
                        ))}
                        <Pressable
                          onPress={() => update(a, { status: a.status === "disabled" ? "active" : "disabled" }, `${a.name} was ${a.status === "disabled" ? "enabled" : "disabled"}.`)}
                          accessibilityRole="switch"
                          accessibilityState={{ checked: a.status !== "disabled" }}
                          accessibilityLabel={`${a.name} account active`}
                          style={{ justifyContent: "center" }}
                        >
                          <Tag bg={a.status === "disabled" ? "#FEE2E2" : colors.brand100} color={a.status === "disabled" ? "#B91C1C" : colors.brand700}>
                            {a.status === "disabled" ? "Disabled" : "Active"}
                          </Tag>
                        </Pressable>
                      </Row>
                      <Row gap={16} style={{ justifyContent: "flex-end", marginTop: 4 }}>
                        <Pressable
                          onPress={() => {
                            setPasswordFor(passwordFor === a.id ? null : a.id);
                            setNewPassword("");
                          }}
                          accessibilityRole="button"
                          hitSlop={6}
                        >
                          <T weight="bold" size={14}>
                            Set password
                          </T>
                        </Pressable>
                        <Pressable onPress={() => confirmAction(`Delete ${a.name} (${a.email})? Their past orders are kept.`, () => run(() => api(`/api/admin/users/${a.id}`, { method: "DELETE" }), `${a.name} was deleted.`))} accessibilityRole="button" hitSlop={6}>
                          <T weight="bold" size={14} color={colors.red}>
                            Delete
                          </T>
                        </Pressable>
                      </Row>
                      {passwordFor === a.id && (
                        <View style={{ marginTop: 6 }}>
                          <Field label={`New password for ${a.name}`} value={newPassword} onChangeText={setNewPassword} secureTextEntry autoComplete="new-password" />
                          <Row gap={10}>
                            <Button
                              title="Save password"
                              size="sm"
                              loading={busy}
                              onPress={async () => {
                                if (await run(() => api(`/api/admin/users/${a.id}/password`, { method: "POST", body: { password: newPassword } }), "Password updated.")) setPasswordFor(null);
                              }}
                            />
                            <Button title="Cancel" size="sm" variant="outline" onPress={() => setPasswordFor(null)} />
                          </Row>
                        </View>
                      )}
                    </>
                  )}
                </Card>
              );
            })}
          </View>
        )}
      </Screen>
    </AdminOnly>
  );
}
