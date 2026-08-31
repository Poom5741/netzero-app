/**
 * Farmer self-signup — phone + name → pending status.
 */
import { Hono } from "hono";

type Bindings = {
  DB: D1Database;
  SECRET: string;
};

export const farmerSignupRoutes = new Hono<{ Bindings: Bindings }>();

// Thai mobile: 0 followed by 6/8/9, then 8 digits (10 total)
const THAI_PHONE = /^0[689]\d{8}$/;

farmerSignupRoutes.post("/api/farmer/signup", async (c) => {
  const body = await c.req.json<{ phone?: string; name?: string }>();
  const phone = body.phone?.trim();
  const name = body.name?.trim();

  if (!phone || !name) {
    return c.json({ error: "phone and name required" }, 400);
  }

  if (!THAI_PHONE.test(phone)) {
    return c.json({ error: "invalid phone format" }, 400);
  }

  const db = c.env.DB;

  // Check duplicate
  const existing = await db
    .prepare("SELECT id FROM farmers WHERE phone = ?")
    .bind(phone)
    .first();

  if (existing) {
    return c.json({ error: "phone already registered" }, 409);
  }

  const id = `farmer_${crypto.randomUUID()}`;
  await db
    .prepare(
      "INSERT INTO farmers (id, full_name, phone, status) VALUES (?, ?, ?, 'pending')",
    )
    .bind(id, name, phone)
    .run();

  return c.json({ farmer: { id, full_name: name, phone, status: "pending" } }, 201);
});
