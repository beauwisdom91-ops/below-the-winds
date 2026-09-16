import Stripe from "stripe";

export function stripeClient(): Stripe {
  const key = Netlify.env.get("STRIPE_SECRET_KEY");
  if (!key) throw new Error("STRIPE_SECRET_KEY missing");
  return new Stripe(key, { apiVersion: "2026-07-29.dahlia" });
}

export function integrationIdentifier(prefix: string): string {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  let suffix = "";
  for (let i = 0; i < 8; i++) suffix += letters[Math.floor(Math.random() * 26)];
  return `${prefix}-${suffix}`;
}

export function siteUrl(req: Request, context: { site?: { url?: string } }): string {
  const fromContext = context.site?.url;
  const fromEnv = Netlify.env.get("URL");
  return (fromContext || fromEnv || new URL(req.url).origin).replace(/\/$/, "");
}
