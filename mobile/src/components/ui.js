import { forwardRef } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/context/StoreContext";
import { fonts, radius } from "@/lib/theme";

// Text in the Tajawal font. weight: light | regular | medium | bold | extrabold | black
export function T({ weight = "regular", size = 15, color, center, style, children, ...props }) {
  const colors = useColors();
  return (
    <Text
      {...props}
      style={[{ fontFamily: fonts[weight], fontSize: size, lineHeight: Math.round(size * 1.45), color: color ?? colors.ink }, center && { textAlign: "center" }, style]}
    >
      {children}
    </Text>
  );
}

// Same looks as the website's .btn-primary / .btn-outline / .btn-dark.
export function Button({ title, onPress, variant = "primary", size = "md", disabled, loading, icon, style, full, accessibilityLabel }) {
  const colors = useColors();
  const looks = {
    primary: { bg: colors.brand500, fg: colors.ink, border: colors.brand500 },
    outline: { bg: "transparent", fg: colors.ink, border: colors.ink },
    dark: { bg: colors.ink, fg: colors.white, border: colors.ink },
    light: { bg: colors.white, fg: colors.ink, border: colors.grey[200] },
    danger: { bg: "transparent", fg: colors.red, border: colors.red },
  }[variant];
  const small = size === "sm";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: looks.bg, borderColor: looks.border, paddingVertical: small ? 9 : 14, paddingHorizontal: small ? 18 : 26 },
        full && { alignSelf: "stretch" },
        (disabled || loading) && { opacity: 0.55 },
        pressed && { transform: [{ scale: 0.97 }] },
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={looks.fg} /> : icon}
      {!!title && (
        <T weight="extrabold" size={small ? 14 : 15.5} color={looks.fg}>
          {title}
        </T>
      )}
    </Pressable>
  );
}

// Small rounded label above headings (.eyebrow)
export function Eyebrow({ children }) {
  const colors = useColors();
  if (!children) return null;
  return (
    <View style={[styles.eyebrow, { backgroundColor: colors.brand100 }]}>
      <T weight="bold" size={12.5} color={colors.brand700}>
        {children}
      </T>
    </View>
  );
}

export function Heading({ children, size = 24, style }) {
  return (
    <T weight="extrabold" size={size} style={style}>
      {children}
    </T>
  );
}

export function Sub({ children, style }) {
  const colors = useColors();
  if (!children) return null;
  return (
    <T color={colors.grey[500]} style={[{ marginTop: 6 }, style]}>
      {children}
    </T>
  );
}

export function SectionHeading({ eyebrow, title, text, style }) {
  return (
    <View style={[{ marginBottom: 16 }, style]}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Heading>{title}</Heading>
      <Sub>{text}</Sub>
    </View>
  );
}

export function Card({ children, style }) {
  const colors = useColors();
  return <View style={[styles.card, { borderColor: colors.grey[200] }, style]}>{children}</View>;
}

export function Panel({ children, style }) {
  const colors = useColors();
  return <View style={[styles.panel, { borderColor: colors.grey[200] }, style]}>{children}</View>;
}

// Label + text box (.field-label + .field-input)
export const Field = forwardRef(function Field({ label, hint, error, style, inputStyle, multiline, ...props }, ref) {
  const colors = useColors();
  return (
    <View style={[{ marginBottom: 14 }, style]}>
      {!!label && (
        <T weight="bold" size={13.5} color={colors.grey[700]}>
          {label}
        </T>
      )}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.grey[400]}
        multiline={multiline}
        {...props}
        accessibilityLabel={props.accessibilityLabel ?? label}
        style={[
          styles.input,
          { borderColor: error ? colors.red : colors.grey[200], color: colors.ink },
          multiline && { minHeight: 96, textAlignVertical: "top" },
          inputStyle,
        ]}
      />
      {!!hint && (
        <T size={12.5} color={colors.grey[500]} style={{ marginTop: 4 }}>
          {hint}
        </T>
      )}
      {!!error && (
        <T size={12.5} weight="bold" color={colors.red} style={{ marginTop: 4 }}>
          {error}
        </T>
      )}
    </View>
  );
});

// Rounded filter chip (.pill / .pill-active)
export function Pill({ label, active, onPress, badge, style }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={[styles.pill, { borderColor: active ? colors.ink : colors.grey[200], backgroundColor: active ? colors.ink : colors.white }, style]}
    >
      <T weight="bold" size={14} color={active ? colors.white : colors.ink}>
        {label}
      </T>
      {badge > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.red }]}>
          <T weight="extrabold" size={11} color={colors.white}>
            {badge}
          </T>
        </View>
      )}
    </Pressable>
  );
}

// Coloured message box. tone: success | error | warning | info | plain
export function Notice({ tone = "success", children, style }) {
  const colors = useColors();
  const tones = {
    success: [colors.brand100, colors.brand700],
    error: [colors.redSoft, colors.red],
    warning: [colors.amberSoft, colors.amber],
    info: [colors.skySoft, colors.sky],
    plain: [colors.grey[50], colors.grey[700]],
  }[tone];
  if (!children) return null;
  return (
    <View accessibilityRole={tone === "error" ? "alert" : undefined} style={[styles.notice, { backgroundColor: tones[0] }, style]}>
      <T weight="bold" size={14} color={tones[1]}>
        {children}
      </T>
    </View>
  );
}

// Scrolling page with the screen's padding, pull-to-refresh and room for the home indicator.
export const Screen = forwardRef(function Screen({ children, onRefresh, refreshing = false, padded = true, style, contentStyle, footer, ...props }, ref) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={[{ flex: 1, backgroundColor: colors.white }, style]}>
      <ScrollView
        ref={ref}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[padded && { padding: 16 }, { paddingBottom: (padded ? 16 : 0) + (footer ? 0 : insets.bottom) + 24 }, contentStyle]}
        refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand600} /> : undefined}
        {...props}
      >
        {children}
      </ScrollView>
      {footer}
    </View>
  );
});

export function Loading({ label = "Loading...", style }) {
  const colors = useColors();
  return (
    <View style={[{ padding: 40, alignItems: "center", gap: 12 }, style]}>
      <ActivityIndicator color={colors.brand600} />
      <T color={colors.grey[500]}>{label}</T>
    </View>
  );
}

export function Empty({ emoji, title, text, action }) {
  const colors = useColors();
  return (
    <View style={{ alignItems: "center", paddingVertical: 48, paddingHorizontal: 20, gap: 8 }}>
      {!!emoji && <T size={46}>{emoji}</T>}
      {!!title && (
        <T weight="extrabold" size={20} center>
          {title}
        </T>
      )}
      {!!text && (
        <T color={colors.grey[500]} center>
          {text}
        </T>
      )}
      {action && <View style={{ marginTop: 14 }}>{action}</View>}
    </View>
  );
}

export function Divider({ style }) {
  const colors = useColors();
  return <View style={[{ height: 1, backgroundColor: colors.grey[200], marginVertical: 12 }, style]} />;
}

export function Row({ children, style, gap = 8 }) {
  return <View style={[{ flexDirection: "row", alignItems: "center", gap }, style]}>{children}</View>;
}

export const styles = StyleSheet.create({
  button: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: radius.pill, borderWidth: 1.5 },
  eyebrow: { alignSelf: "flex-start", borderRadius: radius.pill, paddingHorizontal: 13, paddingVertical: 5, marginBottom: 10 },
  card: { backgroundColor: "#FFFFFF", borderWidth: 1, borderRadius: radius.card, overflow: "hidden" },
  panel: { backgroundColor: "#FFFFFF", borderWidth: 1.5, borderRadius: radius.panel, padding: 18 },
  input: { marginTop: 6, borderWidth: 1.5, borderRadius: radius.field, paddingHorizontal: 14, paddingVertical: 12, fontFamily: fonts.regular, fontSize: 16, backgroundColor: "#FFFFFF" },
  pill: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1.5, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 9 },
  badge: { borderRadius: radius.pill, paddingHorizontal: 7, minWidth: 20, alignItems: "center" },
  notice: { borderRadius: radius.field, paddingHorizontal: 14, paddingVertical: 12 },
});
