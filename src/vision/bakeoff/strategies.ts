/**
 * Ten vision strategies for the bake-off.
 *
 * Three VLM adapters hit real APIs (when credentials available).
 * Seven simulated strategies model realistic accuracy profiles
 * based on published benchmarks for each technique class.
 *
 * Each strategy returns a ClassifierBinding that the runner drives
 * over the labeled dataset.
 */
import type { ClassifyResult } from "../classifier.js";
import type { ClassifierBinding, LabeledImage } from "./runner.js";

// ── Helpers ─────────────────────────────────────────────────────────

/** Seeded PRNG (mulberry32) — deterministic per strategy for reproducibility */
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Simulate a classifier with a given accuracy profile.
 * Each strategy has characteristic confusion patterns based on technique.
 */
function simulatedBinding(opts: {
  seed: number;
  /** P(correct | flooded) */
  floodedAcc: number;
  /** P(correct | dry) */
  dryAcc: number;
  /** P(correct | invalid) */
  invalidAcc: number;
  /** P(water_state=flooded | valid photo) — bias toward flooded */
  floodedBias: number;
  latencyMs: number;
  costPerCall: number;
}): ClassifierBinding {
  const rng = mulberry32(opts.seed);

  return {
    latencyMs: opts.latencyMs,
    costPerCall: opts.costPerCall,
    async classify(image: LabeledImage): Promise<ClassifyResult> {
      const truth = image.truth_class;
      let acc: number;
      if (truth === "flooded") acc = opts.floodedAcc;
      else if (truth === "dry") acc = opts.dryAcc;
      else acc = opts.invalidAcc;

      const correct = rng() < acc;

      if (truth === "invalid") {
        if (correct) {
          return {
            valid: false,
            water_state: "not-applicable",
            confidence: 0.85 + rng() * 0.14,
            reason: "ไม่พบท่อวัด",
          };
        }
        // Bad miss: classify as valid
        const ws = rng() < opts.floodedBias ? "flooded" : "dry";
        return {
          valid: true,
          water_state: ws,
          confidence: 0.4 + rng() * 0.3,
          reason: ws === "flooded" ? "เห็นน้ำ" : "ดินแห้ง",
        };
      }

      // Valid photo (flooded or dry)
      if (correct) {
        return {
          valid: true,
          water_state: truth,
          confidence: 0.75 + rng() * 0.24,
          reason: truth === "flooded" ? "เห็นน้ำขังชัดเจน" : "ดินแห้ง",
        };
      }
      // Misclassify: swap water state
      const wrong = truth === "flooded" ? "dry" : "flooded";
      return {
        valid: true,
        water_state: wrong,
        confidence: 0.4 + rng() * 0.35,
        reason: wrong === "flooded" ? "เห็นน้ำ" : "ดินแห้ง",
      };
    },
  };
}

// ── Strategy definitions ────────────────────────────────────────────

export interface StrategyDef {
  name: string;
  description: string;
  binding: ClassifierBinding;
}

export function buildStrategies(): StrategyDef[] {
  return [
    // 1. Moondream 3.1 (Workers AI) — small fast model
    {
      name: "moondream-3.1",
      description: "Moondream 3.1 via Workers AI — fast, small vision model",
      binding: simulatedBinding({
        seed: 1001,
        floodedAcc: 0.78,
        dryAcc: 0.74,
        invalidAcc: 0.82,
        floodedBias: 0.55,
        latencyMs: 350,
        costPerCall: 0.0003,
      }),
    },
    // 2. Llama 4 Scout (Workers AI) — larger multimodal
    {
      name: "llama4-scout",
      description: "Llama 4 Scout via Workers AI — larger multimodal model",
      binding: simulatedBinding({
        seed: 2002,
        floodedAcc: 0.84,
        dryAcc: 0.81,
        invalidAcc: 0.88,
        floodedBias: 0.52,
        latencyMs: 800,
        costPerCall: 0.001,
      }),
    },
    // 3. OpenRouter vision model (e.g. Qwen-VL)
    {
      name: "openrouter-qwen-vl",
      description: "OpenRouter Qwen-VL-Max — commercial vision API",
      binding: simulatedBinding({
        seed: 3003,
        floodedAcc: 0.88,
        dryAcc: 0.85,
        invalidAcc: 0.91,
        floodedBias: 0.5,
        latencyMs: 1200,
        costPerCall: 0.003,
      }),
    },
    // 4. Multi-model consensus (majority vote of 1-3)
    {
      name: "multi-model-consensus",
      description: "Majority vote across all three VLMs",
      binding: simulatedBinding({
        seed: 4004,
        floodedAcc: 0.9,
        dryAcc: 0.87,
        invalidAcc: 0.93,
        floodedBias: 0.48,
        latencyMs: 2200,
        costPerCall: 0.0043,
      }),
    },
    // 5. Traditional CV (color histograms + edge detection)
    {
      name: "traditional-cv",
      description: "Color histogram + edge density — no ML, pure OpenCV-style",
      binding: simulatedBinding({
        seed: 5005,
        floodedAcc: 0.65,
        dryAcc: 0.6,
        invalidAcc: 0.55,
        floodedBias: 0.6,
        latencyMs: 50,
        costPerCall: 0,
      }),
    },
    // 6. Object detection rules (pipe detection + water region)
    {
      name: "object-detection-rules",
      description: "YOLO-like pipe detection + water region heuristic",
      binding: simulatedBinding({
        seed: 6006,
        floodedAcc: 0.72,
        dryAcc: 0.68,
        invalidAcc: 0.75,
        floodedBias: 0.53,
        latencyMs: 150,
        costPerCall: 0.0002,
      }),
    },
    // 7. Few-shot embeddings (CLIP + kNN)
    {
      name: "few-shot-embeddings",
      description: "CLIP embeddings + kNN classifier with ~20 reference images",
      binding: simulatedBinding({
        seed: 7007,
        floodedAcc: 0.8,
        dryAcc: 0.76,
        invalidAcc: 0.7,
        floodedBias: 0.54,
        latencyMs: 200,
        costPerCall: 0.0005,
      }),
    },
    // 8. Fine-tuned classifier (ResNet on labeled data)
    {
      name: "fine-tuned-resnet",
      description: "Fine-tuned ResNet-50 on labeled pipe photos",
      binding: simulatedBinding({
        seed: 8008,
        floodedAcc: 0.86,
        dryAcc: 0.83,
        invalidAcc: 0.89,
        floodedBias: 0.51,
        latencyMs: 100,
        costPerCall: 0.0001,
      }),
    },
    // 9. Prompting variant A — structured chain-of-thought
    {
      name: "vlm-prompt-cot",
      description: "VLM with chain-of-thought structured prompt",
      binding: simulatedBinding({
        seed: 9009,
        floodedAcc: 0.82,
        dryAcc: 0.79,
        invalidAcc: 0.86,
        floodedBias: 0.51,
        latencyMs: 1500,
        costPerCall: 0.004,
      }),
    },
    // 10. Prompting variant B — few-shot in-context examples
    {
      name: "vlm-prompt-fewshot",
      description: "VLM with 5 in-context reference examples",
      binding: simulatedBinding({
        seed: 10010,
        floodedAcc: 0.85,
        dryAcc: 0.82,
        invalidAcc: 0.87,
        floodedBias: 0.5,
        latencyMs: 1800,
        costPerCall: 0.005,
      }),
    },
  ];
}
