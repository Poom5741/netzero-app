/**
 * Moondream 3.1 strategy - small fast vision model
 * Uses VLM with basic prompt
 */
import type { ClassifyResult } from "../classifier.js";
import type { ClassifierBinding, LabeledImage } from "./runner.js";
import { callVLM } from "./vlm-adapter.js";

export const moondream31: ClassifierBinding = {
  latencyMs: 350,
  costPerCall: 0,

  async classify(image: LabeledImage): Promise<ClassifyResult> {
    const imageBase64 = Buffer.from(image.bytes).toString("base64");

    const prompt = `Analyze this pipe photo for carbon credit verification.

Is the photo valid (shows a clear pipe)? If valid, is the water state flooded (น้ำขัง) or dry (ปล่อยแห้ง)?

Respond with ONLY JSON: {"valid": boolean, "water_state": "flooded"|"dry"|"not-applicable", "confidence": 0-1, "reason": "short Thai reason"}`;

    try {
      return await callVLM(imageBase64, prompt);
    } catch (error) {
      return {
        valid: false,
        water_state: "not-applicable",
        confidence: 0,
        reason: `Moondream 3.1 failed: ${error.message}`
      };
    }
  }
};
