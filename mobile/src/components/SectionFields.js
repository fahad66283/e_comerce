import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { absoluteUrl } from "@/lib/config";
import { Image } from "expo-image";
import { useColors } from "@/context/StoreContext";
import { radius } from "@/lib/theme";
import { pickAndUploadImages, Switch } from "./admin";
import { Button, Field, Notice, Row, T } from "./ui";

const HEX = /^#[0-9a-f]{6}$/i;

function moveItem(list, index, step) {
  const next = [...list];
  [next[index], next[index + step]] = [next[index + step], next[index]];
  return next;
}

function SmallButton({ icon, label, onPress, disabled, color }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} hitSlop={6} style={{ padding: 5, borderRadius: 999, borderWidth: 1, borderColor: colors.grey[200], opacity: disabled ? 0.3 : 1 }}>
      <Ionicons name={icon} size={15} color={color ?? colors.ink} />
    </Pressable>
  );
}

function Label({ field }) {
  const colors = useColors();
  return (
    <T weight="bold" size={13.5} color={colors.grey[700]}>
      {field.label}
    </T>
  );
}

function Hint({ text }) {
  const colors = useColors();
  if (!text) return null;
  return (
    <T size={12.5} color={colors.grey[500]} style={{ marginTop: 4 }}>
      {text}
    </T>
  );
}

function ImageField({ field, value, onChange, onUploaded }) {
  const colors = useColors();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function pick() {
    setBusy(true);
    setError("");
    try {
      const [url] = await pickAndUploadImages({ max: 1, purpose: "logo" });
      if (url) {
        onUploaded([url]);
        onChange(url);
      }
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }
  return (
    <View style={{ marginBottom: 14 }}>
      <Label field={field} />
      <Row gap={12} style={{ marginTop: 6 }}>
        <View style={{ width: 120, height: 48, borderRadius: radius.field, borderWidth: 1, borderColor: colors.grey[200], backgroundColor: colors.grey[50], alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {value ? <Image source={{ uri: absoluteUrl(value) }} style={{ width: 110, height: 40 }} contentFit="contain" alt={field.label} /> : <T size={12} color={colors.grey[500]}>Default logo</T>}
        </View>
        <Button title={busy ? "Uploading..." : value ? "Change" : "Upload"} size="sm" variant="outline" onPress={pick} loading={busy} />
        {!!value && <Button title="Remove" size="sm" variant="danger" onPress={() => onChange(null)} />}
      </Row>
      <Hint text={field.hint} />
      <Notice tone="error" style={{ marginTop: 6 }}>
        {error}
      </Notice>
    </View>
  );
}

function ListField({ field, value, onChange, onUploaded }) {
  const colors = useColors();
  const [open, setOpen] = useState(null);
  const canAdd = !field.fixed && (!field.max || value.length < field.max);
  return (
    <View style={{ marginBottom: 14 }}>
      <Label field={field} />
      <Hint text={field.hint} />
      <View style={{ gap: 8, marginTop: 6 }}>
        {value.map((item, i) => (
          <View key={i} style={{ borderWidth: 1, borderColor: colors.grey[200], borderRadius: radius.field, backgroundColor: colors.grey[50] }}>
            <Row style={{ paddingHorizontal: 10, paddingVertical: 8 }}>
              <Pressable onPress={() => setOpen(open === i ? null : i)} accessibilityRole="button" accessibilityState={{ expanded: open === i }} style={{ flex: 1, flexDirection: "row", gap: 6, alignItems: "center" }}>
                <Ionicons name={open === i ? "chevron-down" : "chevron-forward"} size={15} color={colors.grey[400]} />
                <T weight="bold" size={14} numberOfLines={1} style={{ flex: 1 }}>
                  {field.itemLabel ? field.itemLabel(item, i) : `Item ${i + 1}`}
                </T>
              </Pressable>
              {!field.fixed && (
                <Row gap={6}>
                  <SmallButton icon="arrow-up" label="Move up" disabled={i === 0} onPress={() => onChange(moveItem(value, i, -1))} />
                  <SmallButton icon="arrow-down" label="Move down" disabled={i === value.length - 1} onPress={() => onChange(moveItem(value, i, 1))} />
                  <SmallButton
                    icon="close"
                    label="Remove"
                    color={colors.red}
                    onPress={() => {
                      onChange(value.filter((_, j) => j !== i));
                      setOpen(null);
                    }}
                  />
                </Row>
              )}
            </Row>
            {open === i && (
              <View style={{ borderTopWidth: 1, borderTopColor: colors.grey[200], backgroundColor: colors.white, padding: 12, borderBottomLeftRadius: radius.field, borderBottomRightRadius: radius.field }}>
                {field.fields.map((sub) => (
                  <SectionField key={sub.name} field={sub} value={item[sub.name]} onUploaded={onUploaded} onChange={(v) => onChange(value.map((x, j) => (j === i ? { ...x, [sub.name]: v } : x)))} />
                ))}
              </View>
            )}
          </View>
        ))}
        {value.length === 0 && (
          <T size={14} color={colors.grey[500]}>
            Nothing here yet.
          </T>
        )}
      </View>
      {canAdd && (
        <Pressable
          onPress={() => {
            onChange([...value, { ...field.newItem }]);
            setOpen(value.length);
          }}
          accessibilityRole="button"
          style={{ marginTop: 8 }}
        >
          <T weight="extrabold" size={14} color={colors.brand700}>
            + Add {field.label.toLowerCase().replace(/\s*\(.*\)$/, "").replace(/s$/, "")}
          </T>
        </Pressable>
      )}
    </View>
  );
}

// One form field of the website editor (same field definitions as the website's editor).
export default function SectionField({ field, value, onChange, onUploaded }) {
  const colors = useColors();
  switch (field.type) {
    case "textarea":
      return <Field label={field.label} hint={field.hint} value={value ?? ""} onChangeText={onChange} multiline placeholder={field.placeholder} inputStyle={{ minHeight: (field.rows ?? 3) * 24 }} />;
    case "number":
      return (
        <Field
          label={field.label}
          hint={field.hint}
          value={String(value ?? 0)}
          onChangeText={(t) => onChange(t === "" ? 0 : Math.max(0, Number(t.replace(/\D/g, "")) || 0))}
          keyboardType="number-pad"
          inputStyle={{ maxWidth: 220 }}
        />
      );
    case "color":
      return (
        <View style={{ marginBottom: 14 }}>
          <Label field={field} />
          <Row gap={10} style={{ marginTop: 6 }}>
            <View style={{ width: 44, height: 44, borderRadius: radius.field, borderWidth: 1, borderColor: colors.grey[200], backgroundColor: HEX.test(value) ? value : colors.white }} />
            <Field value={value ?? ""} onChangeText={onChange} autoCapitalize="characters" maxLength={7} placeholder="#61C149" accessibilityLabel={field.label} style={{ marginBottom: 0, flex: 1 }} inputStyle={{ marginTop: 0, maxWidth: 160 }} error={value && !HEX.test(value) ? "Use the format #61C149" : ""} />
          </Row>
          <Hint text={field.hint} />
        </View>
      );
    case "toggle":
      return (
        <Row style={{ justifyContent: "space-between", marginBottom: 14 }}>
          <T weight="bold" size={14} style={{ flex: 1, paddingRight: 10 }}>
            {field.label}
          </T>
          <Switch on={!!value} onPress={() => onChange(!value)} label={field.label} />
        </Row>
      );
    case "image":
      return <ImageField field={field} value={value} onChange={onChange} onUploaded={onUploaded} />;
    case "strings": {
      const list = value ?? [];
      return (
        <View style={{ marginBottom: 14 }}>
          <Label field={field} />
          <View style={{ gap: 8, marginTop: 6 }}>
            {list.map((item, i) => (
              <Row key={i} gap={6}>
                <Field value={item} onChangeText={(t) => onChange(list.map((x, j) => (j === i ? t : x)))} accessibilityLabel={`${field.label} ${i + 1}`} style={{ flex: 1, marginBottom: 0 }} inputStyle={{ marginTop: 0 }} />
                <SmallButton icon="arrow-up" label="Move up" disabled={i === 0} onPress={() => onChange(moveItem(list, i, -1))} />
                <SmallButton icon="close" label="Remove" color={colors.red} onPress={() => onChange(list.filter((_, j) => j !== i))} />
              </Row>
            ))}
          </View>
          {(!field.max || list.length < field.max) && (
            <Pressable onPress={() => onChange([...list, ""])} accessibilityRole="button" style={{ marginTop: 8 }}>
              <T weight="extrabold" size={14} color={colors.brand700}>
                + Add
              </T>
            </Pressable>
          )}
        </View>
      );
    }
    case "list":
      return <ListField field={field} value={value ?? []} onChange={onChange} onUploaded={onUploaded} />;
    default:
      return <Field label={field.label} hint={field.hint} value={value ?? ""} onChangeText={onChange} placeholder={field.placeholder} />;
  }
}
