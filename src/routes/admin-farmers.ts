/**
 * Admin farmer approval — list pending, approve, reject.
 */
import { Hono } from "hono";
import { parseSessionCookie } from "../auth/session";

type Bindings = {
  DB: D1Database;
  SECRET: string;
};

export const adminFarmerRoutes = new Hono<{ Bindings: Bindings }>();

function requireAdmin(c: { req: { header: (name: string) => string | undefined }; env: { SECRET: string } }) {
  const cookieHeader = c.req.header("Cookie") ?? "";
  const match = cookieHeader.match(/nzc_session=([^;]+)/);
  if (!match?.[1]) return null;
  const session = parseSessionCookie(match[1], c.env.SECRET);
  if (session?.role !== "admin") return null;
  return session;
}

// GET /api/admin/farmers — list farmers (default: pending)
adminFarmerRoutes.get("/api/admin/farmers", async (c) => {
  if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);

  const db = c.env.DB;
  const status = c.req.query("status") || "pending";

  const { results } = await db
    .prepare("SELECT id, full_name, phone, status, created_at FROM farmers WHERE status = ? ORDER BY created_at DESC")
    .bind(status)
    .all<{ id: string; full_name: string; phone: string; status: string; created_at: string }>();

  return c.json({ farmers: results });
});

// POST /api/admin/farmers/:id/approve
adminFarmerRoutes.post("/api/admin/farmers/:id/approve", async (c) => {
  if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");
  await c.env.DB
    .prepare("UPDATE farmers SET status = 'approved', updated_at = datetime('now') WHERE id = ?")
    .bind("approved", id)
    .run();

  return c.json({ ok: true });
});

// POST /api/admin/farmers/:id/reject
adminFarmerRoutes.post("/api/admin/farmers/:id/reject", async (c) => {
  if (!requireAdmin(c)) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");
  await c.env.DB
    .prepare("UPDATE farmers SET status = 'rejected', updated_at = datetime('now') WHERE id = ?")
    .bind("rejected", id)
    .run();

  return c.json({ ok: true });
});
