import { Stack } from "expo-router";
import { useState } from "react";
import { Linking, Share, View } from "react-native";
import { formatDate } from "@shared/lib/format";
import { confirmAction, Tag } from "@/components/admin";
import { Button, Card, Loading, Notice, Pill, Row, Screen, T } from "@/components/ui";
import { useColors, useStore } from "@/context/StoreContext";
import { api, useApiData } from "@/lib/api";

// Contact form messages and newsletter subscribers.
export default function MessagesScreen() {
  const colors = useColors();
  const { refresh } = useStore();
  const { data, reload, loading, error } = useApiData("/api/admin/messages");
  const [view, setView] = useState("messages");
  const messages = data?.messages ?? [];
  const subscribers = data?.subscribers ?? [];
  const unread = messages.filter((m) => !m.read).length;

  async function change(method, body) {
    await api("/api/admin/messages", { method, body }).catch(() => {});
    reload();
    refresh(); // unread badge
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: "Messages" }} />
      <Row gap={8} style={{ flexWrap: "wrap", marginBottom: 14 }}>
        <Pill label={`Contact messages (${messages.length}${unread ? `, ${unread} new` : ""})`} active={view === "messages"} onPress={() => setView("messages")} />
        <Pill label={`Newsletter (${subscribers.length})`} active={view === "subscribers"} onPress={() => setView("subscribers")} />
      </Row>
      <Notice tone="error">{error}</Notice>
      {loading && !data ? (
        <Loading />
      ) : view === "messages" ? (
        messages.length === 0 ? (
          <T center color={colors.grey[500]} style={{ padding: 20 }}>
            No messages yet. Messages from the Contact page appear here.
          </T>
        ) : (
          <View style={{ gap: 10 }}>
            {messages.map((m) => (
              <Card key={m.id} style={{ padding: 14, gap: 6, borderColor: m.read ? colors.grey[200] : colors.ink }}>
                <Row gap={8} style={{ flexWrap: "wrap" }}>
                  {!m.read && <Tag bg={colors.brand500}>NEW</Tag>}
                  <T weight="extrabold" style={{ flex: 1 }}>
                    {m.subject}
                  </T>
                </Row>
                <T size={13.5} color={colors.grey[500]}>
                  {m.name} ·{" "}
                  <T size={13.5} weight="bold" color={colors.brand700} onPress={() => Linking.openURL(`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`)}>
                    {m.email}
                  </T>{" "}
                  · {formatDate(m.createdAt, true)}
                </T>
                <T color={colors.grey[700]}>{m.message}</T>
                <Row gap={8} style={{ marginTop: 4 }}>
                  <Button title={`Mark as ${m.read ? "unread" : "read"}`} size="sm" variant="outline" onPress={() => change("PATCH", { id: m.id, read: !m.read })} />
                  <Button title="Delete" size="sm" variant="outline" onPress={() => confirmAction("Delete this message?", () => change("DELETE", { id: m.id }))} />
                </Row>
              </Card>
            ))}
          </View>
        )
      ) : subscribers.length === 0 ? (
        <T center color={colors.grey[500]} style={{ padding: 20 }}>
          No subscribers yet.
        </T>
      ) : (
        <Card style={{ padding: 14, gap: 8 }}>
          <Button title="Share all emails" size="sm" variant="outline" onPress={() => Share.share({ message: subscribers.map((s) => s.email).join(", ") })} style={{ alignSelf: "flex-end" }} />
          {subscribers.map((s) => (
            <Row key={s.email} style={{ justifyContent: "space-between", borderTopWidth: 1, borderTopColor: colors.grey[200], paddingTop: 8 }}>
              <T size={14} selectable style={{ flex: 1 }}>
                {s.email}
              </T>
              <T size={12.5} color={colors.grey[500]}>
                {formatDate(s.createdAt)}
              </T>
            </Row>
          ))}
        </Card>
      )}
    </Screen>
  );
}
