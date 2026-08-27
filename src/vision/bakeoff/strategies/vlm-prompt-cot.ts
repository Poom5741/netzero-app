/**
 * VLM Chain-of-Thought strategy - uses structured reasoning
 * Forces model to think step-by-step before answering
 */
import type { ClassifyResult } from "../classifier.js";
import type { ClassifierBinding, LabeledImage } from "./runner.js";
import { callVLM } from "./vlm-adapter.js";

export const vlmPromptCot: ClassifierBinding = {
  latencyMs: 1500,
  costPerCall: 0,

  async classify(image: LabeledImage): Promise<ClassifyResult> {
    const imageBase64 = Buffer.from(image.bytes).toString("base64");

    const prompt = `Analyze this pipe photo step-by-step:

Step 1: Does this photo show a pipe monitoring station?
- Look for: circular pipe opening, metallic or PVC material
- Invalid if: blurry, wrong subject, no pipe visible

Step 2: If valid, examine the water state:
- Flooded (น้ำขัง): water visible around pipe, wet soil, reflections
- Dry (ปล่อยแห้ง): dry soil, no water visible, cracked earth possible

Step 3: Assess your confidence:
- High (0.8-1.0): clear photo, obvious features
- Medium (0.5-0.8): some uncertainty but reasonable conclusion
- Low (0.0-0.5): very uncertain, photo quality issues

Provide your final answer as JSON:
{"valid": boolean, "water_state": "flooded"|"dry"|"not-applicable", "confidence": 0-1, "reason": "Thai explanation"}`;

    try {
      return await callVLM(imageBase64, prompt);
    } catch (error) {
      return {
        valid: false,
        water_state: "not-applicable",
        confidence: 0,
        reason: `Chain-of-thought failed: ${error.message}`
      };
    }
  }
};
