import { drizzle } from "drizzle-orm/netlify-db";
import * as schema from "./schema";

type ShopDb = ReturnType<typeof drizzle>;
let cached: ShopDb | null | undefined;

export function getDb(): ShopDb | null {
  if (cached !== undefined) return cached;
  const url = process.env.NETLIFY_DB_URL;
  if (!url) {
    cached = null;
    return null;
  }
  cached = drizzle({ schema });
  return cached;
}
