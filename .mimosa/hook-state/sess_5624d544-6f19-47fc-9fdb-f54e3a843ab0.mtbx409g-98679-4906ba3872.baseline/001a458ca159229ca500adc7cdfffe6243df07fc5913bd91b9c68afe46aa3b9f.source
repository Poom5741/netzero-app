/**
 * VLM adapter - calls the free vision model via 9router
 * Hardcoded to localhost for development/bake-off only
 */
import type { ClassifyResult } from "../classifier.js";

// Hardcoded localhost endpoint for 9router (development only)
const API_URL = "http://localhost:8787/v1/chat/completions";
const API_KEY = process.env.NINE_ROUTER_API_KEY || "";
const MODEL = "alicode-intl/qwen3.5-plus";

if (!API_KEY) {
  console.warn("Warning: NINE_ROUTER_API_KEY not set, VLM strategies will fail");
}

export async function callVLM(
  imageBase64: string,
  prompt: string
): Promise<ClassifyResult> {
  if (!API_KEY) {
    throw new Error("NINE_ROUTER_API_KEY not configured");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
            }
          ]
        }
      ],
      max_tokens: 300,
      stream: false,
      redirect: "manual"
    })
  });

  // Check for redirects
  if (response.status >= 300 && response.status < 400) {
    throw new Error("Redirects not allowed");
  }

  const text = await response.text();
  const jsonMatch = text.match(/^{[\s\S]*}/);
  if (!jsonMatch) {
    throw new Error(`Invalid response: ${text.substring(0, 200)}`);
  }

  const data = JSON.parse(jsonMatch[0]);
  const content = data.choices[0].message.content;

  // Extract JSON from response (might be wrapped in markdown)
  const jsonContentMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonContentMatch) {
    throw new Error(`No JSON in content: ${content}`);
  }

  const result = JSON.parse(jsonContentMatch[0]);

  return {
    valid: result.valid === true,
    water_state: result.water_state || "not-applicable",
    confidence: result.confidence || 0,
    reason: result.reason || ""
  };
}

export { API_URL, API_KEY, MODEL };
