/**
 * Debug: call moondream directly on a known-good image and inspect raw response.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { makeWorkersAiVision, buildPipePrompt } from "../src/vision/providers/index.ts";
import { parseClassifierOutput } from "../src/vision/classifier.ts";

const ACCOUNT_ID = "a1d68d92ed0cda5cea113ff208eba3a1";
const IMAGE_PATH = "data/labeled-pipes/flooded/1.png";

async function main() {
  const token = process.env.WRANGLER_OAUTH_TOKEN;
  if (!token) throw new Error("WRANGLER_OAUTH_TOKEN not set");

  const imageBuffer = readFileSync(join(IMAGE_PATH));
  const imageBytes = Array.from(new Uint8Array(imageBuffer));
  const prompt = buildPipePrompt();

  console.log("=== PROMPT ===");
  console.log(prompt);
  console.log("\n=== IMAGE ===");
  console.log(`File: ${IMAGE_PATH}, Size: ${imageBuffer.length} bytes`);

  // Direct REST call
  console.log("\n=== RAW API CALL ===");
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/moondream/moondream3.1-9B-A2B`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, image: imageBytes }),
    },
  );
  const raw = await res.json();
  console.log("Status:", res.status);
  console.log("Raw result:", JSON.stringify(raw, null, 2).slice(0, 1000));

  // Extract text
  const result = raw.result;
  let extractedText = "";
  if (typeof result === "string") {
    extractedText = result;
  } else if (typeof result === "object" && result !== null) {
    const r = result as Record<string, unknown>;
    for (const key of ["description", "response", "result", "content", "text"]) {
      if (typeof r[key] === "string") {
        extractedText = r[key] as string;
        break;
      }
    }
  }
  console.log("\n=== EXTRACTED TEXT ===");
  console.log(extractedText || "(empty)");

  // Parse
  console.log("\n=== PARSED CLASSIFICATION ===");
  const parsed = parseClassifierOutput(extractedText);
  console.log(JSON.stringify(parsed, null, 2));

  // Now test via the adapter
  console.log("\n=== VIA ADAPTER ===");
  const invoker = async (model: string, input: Record<string, unknown>) => {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${model}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
    );
    const j = await res.json();
    if (!res.ok || j.errors?.length) throw new Error(JSON.stringify(j.errors));
    return j.result;
  };
  const strategy = makeWorkersAiVision("@cf/moondream/moondream3.1-9B-A2B", { ai: invoker });
  const classification = await strategy(imageBuffer.buffer);
  console.log(JSON.stringify(classification, null, 2));
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
