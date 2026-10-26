import { connection } from "next/server";
import { APP_RETURN } from "@/lib/server/store/payments";

// Stripe's payment page returns here when the order was placed in the mobile app, and this
// sends the customer back into the app (hakstore://payment?...). Only app addresses are allowed
// (the app's scheme, or Expo Go's while testing), with checked values, never a website.
export async function GET(request) {
  await connection();
  const search = request.nextUrl.searchParams;
  const result = search.get("result") === "success" ? "success" : "cancel";
  const id = search.get("id") ?? "";
  const key = search.get("key") ?? "";
  const sessionId = search.get("session_id") ?? "";
  if (!/^HAK-\d{6}-[A-Z0-9]{4}$/.test(id) || !/^[0-9a-f]{32}$/.test(key) || (sessionId && !/^cs_[A-Za-z0-9_]{10,250}$/.test(sessionId))) {
    return new Response("Invalid link.", { status: 400 });
  }
  const to = APP_RETURN.test(search.get("to") ?? "") ? search.get("to") : "hakstore://payment";
  const target = `${to}${to.includes("?") ? "&" : "?"}${new URLSearchParams({ result, id, key, ...(sessionId && { session_id: sessionId }) })}`;
  const html = `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Back to the app</title>
<body style="font-family:system-ui,sans-serif;text-align:center;padding:48px 20px">
<p>${result === "success" ? "Payment complete." : "Payment cancelled."}</p>
<p><a href="${target}" style="display:inline-block;background:#61C149;color:#0A0A0A;padding:14px 26px;border-radius:999px;font-weight:700;text-decoration:none">Return to the app</a></p>
</body>`;
  return new Response(html, { status: 302, headers: { Location: target, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
