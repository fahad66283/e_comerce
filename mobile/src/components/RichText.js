import { View } from "react-native";
import { useColors } from "@/context/StoreContext";
import { openLink } from "@/lib/links";
import { T } from "./ui";

// Renders the editable content's simple formatting (same rules as the website's RichText):
// **bold**, [text](/page) links, "- " bullet lines and blank lines between paragraphs.
const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g;

export function Inline({ text, size = 15, color, strongColor, linkColor, center }) {
  const colors = useColors();
  if (!text) return null;
  return (
    <T size={size} color={color} center={center}>
      {String(text)
        .split(TOKEN)
        .map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
            return (
              <T key={i} size={size} weight="extrabold" color={strongColor ?? color}>
                {part.slice(2, -2)}
              </T>
            );
          }
          const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
          if (link) {
            return (
              <T key={i} size={size} weight="bold" color={linkColor ?? colors.brand700} style={{ textDecorationLine: "underline" }} onPress={() => openLink(link[2])} accessibilityRole="link">
                {link[1]}
              </T>
            );
          }
          return part;
        })}
    </T>
  );
}

export default function RichText({ text, size = 15, color, style }) {
  const colors = useColors();
  if (!text) return null;
  const blocks = String(text).trim().split(/\n\s*\n/);
  return (
    <View style={[{ gap: 10 }, style]}>
      {blocks.map((block, b) => {
        const runs = [];
        for (const line of block.split("\n")) {
          const bullet = /^\s*-\s+/.test(line);
          const last = runs[runs.length - 1];
          const content = bullet ? line.replace(/^\s*-\s+/, "") : line;
          if (last && last.bullet === bullet) last.lines.push(content);
          else runs.push({ bullet, lines: [content] });
        }
        return runs.map((run, r) =>
          run.bullet ? (
            <View key={`${b}-${r}`} style={{ gap: 6 }}>
              {run.lines.map((line, i) => (
                <View key={i} style={{ flexDirection: "row", gap: 8, paddingRight: 8 }}>
                  <T size={size} color={color ?? colors.grey[700]}>
                    •
                  </T>
                  <View style={{ flex: 1 }}>
                    <Inline text={line} size={size} color={color ?? colors.grey[700]} />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Inline key={`${b}-${r}`} text={run.lines.join("\n")} size={size} color={color ?? colors.grey[700]} />
          )
        );
      })}
    </View>
  );
}
