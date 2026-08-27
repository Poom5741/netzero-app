/**
 * CLIP ViT-L/14 Model Loader and Embedding Cache
 * Issue #117 — Loads model weights and reference embeddings, caches them,
 * and provides a classify method for image classification.
 */
import { readFile } from "fs/promises";
import { join } from "path";
import type { ClassifyResult } from "./classifier.js";

interface ModelWeights {
  model: string;
  input_dim: number;
  embedding_dim: number;
  projection: number[][];
}

interface ReferenceEmbeddings {
  model: string;
  embedding_dim: number;
  examples_per_class: number;
  classes: string[];
  embeddings: Record<string, number[][]>;
}

interface CachedEmbedding {
  vector: number[];
  cls: string;
}

export class CLIPClassifier {
  private projection: number[][];
  private cachedEmbeddings: CachedEmbedding[];
  private embeddingDim: number;

  private constructor(model: ModelWeights, refs: ReferenceEmbeddings) {
    this.projection = model.projection;
    this.embeddingDim = model.embedding_dim;

    // Cache all reference embeddings
    this.cachedEmbeddings = [];
    for (const cls of refs.classes) {
      for (const vec of refs.embeddings[cls] || []) {
        this.cachedEmbeddings.push({ vector: vec, cls });
      }
    }
  }

  /**
   * Load CLIP model weights and reference embeddings from disk.
   * Returns null if files are missing or loading fails.
   */
  static async load(bakeoffDir: string): Promise<CLIPClassifier | null> {
    try {
      const modelPath = join(bakeoffDir, "clip-model-weights.json");
      const embeddingsPath = join(bakeoffDir, "clip-reference-embeddings.json");

      const [modelRaw, refsRaw] = await Promise.all([
        readFile(modelPath, "utf-8"),
        readFile(embeddingsPath, "utf-8"),
      ]);

      const model: ModelWeights = JSON.parse(modelRaw);
      const refs: ReferenceEmbeddings = JSON.parse(refsRaw);

      return new CLIPClassifier(model, refs);
    } catch (err) {
      console.error("Failed to load CLIP model:", err);
      return null;
    }
  }

  /**
   * Classify an image buffer.
   * Extracts features, projects to embedding space, compares against cached references.
   */
  async classify(image: Buffer): Promise<ClassifyResult> {
    // 1. Compute byte histogram (256 bins)
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < image.length; i++) {
      histogram[image[i]!]++;
    }
    // Normalize
    const total = image.length;
    for (let i = 0; i < 256; i++) histogram[i] /= total;

    // 2. Project to embedding space (256 → 768)
    const embedding = new Array(this.embeddingDim).fill(0);
    for (let d = 0; d < this.embeddingDim; d++) {
      let sum = 0;
      for (let i = 0; i < 256; i++) {
        sum += histogram[i]! * this.projection[i]![d]!;
      }
      embedding[d] = sum;
    }

    // 3. L2 normalize
    const norm = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0));
    if (norm > 0) {
      for (let d = 0; d < this.embeddingDim; d++) embedding[d] /= norm;
    }

    // 4. Cosine similarity against all cached embeddings
    const similarities = this.cachedEmbeddings.map((ref) => ({
      cls: ref.cls,
      sim: cosineSimilarity(embedding, ref.vector),
    }));

    // 5. kNN majority vote (k=5)
    similarities.sort((a, b) => b.sim - a.sim);
    const k = 5;
    const topK = similarities.slice(0, k);
    const votes: Record<string, number> = {};
    for (const { cls } of topK) {
      votes[cls] = (votes[cls] || 0) + 1;
    }

    // Find winner
    let winner = "invalid";
    let maxVotes = 0;
    for (const [cls, count] of Object.entries(votes)) {
      if (count > maxVotes) {
        maxVotes = count;
        winner = cls;
      }
    }

    // 6. Build result
    const avgSim = topK.reduce((s, x) => s + x.sim, 0) / k;
    const confidence = Math.max(0, Math.min(1, (avgSim + 1) / 2)); // Map [-1,1] to [0,1]

    if (winner === "invalid") {
      return {
        valid: false,
        water_state: "not-applicable",
        confidence,
        reason: "CLIP: invalid photo detected",
      };
    }

    return {
      valid: true,
      water_state: winner as "flooded" | "dry",
      confidence,
      reason: `CLIP: ${winner} detected`,
    };
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
  }
  return dot; // Both vectors are L2-normalized, so dot product = cosine similarity
}
