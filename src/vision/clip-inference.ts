/**
 * CLIP Inference Endpoint — Issue #118
 * Thin wrapper around CLIPClassifier for inference with error handling.
 */
import type { CLIPClassifier } from "./clip-classifier.js";

export interface ClassifierResult {
  confidence: number;
  label: "flooded" | "dry" | "invalid";
  reason: string;
}

const FAIL_SAFE: ClassifierResult = {
  confidence: 0,
  label: "invalid",
  reason: "Embedding extraction failed",
};

/**
 * Run CLIP inference on an image buffer.
 * Returns ClassifierResult with confidence, label, and reason.
 * Handles malformed input and null classifier gracefully.
 */
export async function clipInference(
  classifier: CLIPClassifier,
  image: Buffer,
): Promise<ClassifierResult> {
  if (!classifier) return FAIL_SAFE;
  if (!image || image.length === 0) return FAIL_SAFE;

  try {
    const result = await classifier.classify(image);

    // Map ClassifyResult to ClassifierResult
    let label: "flooded" | "dry" | "invalid";
    if (result.water_state === "flooded") label = "flooded";
    else if (result.water_state === "dry") label = "dry";
    else label = "invalid";

    return {
      confidence: result.confidence,
      label,
      reason: result.reason || "CLIP few-shot classification",
    };
  } catch (err) {
    console.error("CLIP inference error:", err);
    return FAIL_SAFE;
  }
}
