/**
 * OpenRouter Qwen-VL strategy - commercial vision API
 * Uses VLM with structured output prompt
 */
import type { ClassifyResult } from "../classifier.js";
import type { ClassifierBinding, LabeledImage } from "./runner.js";
import { callVLM } from "./vlm-adapter.js";

export const openrouterQwenVl: ClassifierBinding = {
  latencyMs: 1200,
  costPerCall: 0,

  async classify(image: LabeledImage): Promise<ClassifyResult> {
    const imageBase64 = Buffer.from(image.bytes).toString("base64");

    const prompt = `Analyze this pipe photo for AWD (Alternative Wet-Dry) rice farming verification.

Classification criteria:
- valid: true if photo clearly shows a pipe monitoring station
- water_state: "flooded" if water is visible, "dry" if soil is dry, "not-applicable" if invalid
- confidence: 0.0 to 1.0 indicating certainty
- reason: brief explanation in Thai

Respond with ONLY this JSON structure:
{"valid": boolean, "water_state": "flooded"|"dry"|"not-applicable", "confidence": number, "reason": string}`;

    try {
      return await callVLM(imageBase64, prompt);
    } catch (error) {
      return {
        valid: false,
        water_state: "not-applicable",
        confidence: 0,
        reason: `Qwen-VL failed: ${error.message}`
      };
    }
  }
};
