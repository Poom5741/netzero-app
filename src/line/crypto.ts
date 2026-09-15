export async function createSignature(body: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifySignature(
  body: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const expected = await createSignature(body, secret);
  if (signature.length !== expected.length) return false;
  // Simple string comparison for hex signatures
  return signature === expected;
}
