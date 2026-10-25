import { connection } from "next/server";
import { stripeConfig, verifyWebhookSignature } from "@/lib/server/stripe";
import { applyStripeSession } from "@/lib/server/store/payments";

// Stripe sends payment events here. Add this address in Stripe Dashboard → Developers → Webhooks
// (https://your-domain/api/stripe/webhook) and put its signing secret in STRIPE_WEBHOOK_SECRET.
const EVENTS = {
  "checkout.session.completed": {},
  "checkout.session.async_payment_succeeded": {},
  "checkout.session.async_payment_failed": { failed: true },
  "checkout.session.expired": {},
};

export async function POST(request) {
  await connection();
  const secret = stripeConfig()?.webhookSecret;
  if (!secret) return Response.json({ error: "Webhook secret is not set." }, { status: 503 });

  const body = Buffer.from(await request.arrayBuffer());
  if (!verifyWebhookSignature(body, request.headers.get("stripe-signature"), secret)) {
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }
  const event = JSON.parse(body.toString("utf8"));
  if (EVENTS[event.type] && event.data?.object?.object === "checkout.session") {
    try {
      await applyStripeSession(event.data.object, EVENTS[event.type]);
    } catch (err) {
      console.error("[stripe] webhook failed:", err.message);
      return Response.json({ error: "Could not update the order." }, { status: 500 }); // Stripe retries later
    }
  }
  return Response.json({ received: true });
}
