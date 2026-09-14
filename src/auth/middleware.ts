import type { Context, Next } from "hono";
import { parseSessionCookie } from "./session";

/**
 * H4 fix: requireRole accepts a single role string or an array of allowed roles.
 * Checks whether session.role matches any of the required roles.
 */
export function requireRole(requiredRole: string | string[], secret: string) {
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  return async (c: Context, next: Next) => {
    const cookie = c.req.header("Cookie") ?? "";
    const match = cookie.match(/nzc_session=([^;]+)/);
    if (!match) return c.json({ error: "Unauthorized" }, 401);

    const session = await parseSessionCookie(match[1] ?? "", secret);
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    if (!allowedRoles.includes(session.role)) {
      return c.json({ error: "Forbidden" }, 403);
    }

    c.set("session", session);
    await next();
  };
}
