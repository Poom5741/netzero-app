/**
 * Bake-off runner — drives a strategy over labeled images.
 */
import type { ClassifyResult } from "../classifier.js";

export interface LabeledImage {
  id: string;
  truth_class: "flooded" | "dry" | "invalid";
  bytes: Uint8Array;
}

export interface ClassifierBinding {
  classify(image: LabeledImage): Promise<ClassifyResult>;
  latencyMs: number;
  costPerCall: number;
}

export interface Prediction {
  imageId: string;
  truth: LabeledImage["truth_class"];
  prediction: ClassifyResult;
}

export interface StrategyResult {
  strategyName: string;
  predictions: Prediction[];
  totalLatencyMs: number;
  totalCostUsd: number;
}

export async function runStrategy(
  name: string,
  binding: ClassifierBinding,
  images: LabeledImage[],
): Promise<StrategyResult> {
  const predictions: Prediction[] = [];
  let totalLatencyMs = 0;
  let totalCostUsd = 0;

  for (const image of images) {
    const result = await binding.classify(image);
    predictions.push({
      imageId: image.id,
      truth: image.truth_class,
      prediction: result,
    });
    totalLatencyMs += binding.latencyMs;
    totalCostUsd += binding.costPerCall;
  }

  return { strategyName: name, predictions, totalLatencyMs, totalCostUsd };
}
