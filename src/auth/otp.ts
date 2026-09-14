/**
 * TOTP (Time-based One-Time Password) using Web Crypto API.
 * RFC 6238 compliant — no external dependencies.
 */

const DIGITS = 6;
const PERIOD = 30; // seconds
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** Encode Uint8Array to base32 string (no padding). */
export function base32Encode(bytes: Uint8Array): string {
  let bits = "";
  for (const b of bytes) {
    bits += b.toString(2).padStart(8, "0");
  }
  let result = "";
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, "0");
    result += BASE32_ALPHABET[Number.parseInt(chunk, 2)];
  }
  return result;
}

/** Decode base32 string to Uint8Array. */
export function base32Decode(str: string): Uint8Array {
  const cleaned = str.replace(/[\s=]/g, "").toUpperCase();
  let bits = "";
  for (const ch of cleaned) {
    const val = BASE32_ALPHABET.indexOf(ch);
    if (val === -1) throw new Error(`Invalid base32 character: ${ch}`);
    bits += val.toString(2).padStart(5, "0");
  }
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  }
  return bytes;
}

/** Generate a random 20-byte TOTP secret, returned as a base32 string. */
export function generateOtpSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  return base32Encode(bytes);
}

/** Compute TOTP code for a given secret and counter (time step). */
export function generateOtpCode(secret: string, counter?: number): string {
  if (counter === undefined) {
    counter = Math.floor(Date.now() / 1000 / PERIOD);
  }
  const keyBytes = base32Decode(secret);
  return hmacSha1Otp(keyBytes, counter);
}

/** Verify a TOTP code against the secret. Returns false for empty/invalid inputs. */
export function verifyOtp(
  secret: string,
  code: string,
  tolerance = 1,
): boolean {
  if (!secret || !code || code.length !== DIGITS || !/^\d+$/.test(code)) {
    return false;
  }

  const counter = Math.floor(Date.now() / 1000 / PERIOD);

  // We need to check current, previous, and next counters.
  // Use synchronous comparison by generating codes for each window.
  // Since generateOtpCode is async but we need sync verify for middleware,
  // we use a sync HMAC approach here.
  return verifyOtpSync(secret, code, counter, tolerance);
}

/** Synchronous TOTP verification using SubtleCrypto-derived key material. */
function verifyOtpSync(secret: string, code: string, counter: number, tolerance: number): boolean {
  // We must use the async path wrapped in a check, but since we're in a
  // Cloudflare Worker / Bun runtime, crypto.subtle is available.
  // For synchronous verification, we pre-compute using crypto.sign is not sync.
  // However, Bun and CF Workers both support top-level await.
  // The actual verify is called from an async route handler, so we keep
  // this synchronous-looking but it relies on the caller being async.
  //
  // Since we can't do sync SubtleCrypto, we fall back to a pure-JS HMAC-SHA1.
  // This is acceptable for TOTP verification in the Worker runtime.

  const keyBytes = base32Decode(secret);

  for (let i = -tolerance; i <= tolerance; i++) {
    const c = counter + i;
    const otp = hmacSha1Otp(keyBytes, c);
    if (otp === code) return true;
  }
  return false;
}

/** Pure-JS HMAC-SHA1 for TOTP — avoids async SubtleCrypto for sync verify path. */
function hmacSha1Otp(key: Uint8Array, counter: number): string {
  // Build counter buffer (big-endian 8 bytes)
  const counterBuf = new Uint8Array(8);
  const hi = Math.floor(counter / 0x100000000);
  const lo = counter >>> 0;
  counterBuf[0] = (hi >>> 24) & 0xff;
  counterBuf[1] = (hi >>> 16) & 0xff;
  counterBuf[2] = (hi >>> 8) & 0xff;
  counterBuf[3] = hi & 0xff;
  counterBuf[4] = (lo >>> 24) & 0xff;
  counterBuf[5] = (lo >>> 16) & 0xff;
  counterBuf[6] = (lo >>> 8) & 0xff;
  counterBuf[7] = lo & 0xff;

  // HMAC-SHA1 implementation (RFC 2104)
  const BLOCK_SIZE = 64;
  const HASH_SIZE = 20;

  // Prepare key: pad or hash to block size
  let keyPadded: Uint8Array;
  if (key.length > BLOCK_SIZE) {
    // Hash the key first
    const hashed = sha1(key);
    keyPadded = new Uint8Array(BLOCK_SIZE);
    keyPadded.set(hashed);
  } else {
    keyPadded = new Uint8Array(BLOCK_SIZE);
    keyPadded.set(key);
  }

  // ipad and opad
  const ipad = new Uint8Array(BLOCK_SIZE);
  const opad = new Uint8Array(BLOCK_SIZE);
  for (let i = 0; i < BLOCK_SIZE; i++) {
    ipad[i] = keyPadded[i]! ^ 0x36;
    opad[i] = keyPadded[i]! ^ 0x5c;
  }

  // Inner hash: SHA1(ipad || message)
  const inner = new Uint8Array(BLOCK_SIZE + counterBuf.length);
  inner.set(ipad);
  inner.set(counterBuf, BLOCK_SIZE);
  const innerHash = sha1(inner);

  // Outer hash: SHA1(opad || innerHash)
  const outer = new Uint8Array(BLOCK_SIZE + HASH_SIZE);
  outer.set(opad);
  outer.set(innerHash, BLOCK_SIZE);
  const hmac = sha1(outer);

  // Dynamic truncation
  const offset = hmac[hmac.length - 1]! & 0x0f;
  const binary =
    ((hmac[offset]! & 0x7f) << 24) |
    ((hmac[offset + 1]! & 0xff) << 16) |
    ((hmac[offset + 2]! & 0xff) << 8) |
    (hmac[offset + 3]! & 0xff);

  const otp = binary % 10 ** DIGITS;
  return otp.toString().padStart(DIGITS, "0");
}

/** Pure-JS SHA-1 implementation (RFC 3174). */
function sha1(message: Uint8Array): Uint8Array {
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  // Pre-processing: adding padding bits
  const msgLen = message.length;
  const bitLen = msgLen * 8;
  // Pad to 56 mod 64 bytes, then add 8 bytes of length
  const padLen = msgLen + 1;
  const totalLen = padLen + ((55 - ((padLen - 1) % 64)) % 64) + 8;
  const padded = new Uint8Array(totalLen);
  padded.set(message);
  padded[msgLen] = 0x80;

  // Append original length in bits as big-endian 64-bit
  const view = new DataView(padded.buffer);
  // We only handle messages < 2^32 bits (safe for our use case)
  view.setUint32(totalLen - 4, bitLen);

  // Process each 512-bit (64-byte) block
  for (let offset = 0; offset < totalLen; offset += 64) {
    const w = new Uint32Array(80);
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4);
    }
    for (let i = 16; i < 80; i++) {
      w[i] = rotl(w[i - 3]! ^ w[i - 8]! ^ w[i - 14]! ^ w[i - 16]!, 1);
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;

    for (let i = 0; i < 80; i++) {
      let f: number, k: number;
      if (i < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (i < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (i < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }
      const temp = (rotl(a, 5) + f + e + k + w[i]!) >>> 0;
      e = d;
      d = c;
      c = rotl(b, 30);
      b = a;
      a = temp;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }

  const result = new Uint8Array(20);
  const rv = new DataView(result.buffer);
  rv.setUint32(0, h0);
  rv.setUint32(4, h1);
  rv.setUint32(8, h2);
  rv.setUint32(12, h3);
  rv.setUint32(16, h4);
  return result;
}

function rotl(n: number, shift: number): number {
  return ((n << shift) | (n >>> (32 - shift))) >>> 0;
}
