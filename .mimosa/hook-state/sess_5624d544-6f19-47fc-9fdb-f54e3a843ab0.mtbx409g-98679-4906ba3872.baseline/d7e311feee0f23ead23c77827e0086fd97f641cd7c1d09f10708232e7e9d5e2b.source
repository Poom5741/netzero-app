/**
 * Debug: test if downscaling the image fixes the Workers AI API rejection.
 * Uses pngjs (decode) + jpeg-js (encode) — both already installed devDeps.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";
import jpeg from "jpeg-js";

function downscaleToJpeg(buffer: Buffer, maxDim = 768): Buffer {
  // Decode (png or jpeg)
  let width: number, height: number, data: Buffer;
  if (buffer[0] === 0x89 && buffer[1] === 0x50) {
    // PNG
    const png = PNG.sync.read(buffer);
    width = png.width;
    height = png.height;
    data = png.data;
  } else {
    // JPEG
    const jpg = jpeg.decode(buffer, { useTArray: true });
    width = jpg.width;
    height = jpg.height;
    data = Buffer.from(jpg.data);
  }

  // Scale down preserving aspect ratio
  const scale = Math.min(1, maxDim / Math.max(width, height));
  const newW = Math.max(1, Math.round(width * scale));
  const newH = Math.max(1, Math.round(height * scale));

  const out = Buffer.alloc(newW * newH * 4);
  for (let y = 0; y < newH; y++) {
    for (let x = 0; x < newW; x++) {
      const srcX = Math.min(width - 1, Math.floor(x / scale));
      const srcY = Math.min(height - 1, Math.floor(y / scale));
      const si = (srcY * width + srcX) * 4;
      const di = (y * newW + x) * 4;
      out[di] = data[si];
      out[di + 1] = data[si + 1];
      out[di + 2] = data[si + 2];
      out[di + 3] = data[si + 3];
    }
  }

  // Encode JPEG q80
  return jpeg.encode({ data: out, width: newW, height: newH }, 80).data;
}

async function main() {
  const token = process.env.WRANGLER_OAUTH_TOKEN!;
  const original = readFileSync("data/labeled-pipes/flooded/1.png");
  const resized = downscaleToJpeg(original);
  console.log(`original: ${(original.length / 1024 / 1024).toFixed(1)} MB, resized: ${(resized.length / 1024).toFixed(0)} KB`);

  const prompt = [
    "จำแนกภาพนี้และตอบด้วย JSON เท่านั้น:",
    '{"validity":"valid|invalid","water_state":"flooded|dry|not_applicable","confidence":0.0-1.0,"reason_th":"เหตุผลสั้นๆ ภาษาไทย"}',
  ].join("\n");

  const res = await fetch(
    "https://api.cloudflare.com/client/v4/accounts/a1d68d92ed0cda5cea113ff208eba3a1/ai/run/@cf/moondream/moondream3.1-9B-A2B",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, image: resized.toString("base64") }),
    },
  );
  const j = await res.json();
  console.log("Status:", res.status);
  console.log("Result:", JSON.stringify(j.result ?? j.errors).slice(0, 600));
}

main().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
