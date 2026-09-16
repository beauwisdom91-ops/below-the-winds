import type { Config } from "@netlify/functions";

export default async () => {
  return Response.json({
    ok: true,
    stripe: Boolean(Netlify.env.get("STRIPE_SECRET_KEY")),
    webhook: Boolean(Netlify.env.get("STRIPE_WEBHOOK_SECRET")),
    database: Boolean(Netlify.env.get("NETLIFY_DB_URL")),
    shop: "Below the Winds",
  });
};

export const config: Config = {
  path: "/api/health",
  method: "GET",
};
