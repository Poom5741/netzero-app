/**
 * Multi-model consensus strategy - combines multiple VLM calls
 * Uses majority voting for more reliable results
 */
import type { ClassifyResult } from "../classifier.js";
import type { ClassifierBinding, LabeledImage } from "./runner.js";
import { callVLM } from "./vlm-adapter.js";

export const multiModelConsensus: ClassifierBinding = {
  latencyMs: 2200,
  costPerCall: 0,

  async classify(image: LabeledImage): Promise<ClassifyResult> {
    const imageBase64 = Buffer.from(image.bytes).toString("base64");

    // Three different prompts for diversity
    const prompts = [
      `Analyze this pipe photo. Is it valid? If valid, is water state flooded or dry? Respond with JSON: {"valid": boolean, "water_state": "flooded"|"dry"|"not-applicable", "confidence": 0-1, "reason": "Thai reason"}`,

      `You are verifying carbon credit photos for rice farming. Check if this shows a valid pipe and determine water state (flooded/dry). Return JSON: {"valid": boolean, "water_state": "flooded"|"dry"|"not-applicable", "confidence": 0-1, "reason": "Thai reason"}`,

      `Examine this agricultural monitoring photo. Classify: 1) Is photo valid (shows pipe)? 2) Water state: flooded, dry, or N/A? Output JSON: {"valid": boolean, "water_state": "flooded"|"dry"|"not-applicable", "confidence": 0-1, "reason": "Thai reason"}`
    ];

    try {
      // Call VLM three times with different prompts
      const results = await Promise.all(
        prompts.map(prompt => callVLM(imageBase64, prompt).catch(() => null))
      );

      // Filter out failed calls
      const validResults = results.filter(r => r !== null) as ClassifyResult[];

      if (validResults.length === 0) {
        return {
          valid: false,
          water_state: "not-applicable",
          confidence: 0,
          reason: "All model calls failed"
        };
      }

      // Majority voting for validity
      const validVotes = validResults.filter(r => r.valid).length;
      const isValid = validVotes > validResults.length / 2;

      // Majority voting for water state
      const waterStates = validResults.map(r => r.water_state);
      const floodedVotes = waterStates.filter(s => s === "flooded").length;
      const dryVotes = waterStates.filter(s => s === "dry").length;

      let waterState: "flooded" | "dry" | "not-applicable";
      if (!isValid) {
        waterState = "not-applicable";
      } else if (floodedVotes > dryVotes) {
        waterState = "flooded";
      } else if (dryVotes > floodedVotes) {
        waterState = "dry";
      } else {
        waterState = "dry"; // Tie-breaker
      }

      // Average confidence
      const avgConfidence = validResults.reduce((sum, r) => sum + r.confidence, 0) / validResults.length;

      // Use the reason from the most confident result
      const bestResult = validResults.reduce((best, r) =>
        r.confidence > best.confidence ? r : best
      );

      return {
        valid: isValid,
        water_state: waterState,
        confidence: avgConfidence,
        reason: bestResult.reason
      };
    } catch (error) {
      return {
        valid: false,
        water_state: "not-applicable",
        confidence: 0,
        reason: `Consensus failed: ${error.message}`
      };
    }
  }
};
