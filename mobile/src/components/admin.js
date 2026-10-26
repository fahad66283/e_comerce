import Ionicons from "@expo/vector-icons/Ionicons";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Alert, Platform, Pressable, TextInput, View } from "react-native";
import { useAuth, useColors } from "@/context/StoreContext";
import { uploadImage } from "@/lib/api";
import { fonts, radius } from "@/lib/theme";
import { Button, Empty, Row, Screen, T } from "./ui";

// "Are you sure?" before deleting or resetting (a browser confirm in the web preview).
export function confirmAction(message, onYes, { yes = "Delete", destructive = true } = {}) {
  if (Platform.OS === "web") {
    if (globalThis.confirm?.(message)) onYes();
    return;
  }
  Alert.alert("Are you sure?", message, [
    { text: "Cancel", style: "cancel" },
    { text: yes, style: destructive ? "destructive" : "default", onPress: onYes },
  ]);
}

// On/off switch (Featured, New, Active...), like the website's toggles.
export function Switch({ on, onPress, label }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} accessibilityRole="switch" accessibilityState={{ checked: !!on }} accessibilityLabel={label} hitSlop={6} style={{ width: 46, height: 26, borderRadius: 13, backgroundColor: on ? colors.brand500 : colors.grey[200], justifyContent: "center" }}>
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#FFFFFF", marginLeft: on ? 22 : 2, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 2, elevation: 2 }} />
    </Pressable>
  );
}

export function SwitchRow({ label, on, onChange }) {
  return (
    <Row style={{ justifyContent: "space-between", paddingVertical: 8 }}>
      <T weight="bold" size={14} style={{ flex: 1, paddingRight: 12 }}>
        {label}
      </T>
      <Switch on={on} onPress={() => onChange(!on)} label={label} />
    </Row>
  );
}

export function StatTile({ label, value, note, style }) {
  const colors = useColors();
  return (
    <View style={[{ flexGrow: 1, flexBasis: "45%", borderWidth: 1.5, borderColor: colors.grey[200], borderRadius: radius.card, padding: 14, backgroundColor: colors.white }, style]}>
      <T weight="bold" size={13} color={colors.grey[500]}>
        {label}
      </T>
      <T weight="black" size={22} color={colors.brand600}>
        {value}
      </T>
      {!!note && (
        <T size={12} color={colors.grey[500]}>
          {note}
        </T>
      )}
    </View>
  );
}

export function SearchBox({ value, onChangeText, placeholder, label }) {
  const colors = useColors();
  return (
    <Row style={{ borderWidth: 1.5, borderColor: colors.grey[200], borderRadius: radius.pill, paddingHorizontal: 14, marginBottom: 12 }}>
      <Ionicons name="search" size={17} color={colors.grey[500]} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.grey[400]}
        accessibilityLabel={label ?? placeholder}
        autoCapitalize="none"
        style={{ flex: 1, paddingVertical: 10, fontFamily: fonts.regular, fontSize: 15.5, color: colors.ink }}
      />
    </Row>
  );
}

// Small coloured label (Low stock, Active, NEW...)
export function Tag({ children, bg, color }) {
  const colors = useColors();
  return (
    <View style={{ backgroundColor: bg ?? colors.grey[100], borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 2, alignSelf: "flex-start" }}>
      <T weight="extrabold" size={11.5} color={color ?? colors.grey[700]}>
        {children}
      </T>
    </View>
  );
}

// Picks photos from the phone, shrinks them to 1200px (like the website) and uploads them.
// Returns the uploaded image URLs.
export async function pickAndUploadImages({ max = 1, purpose = "product" } = {}) {
  if (Platform.OS !== "web") {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) throw new Error("Please allow access to your photos to upload pictures.");
  }
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsMultipleSelection: max > 1, selectionLimit: max, quality: 1 });
  if (result.canceled) return [];
  const urls = [];
  for (const asset of result.assets.slice(0, max)) {
    let file = asset;
    const big = Math.max(asset.width ?? 0, asset.height ?? 0) > 1200;
    if (big && Platform.OS !== "web") {
      const context = ImageManipulator.manipulate(asset.uri);
      context.resize(asset.width >= asset.height ? { width: 1200 } : { height: 1200 });
      const image = await context.renderAsync();
      const saved = await image.saveAsync({ compress: 0.85, format: SaveFormat.JPEG });
      file = { uri: saved.uri, mimeType: "image/jpeg" };
    }
    urls.push(await uploadImage(file, purpose));
  }
  return urls;
}

// Wraps admin screens: staff only (super admin only when `superOnly`).
export function AdminOnly({ superOnly = false, children }) {
  const { isAdmin, isSuperAdmin } = useAuth();
  if (isAdmin && (!superOnly || isSuperAdmin)) return children;
  return (
    <Screen contentStyle={{ flexGrow: 1, justifyContent: "center" }}>
      <Empty
        emoji="🔒"
        title={superOnly ? "Super admin only" : "Admin access only"}
        text={superOnly ? "Only the super admin can open this section." : "Please login with an admin account to open the dashboard."}
        action={!isAdmin && <Button title="Login" onPress={() => router.push("/login?next=/dashboard")} />}
      />
    </Screen>
  );
}
