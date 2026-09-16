import { integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const orders = pgTable("orders", {
  id: serial().primaryKey(),
  bookId: text("book_id").notNull(),
  title: text(),
  stripeSessionId: varchar("stripe_session_id", { length: 255 }).unique(),
  status: varchar({ length: 32 }).notNull().default("reserved"),
  email: text(),
  shippingJson: text("shipping_json"),
  amountCents: integer("amount_cents"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
