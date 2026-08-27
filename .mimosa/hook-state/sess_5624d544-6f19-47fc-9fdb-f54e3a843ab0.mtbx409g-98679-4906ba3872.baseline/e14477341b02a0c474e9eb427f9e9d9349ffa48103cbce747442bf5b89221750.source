/**
 * Batch-3 learned strategies (issue #97): seeded stratified split, T6 kNN over
 * injected embeddings, T3 fine-tuned classifier served via injected HTTP
 * predictor. Everything runs against fakes — no downloads, no network, no torch.
 */

import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { BakeoffManifest, PipeLabel } from "../../src/vision/bakeoff";
import { type ClassifyPipePhoto, FAIL_SAFE } from "../../src/vision/classifier";
import { makeSplit, mulberry32, SPLIT_SEED, TRAIN_RATIO } from "../../src/vision/split";
import {
  cosineDistance,
  type EmbeddingFn,
  makeHttpPredictStrategy,
  makeKnnStrategy,
  T3_ENDPOINT_PATH,
  T3_FINETUNED,
  T3_STATUS,
  T6_KNN,
} from "../../src/vision/strategies-learned";

// ---------- helpers ----------

const textImage = (s: string): ArrayBuffer =>
  new TextEncoder().encode(s).buffer.slice(0) as ArrayBuffer;

function countingEmbedder(vectors: Map<string, number[]>): {
  embed: EmbeddingFn;
  calls: () => number;
} {
  let calls = 0;
  return {
    calls: () => calls,
    embed: async (image) => {
      calls += 1;
      const v = vectors.get(new TextDecoder().decode(image));
      if (!v) throw new Error(`no vector for input`);
      return [...v];
    },
  };
}

const entry = (path: string, label: PipeLabel) => ({ path, label });

/** 2D unit vectors keyed by the fake image text. */
const VEC_2D = new Map<string, number[]>([
  ["f0", [1, 0]],
  ["f1", [0.99, 0.01]],
  ["f2", [0.98, 0.02]],
  ["d0", [0, 1]],
  ["d1", [0.02, 0.98]],
  // query-only keys (never used as exemplars)
  ["q-flooded", [0.97, 0.03]],
  ["q-dry", [0.04, 0.96]],
]);

// ---------- split ----------

describe("makeSplit", () => {
  const manifest: BakeoffManifest = {
    images: [
      ...Array.from({ length: 20 }, (_, i) => entry(`flooded/${i}.png`, "flooded")),
      ...Array.from({ length: 20 }, (_, i) => entry(`dry/${i}.jpg`, "dry")),
      ...Array.from({ length: 10 }, (_, i) => entry(`invalid/${i}.png`, "invalid")),
    ],
  };

  it("stratifies 70/30 per class within ±1 and partitions the manifest", () => {
    const s = makeSplit(manifest);
    const countBy = (rows: typeof s.train, label: PipeLabel) =>
      rows.filter((r) => r.label === label).length;
    expect(countBy(s.train, "flooded")).toBe(14);
    expect(countBy(s.holdout, "flooded")).toBe(6);
    expect(countBy(s.train, "dry")).toBe(14);
    expect(countBy(s.holdout, "dry")).toBe(6);
    expect(countBy(s.train, "invalid")).toBe(7);
    expect(countBy(s.holdout, "invalid")).toBe(3);

    const trainPaths = new Set(s.train.map((r) => r.path));
    const holdPaths = s.holdout.map((r) => r.path);
    expect(holdPaths.filter((p) => trainPaths.has(p))).toEqual([]);
    expect(trainPaths.size + holdPaths.length).toBe(manifest.images.length);
    expect(s.seed).toBe(SPLIT_SEED);
    expect(s.trainRatio).toBe(TRAIN_RATIO);
  });

  it("is deterministic for a fixed seed", () => {
    expect(JSON.stringify(makeSplit(manifest))).toBe(JSON.stringify(makeSplit(manifest)));
  });

  it("mulberry32 is a pure PRNG stream", () => {
    const a = mulberry32(SPLIT_SEED);
    const b = mulberry32(SPLIT_SEED);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
    for (const x of seqA) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
});

// ---------- T6 kNN ----------

describe("cosineDistance", () => {
  it("is 0 for identical, 1 for orthogonal, 2 for opposite vectors", () => {
    expect(cosineDistance([1, 0], [1, 0])).toBeCloseTo(0);
    expect(cosineDistance([1, 0], [0, 1])).toBeCloseTo(1);
    expect(cosineDistance([1, 0], [-1, 0])).toBeCloseTo(2);
  });
  it("treats a zero vector as maximal-uncertainty distance 1", () => {
    expect(cosineDistance([0, 0], [1, 0])).toBeCloseTo(1);
  });
});

describe("makeKnnStrategy (t6-knn)", () => {
  const trainEntries = [
    entry("f0", "flooded"),
    entry("f1", "flooded"),
    entry("f2", "flooded"),
    entry("d0", "dry"),
    entry("d1", "dry"),
  ];
  const loadImage = async (p: string) => textImage(p.replace(/\.*/, ""));

  it("majority vote picks flooded, confidence = votes/k", async () => {
    const { embed } = countingEmbedder(VEC_2D);
    const knn = makeKnnStrategy({
      embed,
      exemplarEntries: trainEntries,
      loadImage,
      k: 5,
    });
    const result = await knn(textImage("f0"));
    expect(result.validity).toBe("valid");
    expect(result.water_state).toBe("flooded");
    expect(result.confidence).toBeCloseTo(0.6); // 3 flooded + 2 dry neighbours
  });

  it("tie on votes resolves by smaller summed distance", async () => {
    // q = [1,0]; idx0 dry at distance 2.0, idx1 flooded at distance ~0.1 -> 1-1 vote, flooded closer.
    const vectors = new Map<string, number[]>([
      ["q", [1, 0]],
      ["far", [-1, 0]],
      ["near", [0.9, Math.sqrt(1 - 0.81)]],
    ]);
    const { embed } = countingEmbedder(vectors);
    const knn = makeKnnStrategy({
      embed,
      exemplarEntries: [entry("far", "dry"), entry("near", "flooded")],
      loadImage,
      k: 2,
    });
    const result = await knn(textImage("q"));
    expect(result.water_state).toBe("flooded");
  });

  it("full tie (votes and distance) resolves to the lower exemplar index", async () => {
    // Mirror pair at equal distance from q=[1,0]; idx0 flooded beats idx1 dry.
    const c = Math.cos(Math.PI / 3);
    const s = Math.sin(Math.PI / 3);
    const vectors = new Map<string, number[]>([
      ["q", [1, 0]],
      ["m0", [c, s]],
      ["m1", [c, -s]],
    ]);
    const { embed } = countingEmbedder(vectors);
    const knn = makeKnnStrategy({
      embed,
      exemplarEntries: [entry("m0", "flooded"), entry("m1", "dry")],
      loadImage,
      k: 2,
    });
    expect((await knn(textImage("q"))).water_state).toBe("flooded");
  });

  it("k=1 returns the single nearest neighbour's label", async () => {
    const { embed } = countingEmbedder(VEC_2D);
    const knn = makeKnnStrategy({
      embed,
      exemplarEntries: trainEntries,
      loadImage,
      k: 1,
    });
    // [0.02, 0.98] sits nearest d1 (dry).
    expect((await knn(textImage("d1"))).water_state).toBe("dry");
  });

  it("clamps k when it exceeds the exemplar count", async () => {
    const { embed } = countingEmbedder(VEC_2D);
    const knn = makeKnnStrategy({
      embed,
      exemplarEntries: [entry("f0", "flooded")],
      loadImage,
      k: 5,
    });
    expect((await knn(textImage("f0"))).water_state).toBe("flooded");
  });

  it("caches embeddings by content hash — repeat images never re-embed", async () => {
    const counter = countingEmbedder(VEC_2D);
    const knn = makeKnnStrategy({
      embed: counter.embed,
      exemplarEntries: trainEntries,
      loadImage,
      k: 5,
    });
    await knn(textImage("q-flooded")); // 5 exemplars + 1 fresh query
    expect(counter.calls()).toBe(6);
    await knn(textImage("q-flooded")); // fully cached
    expect(counter.calls()).toBe(6);
    await knn(textImage("q-dry")); // 1 new query embedding
    expect(counter.calls()).toBe(7);
  });

  it("fails safe on malformed embeddings, embedder throws, and empty exemplars", async () => {
    const throwing: EmbeddingFn = async () => {
      throw new Error("embedder down");
    };
    // Query embeds to a different dimensionality than the exemplars.
    const dimMismatch = countingEmbedder(new Map([...VEC_2D, ["q-bad", [1, 0, 0]]])).embed;

    const cases: [ClassifyPipePhoto, string][] = [
      [
        makeKnnStrategy({
          embed: async () => [Number.NaN, 1],
          exemplarEntries: trainEntries,
          loadImage,
        }),
        "f0",
      ],
      [makeKnnStrategy({ embed: dimMismatch, exemplarEntries: trainEntries, loadImage }), "q-bad"],
      [makeKnnStrategy({ embed: throwing, exemplarEntries: trainEntries, loadImage }), "f0"],
      [makeKnnStrategy({ embed: async () => [1, 0], exemplarEntries: [], loadImage }), "f0"],
    ];
    for (const [knn, img] of cases) {
      expect(await knn(textImage(img))).toEqual(FAIL_SAFE);
    }
  });

  it("exposes the registry name t6-knn", () => {
    expect(T6_KNN).toBe("t6-knn");
  });
});

// ---------- T3 fine-tuned classifier ----------

describe("makeHttpPredictStrategy (t3-finetuned)", () => {
  const classification = {
    validity: "valid",
    water_state: "dry",
    confidence: 0.87,
    reason_th: "ท่อแห้ง",
  };
  const okResponse = (body: string) => ({
    ok: true,
    status: 200,
    text: async () => body,
  });

  it("posts base64 image to the /classify endpoint and parses the reply", async () => {
    const seen: { url: string; init?: Record<string, unknown> }[] = [];
    const fetchImpl = async (url: string, init?: Record<string, unknown>) => {
      seen.push({ url, init });
      return okResponse(JSON.stringify(classification));
    };
    const predict = makeHttpPredictStrategy({
      url: `http://127.0.0.1:8765${T3_ENDPOINT_PATH}`,
      fetchImpl,
    });
    const result = await predict(textImage("img-bytes"));
    expect(result).toEqual(classification);
    expect(seen.length).toBe(1);
    expect(seen[0]?.url).toBe("http://127.0.0.1:8765/classify");
    expect(seen[0]?.init?.method).toBe("POST");
    const headers = seen[0]?.init?.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
    const body = JSON.parse(seen[0]?.init?.body as string) as { image_base64: string };
    expect(body.image_base64).toBe(btoa("img-bytes"));
  });

  it("falls back to FAIL_SAFE on malformed output, HTTP errors, and throws", async () => {
    const malformed = makeHttpPredictStrategy({
      url: "http://x/classify",
      fetchImpl: async () => okResponse("not json"),
    });
    const httpErr = makeHttpPredictStrategy({
      url: "http://x/classify",
      fetchImpl: async () => ({ ok: false, status: 500, text: async () => "" }),
    });
    const throwing = makeHttpPredictStrategy({
      url: "http://x/classify",
      fetchImpl: async () => {
        throw new Error("conn refused");
      },
    });
    for (const p of [malformed, httpErr, throwing]) {
      expect(await p(textImage("z"))).toEqual(FAIL_SAFE);
    }
  });

  it("reports NOT_TRAINED until a real artifact is trained and served", () => {
    expect(T3_FINETUNED).toBe("t3-finetuned");
    expect(T3_ENDPOINT_PATH).toBe("/classify");
    expect(T3_STATUS.trained).toBe(false);
    expect(T3_STATUS.status).toContain("NOT_TRAINED");
  });
});

// ---------- script-level executable checks ----------

describe("scripts/make-split.ts CLI", () => {
  const scriptPath = fileURLToPath(new URL("../../scripts/make-split.ts", import.meta.url).href);

  it("regenerates a byte-identical stratified split.json across runs", () => {
    const dir = mkdtempSync(join(tmpdir(), "nzc-split-"));
    try {
      const images = [
        ...Array.from({ length: 20 }, (_, i) => ({ path: `flooded/${i}.png`, label: "flooded" })),
        ...Array.from({ length: 20 }, (_, i) => ({ path: `dry/${i}.jpg`, label: "dry" })),
        ...Array.from({ length: 10 }, (_, i) => ({ path: `invalid/${i}.png`, label: "invalid" })),
      ];
      writeFileSync(join(dir, "manifest.json"), JSON.stringify({ images }));

      const run = () =>
        spawnSync(process.execPath, ["run", scriptPath, "--data-dir", dir], {
          encoding: "utf8",
        });
      expect(run().status).toBe(0);
      const first = readFileSync(join(dir, "split.json"), "utf8");
      expect(run().status).toBe(0);
      const second = readFileSync(join(dir, "split.json"), "utf8");
      expect(second).toBe(first);

      const parsed = JSON.parse(first) as {
        train: { path: string; label: PipeLabel }[];
        holdout: { path: string; label: PipeLabel }[];
        counts: {
          train: Record<PipeLabel, number>;
          holdout: Record<PipeLabel, number>;
        };
      };
      expect(parsed.counts.train.flooded).toBe(14);
      expect(parsed.counts.holdout.invalid).toBe(3);
      expect(parsed.train.length + parsed.holdout.length).toBe(images.length);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("training/ python scripts", () => {
  it("are at least syntactically valid python (skipped if python3 missing)", () => {
    const probe = spawnSync("python3", ["-c", "print(1)"], { encoding: "utf8" });
    if (probe.error ?? probe.status !== 0) {
      return; // python3 unavailable in this environment — nothing to prove
    }
    const check = (file: string) =>
      `compile(open(${JSON.stringify(file)}).read(), ${JSON.stringify(file)}, "exec")`;
    const code = [`${check("training/train.py")}`, `${check("training/serve.py")}`].join("; ");
    const res = spawnSync("python3", ["-c", code], {
      cwd: fileURLToPath(new URL("../..", import.meta.url).href),
      encoding: "utf8",
    });
    expect(res.status).toBe(0);
  });
});
