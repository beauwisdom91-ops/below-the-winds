import type { Config } from "@netlify/functions";
import { takenIds } from "./_shared/orders.ts";

export default async (req: Request) => {
  if (req.method !== "GET") return new Response("Method not allowed", { status: 405 });
  const { sold, reserved } = await takenIds();
  return Response.json({ sold, reserved });
};

export const config: Config = {
  path: "/api/availability",
  method: "GET",
};
