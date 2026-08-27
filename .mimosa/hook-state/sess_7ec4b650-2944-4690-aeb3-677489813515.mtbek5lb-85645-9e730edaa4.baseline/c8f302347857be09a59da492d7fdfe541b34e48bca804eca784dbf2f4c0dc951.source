/**
 * Few-shot embeddings strategy - uses color histograms as embeddings with kNN
 * No API calls, completely free
 */
import { Jimp } from "jimp";
import type { ClassifyResult } from "../classifier.js";
import type { ClassifierBinding, LabeledImage } from "./runner.js";

// Reference embeddings (computed from sample images)
interface ReferenceSample {
  embedding: number[];
  label: "flooded" | "dry" | "invalid";
}

// Pre-computed reference samples (simulating a few-shot dataset)
const REFERENCE_SAMPLES: ReferenceSample[] = [
  // Flooded samples (blue-dominant)
  { embedding: [0.4, 0.3, 0.3, 0.2, 0.1, 0.1, 0.2, 0.3], label: "flooded" },
  { embedding: [0.45, 0.35, 0.25, 0.15, 0.1, 0.15, 0.25, 0.35], label: "flooded" },
  { embedding: [0.5, 0.3, 0.2, 0.1, 0.1, 0.2, 0.3, 0.4], label: "flooded" },
  // Dry samples (brown/red-dominant)
  { embedding: [0.1, 0.2, 0.3, 0.4, 0.5, 0.4, 0.3, 0.2], label: "dry" },
  { embedding: [0.15, 0.25, 0.35, 0.45, 0.45, 0.35, 0.25, 0.15], label: "dry" },
  { embedding: [0.1, 0.2, 0.4, 0.5, 0.4, 0.3, 0.2, 0.1], label: "dry" },
  // Invalid samples (uniform or low variance)
  { embedding: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2], label: "invalid" },
  { embedding: [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3], label: "invalid" },
];

export const fewShotEmbeddings: ClassifierBinding = {
  latencyMs: 200,
  costPerCall: 0,

  async classify(image: LabeledImage): Promise<ClassifyResult> {
    try {
      const jimpImage = await Jimp.read(Buffer.from(image.bytes));

      // Compute embedding (color histogram)
      const embedding = computeColorHistogram(jimpImage);

      // Find k nearest neighbors
      const k = 3;
      const neighbors = findKNearestNeighbors(embedding, REFERENCE_SAMPLES, k);

      // Check for pipe presence
      const hasPipe = detectPipePresence(jimpImage);

      if (!hasPipe) {
        return {
          valid: false,
          water_state: "not-applicable",
          confidence: 0.75,
          reason: "ไม่พบท่อวัดในภาพ"
        };
      }

      // Vote based on neighbors
      const votes = { flooded: 0, dry: 0, invalid: 0 };
      for (const neighbor of neighbors) {
        votes[neighbor.label]++;
      }

      // Determine classification
      const maxVotes = Math.max(votes.flooded, votes.dry, votes.invalid);

      if (votes.invalid === maxVotes) {
        return {
          valid: false,
          water_state: "not-applicable",
          confidence: 0.7,
          reason: "ภาพไม่ถูกต้องตามเกณฑ์"
        };
      }

      const waterState = votes.flooded > votes.dry ? "flooded" : "dry";
      const confidence = 0.6 + (maxVotes / k) * 0.3;

      return {
        valid: true,
        water_state: waterState,
        confidence: Math.min(0.95, confidence),
        reason: waterState === "flooded" ? "พบน้ำขังรอบท่อ" : "ดินแห้งรอบท่อ"
      };
    } catch (error) {
      return {
        valid: false,
        water_state: "not-applicable",
        confidence: 0,
        reason: `Embedding classification failed: ${error.message}`
      };
    }
  }
};

/**
 * Compute color histogram as embedding vector
 */
function computeColorHistogram(image: any): number[] {
  const { width, height } = image.bitmap;
  const bins = 8;
  const histogram = new Array(bins).fill(0);

  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const color = image.getPixelColor(x, y);
      const r = (color >> 24) & 255;
      const g = (color >> 16) & 255;
      const b = (color >> 8) & 255;

      // Compute dominant color channel
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const brightness = (max + min) / 2;

      // Bin by brightness
      const bin = Math.min(bins - 1, Math.floor((brightness / 255) * bins));
      histogram[bin]++;
    }
  }

  // Normalize
  const total = histogram.reduce((sum, count) => sum + count, 0);
  return histogram.map(count => count / total);
}

/**
 * Find k nearest neighbors using Euclidean distance
 */
function findKNearestNeighbors(
  embedding: number[],
  samples: ReferenceSample[],
  k: number
): ReferenceSample[] {
  const distances = samples.map(sample => ({
    sample,
    distance: euclideanDistance(embedding, sample.embedding)
  }));

  distances.sort((a, b) => a.distance - b.distance);
  return distances.slice(0, k).map(d => d.sample);
}

/**
 * Compute Euclidean distance between two vectors
 */
function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}

/**
 * Simple pipe presence detection
 */
function detectPipePresence(image: any): boolean {
  const { width, height } = image.bitmap;
  let edgeCount = 0;

  // Look for circular edges
  for (let y = 1; y < height - 1; y += 3) {
    for (let x = 1; x < width - 1; x += 3) {
      const center = image.getPixelColor(x, y);
      const top = image.getPixelColor(x, y - 1);
      const bottom = image.getPixelColor(x, y + 1);

      const centerR = (center >> 24) & 255;
      const topR = (top >> 24) & 255;
      const bottomR = (bottom >> 24) & 255;

      if (Math.abs(centerR - topR) > 40 || Math.abs(centerR - bottomR) > 40) {
        edgeCount++;
      }
    }
  }

  const edgeDensity = edgeCount / ((width / 3) * (height / 3));
  return edgeDensity > 0.03;
}
