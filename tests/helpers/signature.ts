/**
 * Test signature generator for LINE webhook events.
 *
 * LINE requires HMAC-SHA256 signatures for webhook verification.
 * This module generates valid test signatures for fixture events.
 */

import { createHmac } from "node:crypto";

/**
 * Generate a valid HMAC-SHA256 signature for a webhook event body.
 *
 * @param channelSecret - The LINE channel secret (from .env.test)
 * @param body - The raw JSON string of the webhook event
 * @returns Base64-encoded HMAC-SHA256 signature
 */
export function generateTestSignature(channelSecret: string, body: string): string {
  const hmac = createHmac("sha256", channelSecret);
  hmac.update(body);
  return hmac.digest("base64");
}

/**
 * Verify a webhook event signature.
 *
 * @param channelSecret - The LINE channel secret
 * @param body - The raw JSON string of the webhook event
 * @param signature - The signature to verify
 * @returns true if the signature is valid
 */
export function verifyTestSignature(
  channelSecret: string,
  body: string,
  signature: string,
): boolean {
  const expected = generateTestSignature(channelSecret, body);
  return expected === signature;
}
