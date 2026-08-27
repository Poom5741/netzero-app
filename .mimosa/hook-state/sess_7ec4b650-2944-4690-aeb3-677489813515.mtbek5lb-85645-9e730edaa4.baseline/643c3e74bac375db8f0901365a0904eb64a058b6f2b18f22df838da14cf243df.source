/**
 * VLM Few-Shot strategy - includes example classifications in prompt
 * Provides reference examples to guide the model
 */
import type { ClassifyResult } from "../classifier.js";
import type { ClassifierBinding, LabeledImage } from "./runner.js";
import { callVLM } from "./vlm-adapter.js";

export const vlmPromptFewshot: ClassifierBinding = {
  latencyMs: 1800,
  costPerCall: 0,

  async classify(image: LabeledImage): Promise<ClassifyResult> {
    const imageBase64 = Buffer.from(image.bytes).toString("base64");

    const prompt = `Classify pipe photos for carbon credit verification. Here are examples:

Example 1:
Photo shows clear pipe with water around it
→ {"valid": true, "water_state": "flooded", "confidence": 0.95, "reason": "เห็นท่อชัดเจน มีน้ำขังรอบท่อ"}

Example 2:
Photo shows pipe with dry soil, no water
→ {"valid": true, "water_state": "dry", "confidence": 0.9, "reason": "เห็นท่อชัดเจน ดินแห้งไม่มีน้ำ"}

Example 3:
Photo is blurry or doesn't show pipe
→ {"valid": false, "water_state": "not-applicable", "confidence": 0.8, "reason": "ภาพไม่ชัดเจนหรือไม่เห็นท่อ"}

Now classify this photo using the same format:
{"valid": boolean, "water_state": "flooded"|"dry"|"not-applicable", "confidence": 0-1, "reason": "Thai reason"}`;

    try {
      return await callVLM(imageBase64, prompt);
    } catch (error) {
      return {
        valid: false,
        water_state: "not-applicable",
        confidence: 0,
        reason: `Few-shot failed: ${error.message}`
      };
    }
  }
};
