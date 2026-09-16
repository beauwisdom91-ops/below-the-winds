import type { Book } from "./catalog.ts";
import { bookAmountCents, shippingCents } from "./catalog.ts";

export function buildCheckoutSessionParams(input: {
  book: Book;
  siteUrl: string;
  integrationIdentifier: string;
  expiresAt: number;
}) {
  const { book, siteUrl, integrationIdentifier, expiresAt } = input;
  const amount = bookAmountCents(book);
  return {
    mode: "payment" as const,
    integration_identifier: integrationIdentifier,
    success_url: `${siteUrl}/sold?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/catalog?canceled=1`,
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
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: {
            name: book.title,
            description: `${book.author} · ${book.condition} · Below the Winds ${book.sku || book.id}`,
            metadata: { bookId: book.id },
          },
        },
      },
    ],
    metadata: { bookId: book.id, title: book.title, sku: book.sku || book.id },
    expires_at: expiresAt,
  };
}
