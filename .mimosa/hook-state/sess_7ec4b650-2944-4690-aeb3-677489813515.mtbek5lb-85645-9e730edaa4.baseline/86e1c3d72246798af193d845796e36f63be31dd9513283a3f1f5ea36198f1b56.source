import { createHmac, timingSafeEqual } from "node:crypto";

export function createSignature(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export function verifySignature(body: string, signature: string, secret: string): boolean {
  const expected = createSignature(body, secret);
  if (signature.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
