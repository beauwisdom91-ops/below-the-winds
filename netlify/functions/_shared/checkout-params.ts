import type { Book } from "./catalog.ts";
import { bookAmountCents, shippingCents } from "./catalog.ts";

export function buildCheckoutSessionParams(input: {
  books: Book[];
  siteUrl: string;
  integrationIdentifier: string;
  expiresAt: number;
}) {
  const { books, siteUrl, integrationIdentifier, expiresAt } = input;
  return {
    mode: "payment" as const,
    integration_identifier: integrationIdentifier,
    success_url: `${siteUrl}/sold?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout`,
    customer_creation: "always" as const,
    phone_number_collection: { enabled: true },
    shipping_address_collection: { allowed_countries: ["US"] as const },
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: "USPS Media Mail from Johnson, AR",
          type: "fixed_amount" as const,
          fixed_amount: { amount: shippingCents, currency: "usd" },
          delivery_estimate: {
            minimum: { unit: "business_day" as const, value: 3 },
            maximum: { unit: "business_day" as const, value: 9 },
          },
        },
      },
    ],
    line_items: books.map((book) => ({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: bookAmountCents(book),
        product_data: {
          name: book.title,
          description: `${book.author} · ${book.condition} · Below the Winds ${book.sku || book.id}`,
          metadata: { bookId: book.id },
        },
      },
    })),
    metadata: {
      bookIds: books.map((b) => b.id).join(","),
      title: books.map((b) => b.title).join(" · "),
    },
    expires_at: expiresAt,
  };
}
