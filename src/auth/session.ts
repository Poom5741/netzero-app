export type SessionData = {
  userId: string;
  role: string;
  email: string;
};

const COOKIE_NAME = "nzc_session";

async function sign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionCookie(data: SessionData, secret: string, secure = true, maxAge = 86400): Promise<string> {
  const payload = btoa(JSON.stringify(data));
  const sig = await sign(payload, secret);
  const cookie = `${COOKIE_NAME}=${payload}.${sig}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
  return secure ? `${cookie}; Secure` : cookie;
}

export async function parseSessionCookie(raw: string, secret: string): Promise<SessionData | null> {
  if (!raw) return null;
  const dotIdx = raw.lastIndexOf(".");
  if (dotIdx === -1) return null;
  const payload = raw.slice(0, dotIdx);
  const sig = raw.slice(dotIdx + 1);
  if (!payload || !sig) return null;
  const expected = await sign(payload, secret);
  // Simple string comparison for hex signatures
  if (sig !== expected) return null;
  try {
    return JSON.parse(atob(payload)) as SessionData;
  } catch {
    return null;
  }
}
