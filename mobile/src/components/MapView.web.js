import { createElement } from "react";

// Web preview of the app: an iframe, like the website.
export default function MapView({ src, style, title }) {
  return createElement("iframe", { src, title, loading: "lazy", referrerPolicy: "no-referrer-when-downgrade", style: { border: 0, width: "100%", height: style?.height ?? 300 } });
}
