import type { Context, Next } from "hono";
import { parseSessionCookie } from "./session";

export function requireRole(requiredRole: string, secret: string) {
  return async (c: Context, next: Next) => {
    const cookie = c.req.header("Cookie") ?? "";
    const match = cookie.match(/nzc_session=([^;]+)/);
    if (!match) return c.json({ error: "Unauthorized" }, 401);

    const session = parseSessionCookie(match[1] ?? "", secret);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    if (session.role !== requiredRole) {
      return c.json({ error: "Forbidden" }, 403);
    }

    c.set("session", session);
    await next();
  };
}
