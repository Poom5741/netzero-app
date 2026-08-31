export type SessionData = {
  userId: string;
  role: string;
  email: string;
};

const COOKIE_NAME = "nzc_session";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

const hexEncoder = () =>
  (buf: ArrayBuffer) =>
    Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");

const toHex = hexEncoder();

async function sign(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return toHex(sig);
}

export async function createSessionCookie(
  data: SessionData,
  secret: string,
  secure = false,
): Promise<string> {
  const payload = btoa(JSON.stringify(data));
  const sig = await sign(payload, secret);
  const cookie = `${COOKIE_NAME}=${payload}.${sig}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
  return secure ? `${cookie}; Secure` : cookie;
}

export async function parseSessionCookie(
  raw: string,
  secret: string,
): Promise<SessionData | null> {
  if (!raw) return null;
  const dotIdx = raw.lastIndexOf(".");
  if (dotIdx === -1) return null;
  const payload = raw.slice(0, dotIdx);
  const sig = raw.slice(dotIdx + 1);
  if (!payload || !sig) return null;
  const expected = await sign(payload, secret);
  if (sig !== expected) return null;
  try {
    return JSON.parse(atob(payload)) as SessionData;
  } catch {
    return null;
  }
}
