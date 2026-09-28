/**
 * LIFF JWT verification.
 *
 * FINDING-D fix (2026-09-19): The /liff/api/documents/upload endpoint
 * previously accepted `farmer_id` from form-data with no authentication.
 * Anyone could upload documents for any farmer by setting `farmer_id` to
 * the target.
 *
 * Fix: the LIFF app sends an Authorization: Bearer <liff-idToken> header.
 * We verify the JWT by calling LINE's verify endpoint
 *   POST https://api.line.me/oauth2/v2.1/verify
 *     id_token=<jwt>&client_id=<LIFF_ID>
 * which validates the JWT signature against LINE's published JWKs and
 * returns the user's `sub` claim (LINE user id). We then look up the
 * farmer_id via line_links.line_user_id. Form-field `farmer_id` must
 * match; otherwise we return 403.
 *
 * Note: the `verify` endpoint is rate-limited and synchronous; we use
 * an in-memory cache keyed by the raw JWT to avoid re-verifying the
 * same token within the cache TTL (5 minutes).
 */

interface VerifyResponse {
  iss: string;
  sub: string; // LINE user id
  aud: string;
  exp: number;
  iat: number;
  nonce?: string;
  amr?: string[];
  name?: string;
  picture?: string;
  email?: string;
}

interface VerifyResult {
  ok: boolean;
  lineUserId?: string;
  error?: string;
}

const VERIFY_URL = "https://api.line.me/oauth2/v2.1/verify";
const CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
  expiresAt: number;
  lineUserId: string | null;
  error: string | null;
}
const cache = new Map<string, CacheEntry>();

/**
 * Verify a LIFF idToken (JWT) by calling LINE's verify endpoint.
 * Returns { ok, lineUserId } on success or { ok: false, error } on failure.
 */
export async function verifyLiffIdToken(
  idToken: string,
  clientId: string | undefined,
): Promise<VerifyResult> {
  if (!idToken?.trim()) {
    return { ok: false, error: "Missing idToken" };
  }
  if (!clientId) {
    return { ok: false, error: "Server missing LIFF_ID" };
  }

  const cached = cache.get(idToken);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    if (cached.lineUserId) return { ok: true, lineUserId: cached.lineUserId };
    return { ok: false, error: cached.error || "Token verification failed" };
  }

  try {
    const body = new URLSearchParams({ id_token: idToken, client_id: clientId });
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) {
      const text = await res.text();
      cache.set(idToken, {
        expiresAt: now + CACHE_TTL_MS,
        lineUserId: null,
        error: `LINE verify HTTP ${res.status}: ${text.slice(0, 200)}`,
      });
      return { ok: false, error: `LINE verify failed (HTTP ${res.status})` };
    }
    const payload = (await res.json()) as VerifyResponse;
    if (!payload?.sub) {
      cache.set(idToken, {
        expiresAt: now + CACHE_TTL_MS,
        lineUserId: null,
        error: "LINE verify response missing sub claim",
      });
      return { ok: false, error: "Invalid id_token: no sub claim" };
    }
    cache.set(idToken, {
      expiresAt: now + CACHE_TTL_MS,
      lineUserId: payload.sub,
      error: null,
    });
    return { ok: true, lineUserId: payload.sub };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `LINE verify request failed: ${msg}` };
  }
}

/**
 * Extract an idToken from the request. Looks at:
 *  1. Authorization: Bearer <token>
 *  2. X-LIFF-ID-Token: <token> header
 *  3. Form field `liff_id_token`
 *
 * Returns null when no token is present.
 */
export function extractLiffIdToken(headers: Headers, formData: FormData | null): string | null {
  const auth = headers.get("Authorization");
  if (auth) {
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (m) return m[1]!.trim();
  }
  const xHdr = headers.get("X-LIFF-ID-Token");
  if (xHdr) return xHdr.trim();
  if (formData) {
    const f = formData.get("liff_id_token");
    if (typeof f === "string" && f.trim()) return f.trim();
  }
  return null;
}

// Test hook: clear the in-memory cache. Not exported from the route.
export function _clearLiffTokenCacheForTests(): void {
  cache.clear();
}
