import { createHmac } from "node:crypto";

type TokenPayload = {
  farmerId: string;
  lineUserId: string;
  expiresAt: number;
};

type GenerateResult = {
  token?: string;
  status?: "already_linked" | "not_found";
};

type VerifyResult = {
  status: "verified" | "expired" | "already_used";
  farmerId?: string;
};

const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes
const SECRET = "magic-link-secret";

/**
 * Encode a token payload as a signed base64 string.
 */
function encodeToken(payload: TokenPayload): string {
  const json = JSON.stringify(payload);
  const data = Buffer.from(json).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(data).digest("hex");
  return `${data}.${sig}`;
}

/**
 * Decode and verify a token, returning null if invalid/expired.
 */
function decodeToken(token: string): TokenPayload | null {
  const dotIdx = token.lastIndexOf(".");
  if (dotIdx < 0) return null;

  const data = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  const expected = createHmac("sha256", SECRET).update(data).digest("hex");
  if (sig !== expected) return null;

  try {
    const json = Buffer.from(data, "base64url").toString("utf-8");
    const payload = JSON.parse(json) as TokenPayload;
    if (payload.expiresAt < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Create a magic link service for test-farmer binding.
 */
export function createMagicLinkService(db: D1Database) {
  const usedTokens = new Set<string>();

  return {
    async generate(farmerId: string, lineUserId: string): Promise<GenerateResult> {
      const existing = await db
        .prepare(
          "SELECT id FROM line_links WHERE farmer_id = ? AND line_user_id = ? AND status = 'verified'",
        )
        .bind(farmerId, lineUserId)
        .first();

      if (existing) return { status: "already_linked" };

      const farmer = await db.prepare("SELECT id FROM farmers WHERE id = ?").bind(farmerId).first();

      if (!farmer) return { status: "not_found" };

      const payload: TokenPayload = {
        farmerId,
        lineUserId,
        expiresAt: Date.now() + TOKEN_TTL_MS,
      };
      const token = encodeToken(payload);

      await db
        .prepare(
          "INSERT INTO line_links (id, farmer_id, line_user_id, status) VALUES (?, ?, ?, 'pending')",
        )
        .bind(`ml_${crypto.randomUUID()}`, farmerId, lineUserId)
        .run();

      return { token };
    },

    async verify(token: string): Promise<VerifyResult> {
      if (usedTokens.has(token)) return { status: "already_used" };

      const payload = decodeToken(token);
      if (!payload) return { status: "expired" };

      usedTokens.add(token);

      await db
        .prepare(
          "UPDATE line_links SET status = 'verified', verified_by = 'magic_link', updated_at = datetime('now') WHERE farmer_id = ? AND line_user_id = ?",
        )
        .bind(payload.farmerId, payload.lineUserId)
        .run();

      return { status: "verified", farmerId: payload.farmerId };
    },
  };
}
