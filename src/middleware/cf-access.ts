/**
 * Cloudflare Access (Zero Trust) middleware for Hono.
 *
 * When Cloudflare Access gates a route, it forwards the authenticated user's
 * email in the `Cf-Access-Authenticated-User-Email` header. This middleware
 * checks that header as a pre-flight gate — if present and allowed, the
 * request passes; if absent, it falls through to the next auth layer
 * (session cookie). This gives defense-in-depth: even direct worker access
 * without going through the Access edge is rejected.
 *
 * ponytail: allowed emails are hardcoded; move to a KV binding or env var
 * when the allowlist grows beyond a handful of addresses.
 */

import type { Context, MiddlewareHandler } from "hono";

const ALLOWED_EMAILS = new Set([
  "poom@charoenyost.com",
]);

/**
 * Returns a Hono middleware that checks Cloudflare Access headers.
 * If `requireAccess` is true, requests WITHOUT a valid Access header are
 * rejected immediately (403). If false, requests without the header fall
 * through to the next handler (allowing session-cookie auth to work as fallback).
 */
export function cfAccessGuard(requireAccess = false): MiddlewareHandler {
  return async (c: Context, next: () => Promise<void>) => {
    const email = c.req.header("Cf-Access-Authenticated-User-Email");

    if (email && ALLOWED_EMAILS.has(email)) {
      // Cloudflare Access authenticated — attach email for downstream use
      c.set("cfAccessEmail" as never, email as never);
      await next();
      return;
    }

    if (requireAccess) {
      // Behind Cloudflare Access but no valid header — reject
      return c.json({ error: "Forbidden: Cloudflare Access required" }, 403);
    }

    // Not behind Access (or header not forwarded) — fall through to session auth
    await next();
  };
}
