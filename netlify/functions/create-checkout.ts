import type { Config, Context } from "@netlify/functions";
import { bookAmountCents, getBook, shippingCents } from "./_shared/catalog.ts";
import { buildCheckoutSessionParams } from "./_shared/checkout-params.ts";
import { isTaken, reserveBook } from "./_shared/orders.ts";
import { integrationIdentifier, siteUrl, stripeClient } from "./_shared/stripe.ts";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!Netlify.env.get("STRIPE_SECRET_KEY")) {
    return Response.json(
      {
        error: "checkout_unconfigured",
        message: "Card checkout is not live yet. Request this copy and the shop will invoice you.",
      },
      { status: 503 },
    );
  }

  let bookId: string | undefined;
  try {
    const body = (await req.json()) as { bookId?: string };
    bookId = body.bookId;
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const book = getBook(bookId);
  if (!book) return Response.json({ error: "not_found" }, { status: 404 });
  if (book.status === "sold") return Response.json({ error: "sold" }, { status: 409 });
  if (await isTaken(book.id)) return Response.json({ error: "unavailable" }, { status: 409 });

  const stripe = stripeClient();
  const origin = siteUrl(req, context);
  const expiresAt = Math.floor(Date.now() / 1000) + 30 * 60;
  const session = await stripe.checkout.sessions.create(
    buildCheckoutSessionParams({
      book,
      siteUrl: origin,
      integrationIdentifier: integrationIdentifier("btwcopy"),
      expiresAt,
    }),
  );

  await reserveBook({
    bookId: book.id,
    title: book.title,
    sessionId: session.id,
    amountCents: bookAmountCents(book) + shippingCents,
  });

  return Response.json({ url: session.url });
};

export const config: Config = {
  path: "/api/checkout",
  method: "POST",
};
