/**
 * Llama 4 Scout strategy - larger multimodal model
 * Uses VLM with detailed prompt
 */
import type { ClassifyResult } from "../classifier.js";
import type { ClassifierBinding, LabeledImage } from "./runner.js";
import { callVLM } from "./vlm-adapter.js";

export const llama4Scout: ClassifierBinding = {
  latencyMs: 800,
  costPerCall: 0,

  async classify(image: LabeledImage): Promise<ClassifyResult> {
    const imageBase64 = Buffer.from(image.bytes).toString("base64");

    const prompt = `You are an expert in agricultural water management and carbon credit verification.

Analyze this photo of a pipe monitoring station. Determine:
1. Is this a valid photo showing a clear pipe? (not blurry, not wrong subject)
2. If valid, what is the current water state?
   - "flooded" (น้ำขัง): water visible around or in the pipe
   - "dry" (ปล่อยแห้ง): no water visible, dry soil around pipe
   - "not-applicable": invalid photo or no pipe visible

Provide your analysis in JSON format:
{"valid": boolean, "water_state": "flooded"|"dry"|"not-applicable", "confidence": 0.0-1.0, "reason": "brief explanation in Thai"}`;

    try {
      return await callVLM(imageBase64, prompt);
    } catch (error) {
      return {
        valid: false,
        water_state: "not-applicable",
        confidence: 0,
        reason: `Llama 4 Scout failed: ${error.message}`
      };
    }
  }
};
