import { eq, inArray } from "drizzle-orm";
import { getDb } from "../../../db/index.ts";
import { orders } from "../../../db/schema.ts";

const RESERVE_MS = 35 * 60 * 1000;

function idsOn(row: { bookId: string }): string[] {
  return String(row.bookId || "").split(",").map((s) => s.trim()).filter(Boolean);
}

function asTime(value: Date | string | null | undefined): number {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  const parsed = Date.parse(String(value));
  return Number.isNaN(parsed) ? 0 : parsed;
}

function isActive(row: { status: string; createdAt?: Date | string | null }): boolean {
  if (row.status === "paid") return true;
  if (row.status === "reserved") return Date.now() - asTime(row.createdAt) < RESERVE_MS;
  return false;
}

export async function isTaken(bookId: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;
  try {
    const rows = await db
      .select()
      .from(orders)
      .where(inArray(orders.status, ["reserved", "paid"]));
    return rows.some((row) => isActive(row) && idsOn(row).includes(bookId));
  } catch (err) {
    console.warn("isTaken skipped", err);
    return false;
  }
}

export async function takenIds(): Promise<{ sold: string[]; reserved: string[] }> {
  const sold: string[] = [];
  const reserved: string[] = [];
  const db = getDb();
  if (!db) return { sold, reserved };
  try {
    const rows = await db
      .select()
      .from(orders)
      .where(inArray(orders.status, ["reserved", "paid"]));
    for (const row of rows) {
      const ids = idsOn(row);
      if (row.status === "paid") sold.push(...ids);
      else if (isActive(row)) reserved.push(...ids);
    }
  } catch (err) {
    console.warn("takenIds skipped", err);
  }
  return { sold: [...new Set(sold)], reserved: [...new Set(reserved)] };
}

export async function reserveBook(input: {
  bookId: string;
  title: string;
  sessionId: string;
  amountCents: number;
}): Promise<void> {
  const db = getDb();
  if (!db) return;
  try {
    await db.insert(orders).values({
      bookId: input.bookId,
      title: input.title,
      stripeSessionId: input.sessionId,
      status: "reserved",
      amountCents: input.amountCents,
    });
  } catch (err) {
    console.warn("reserveBook skipped", err);
  }
}

export async function markPaid(sessionId: string, email?: string | null, shippingJson?: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  try {
    await db
      .update(orders)
      .set({
        status: "paid",
        paidAt: new Date(),
        email: email || undefined,
        shippingJson: shippingJson || undefined,
      })
      .where(eq(orders.stripeSessionId, sessionId));
  } catch (err) {
    console.warn("markPaid skipped", err);
  }
}

export async function markCanceled(sessionId: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  try {
    await db.update(orders).set({ status: "canceled" }).where(eq(orders.stripeSessionId, sessionId));
  } catch (err) {
    console.warn("markCanceled skipped", err);
  }
}
