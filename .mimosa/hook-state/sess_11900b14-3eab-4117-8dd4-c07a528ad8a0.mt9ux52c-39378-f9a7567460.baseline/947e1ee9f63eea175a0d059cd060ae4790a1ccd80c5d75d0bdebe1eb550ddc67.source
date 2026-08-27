import { createHmac } from "node:crypto";

export type SessionData = {
  userId: string;
  role: string;
  email: string;
};

const COOKIE_NAME = "nzc_session";

function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("hex");
}

export function createSessionCookie(data: SessionData, secret: string, secure = false): string {
  const payload = btoa(JSON.stringify(data));
  const sig = sign(payload, secret);
  const cookie = `${COOKIE_NAME}=${payload}.${sig}; Path=/; HttpOnly; SameSite=Lax`;
  return secure ? `${cookie}; Secure` : cookie;
}

export function parseSessionCookie(raw: string, secret: string): SessionData | null {
  if (!raw) return null;
  const dotIdx = raw.lastIndexOf(".");
  if (dotIdx === -1) return null;
  const payload = raw.slice(0, dotIdx);
  const sig = raw.slice(dotIdx + 1);
  if (!payload || !sig) return null;
  const expected = sign(payload, secret);
  if (sig !== expected) return null;
  try {
    return JSON.parse(atob(payload)) as SessionData;
  } catch {
    return null;
  }
}
