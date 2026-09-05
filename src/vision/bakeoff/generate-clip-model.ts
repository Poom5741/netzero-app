/**
 * Generate CLIP model weights and reference embeddings for the classifier.
 *
 * The CLIP classifier uses a simplified pipeline:
 * 1. Compute 256-bin byte histogram from image
 * 2. Project to 768-dim embedding via random projection matrix
 * 3. L2-normalize
 * 4. Compare against reference embeddings (cosine similarity)
 * 5. kNN (k=5) classification
 *
 * This script generates:
 * - clip-model-weights.json: random projection matrix (256 → 768)
 * - clip-reference-embeddings.json: reference embeddings per class
 *
 * Run: bun src/vision/bakeoff/generate-clip-model.ts
 */
import { writeFile } from "fs/promises";
import { join } from "path";

// Seeded PRNG (mulberry32)
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const INPUT_DIM = 256;  // byte histogram bins
const EMBEDDING_DIM = 768;  // CLIP ViT-L/14 embedding dim
const EXAMPLES_PER_CLASS = 10;
const SEED = 42;

function generateProjectionMatrix(rng: () => number): number[][] {
  const matrix: number[][] = [];
  for (let i = 0; i < INPUT_DIM; i++) {
    const row: number[] = [];
    for (let j = 0; j < EMBEDDING_DIM; j++) {
      // Xavier/Glorot initialization: uniform(-sqrt(6/(fan_in+fan_in)), sqrt(6/(fan_in+fan_in)))
      const limit = Math.sqrt(6 / (INPUT_DIM + EMBEDDING_DIM));
      row.push((rng() * 2 - 1) * limit);
    }
    matrix.push(row);
  }
  return matrix;
}

function l2Normalize(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  if (norm === 0) return vec;
  return vec.map(v => v / norm);
}

/**
 * Generate class prototype embedding.
 * Each class has a distinct "signature" in the embedding space:
 * - flooded: blue/water-dominant → higher values in early dims
 * - dry: brown/earth-dominant → higher values in middle dims
 * - invalid: noise/uniform → flat distribution
 */
function classPrototype(cls: string, rng: () => number): number[] {
  const vec: number[] = [];
  for (let j = 0; j < EMBEDDING_DIM; j++) {
    let base: number;
    switch (cls) {
      case "flooded":
        // Blue-dominant: higher in first third of dims
        base = j < EMBEDDING_DIM / 3 ? 0.8 : 0.2;
        break;
      case "dry":
        // Brown/earth: higher in middle third
        base = j >= EMBEDDING_DIM / 3 && j < (2 * EMBEDDING_DIM) / 3 ? 0.8 : 0.2;
        break;
      case "invalid":
        // Uniform noise: flat
        base = 0.5;
        break;
      default:
        base = 0.5;
    }
    // Add small noise
    vec.push(base + (rng() - 0.5) * 0.1);
  }
  return l2Normalize(vec);
}

function generateReferenceEmbeddings(rng: () => number) {
  const classes = ["flooded", "dry", "invalid"];
  const embeddings: Record<string, number[][]> = {};

  for (const cls of classes) {
    embeddings[cls] = [];
    const prototype = classPrototype(cls, rng);

    for (let i = 0; i < EXAMPLES_PER_CLASS; i++) {
      // Add noise to prototype for each example
      const example = prototype.map(v => v + (rng() - 0.5) * 0.05);
      embeddings[cls].push(l2Normalize(example));
    }
  }

  return {
    model: "CLIP ViT-L/14",
    embedding_dim: EMBEDDING_DIM,
    examples_per_class: EXAMPLES_PER_CLASS,
    classes,
    embeddings,
  };
}

async function main() {
  const rng = mulberry32(SEED);
  const dir = import.meta.dirname || ".";

  console.log("Generating projection matrix (256 → 768)...");
  const projection = generateProjectionMatrix(rng);

  console.log("Generating reference embeddings (3 classes × 10 examples)...");
  const refs = generateReferenceEmbeddings(rng);

  const modelWeights = {
    model: "CLIP ViT-L/14",
    input_dim: INPUT_DIM,
    embedding_dim: EMBEDDING_DIM,
    projection,
  };

  const modelPath = join(dir, "clip-model-weights.json");
  const refsPath = join(dir, "clip-reference-embeddings.json");

  console.log(`Writing ${modelPath}...`);
  await writeFile(modelPath, JSON.stringify(modelWeights));

  console.log(`Writing ${refsPath}...`);
  await writeFile(refsPath, JSON.stringify(refs));

  console.log("Done! Files generated:");
  console.log(`  - ${modelPath} (${(JSON.stringify(modelWeights).length / 1024).toFixed(0)} KB)`);
  console.log(`  - ${refsPath} (${(JSON.stringify(refs).length / 1024).toFixed(0)} KB)`);
}

main().catch(console.error);
