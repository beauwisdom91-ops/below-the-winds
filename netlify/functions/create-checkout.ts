import type { Config, Context } from "@netlify/functions";
import { allBooks, bookAmountCents, getBook, shippingCents } from "./_shared/catalog.ts";
import { buildCheckoutSessionParams } from "./_shared/checkout-params.ts";
import { isTaken, reserveBook } from "./_shared/orders.ts";
import { integrationIdentifier, siteUrl, stripeClient } from "./_shared/stripe.ts";

function parseIds(body: { bookId?: string; bookIds?: string[] }): string[] {
  if (Array.isArray(body.bookIds) && body.bookIds.length) {
    return [...new Set(body.bookIds.map(String))];
  }
  if (body.bookId) return [String(body.bookId)];
  return [];
}

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!Netlify.env.get("STRIPE_SECRET_KEY")) {
    return Response.json(
      {
        error: "checkout_unconfigured",
        message: "Card checkout is not live yet. Send the hold form and the shop will invoice you.",
      },
      { status: 503 },
    );
  }

  let body: { bookId?: string; bookIds?: string[] };
  try {
    body = (await req.json()) as { bookId?: string; bookIds?: string[] };
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const ids = parseIds(body);
  if (!ids.length) return Response.json({ error: "empty_cart" }, { status: 400 });
  if (ids.length > 20) return Response.json({ error: "too_many" }, { status: 400 });

  const known = new Set(allBooks().map((b) => b.id));
  const books = ids.map((id) => getBook(id)).filter((b): b is NonNullable<typeof b> => Boolean(b));
  if (books.length !== ids.length || ids.some((id) => !known.has(id))) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  for (const book of books) {
    const status = String(book.status || "in_shop").toLowerCase();
    if (status === "sold" || status === "seeking") {
      return Response.json({ error: "unavailable", bookId: book.id }, { status: 409 });
    }
    if (await isTaken(book.id)) {
      return Response.json({ error: "unavailable", bookId: book.id }, { status: 409 });
    }
  }

  const stripe = stripeClient();
  const origin = siteUrl(req, context);
  const expiresAt = Math.floor(Date.now() / 1000) + 30 * 60;
  const session = await stripe.checkout.sessions.create(
    buildCheckoutSessionParams({
      books,
      siteUrl: origin,
      integrationIdentifier: integrationIdentifier("btwcopy"),
      expiresAt,
    }),
  );

  const amountCents = books.reduce((sum, book) => sum + bookAmountCents(book), 0) + shippingCents;
  await reserveBook({
    bookId: books.map((b) => b.id).join(","),
    title: books.map((b) => b.title).join(" · "),
    sessionId: session.id,
    amountCents,
  });

  return Response.json({ url: session.url });
};

export const config: Config = {
  path: "/api/checkout",
  method: "POST",
};
