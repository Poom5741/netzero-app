import type { Context, Next } from "hono";

/**
 * D-2 (Rakazo staging e2e r2/r3): authenticated responses must never be
 * cached. Stale cached GETs served September-era data on the admin farmers
 * table and sponsors page, and a stale cached /session answer even faked
 * {"authenticated":true} after logout. Stamp no-store on every response to a
 * request that presents a session cookie (covers admin/sponsor/dashboard/
 * export downloads/LIFF pages) plus /session itself; public unauthenticated
 * traffic is unaffected.
 */
export async function noStoreForAuthenticatedSessions(c: Context, next: Next) {
  await next();
  const cookie = c.req.header("Cookie") ?? "";
  const presentsSession = /(?:^|;\s*)nzc_session=/.test(cookie);
  if (presentsSession || c.req.path === "/session") {
    c.res.headers.set("Cache-Control", "no-store");
  }
}
