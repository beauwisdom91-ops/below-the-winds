import type { Config } from "@netlify/functions";
import { stripeClient } from "./_shared/stripe.ts";

export default async (req: Request) => {
  if (req.method !== "GET") return new Response("Method not allowed", { status: 405 });
  if (!Netlify.env.get("STRIPE_SECRET_KEY")) {
    return Response.json({ error: "unconfigured" }, { status: 503 });
  }
  const id = new URL(req.url).searchParams.get("session_id");
  if (!id || !id.startsWith("cs_")) return Response.json({ error: "bad_request" }, { status: 400 });
  const session = await stripeClient().checkout.sessions.retrieve(id);
  return Response.json({
    status: session.payment_status,
    title: session.metadata?.title || "",
    bookId: session.metadata?.bookId || "",
  });
};

export const config: Config = {
  path: "/api/order-session",
  method: "GET",
};
