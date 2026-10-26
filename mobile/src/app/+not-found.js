import { router, Stack } from "expo-router";
import { Button, Empty, Screen } from "@/components/ui";

export default function NotFound() {
  return (
    <Screen contentStyle={{ flexGrow: 1, justifyContent: "center" }}>
      <Stack.Screen options={{ title: "Not found" }} />
      <Empty emoji="🧭" title="Page not found" text="This page doesn't exist in the app." action={<Button title="Go to Home" onPress={() => router.replace("/")} />} />
    </Screen>
  );
}
