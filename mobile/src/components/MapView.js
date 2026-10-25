import { WebView } from "react-native-webview";

// Shows the Google map page (the About screen builds a google.com address only).
export default function MapView({ src, style, title }) {
  return <WebView source={{ uri: src }} style={style} accessibilityLabel={title} originWhitelist={["https://*"]} setSupportMultipleWindows={false} />;
}
