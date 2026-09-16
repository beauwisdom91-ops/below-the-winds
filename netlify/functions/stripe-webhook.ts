import type { Config } from "@netlify/functions";
import { markCanceled, markPaid } from "./_shared/orders.ts";
import { stripeClient } from "./_shared/stripe.ts";

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const secret = Netlify.env.get("STRIPE_WEBHOOK_SECRET");
  if (!secret) return Response.json({ error: "webhook_unconfigured" }, { status: 503 });

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing stripe-signature", { status: 400 });

  const payload = await req.text();
  const stripe = stripeClient();
  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid payload";
    return new Response(`Webhook error: ${message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const shipping = session.collected_information?.shipping_details;
    await markPaid(
      session.id,
      session.customer_details?.email || session.customer_email,
      shipping ? JSON.stringify(shipping) : undefined,
    );
  }

  if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object;
    await markCanceled(session.id);
  }

  return Response.json({ received: true });
};

export const config: Config = {
  path: "/api/stripe-webhook",
  method: "POST",
};
