/**
 * Issue #99 — LIVE bake-off leaderboard run.
 *
 * Executes every registered technique over the HOLD-OUT split against real
 * models where credentials allow:
 *  - Workers AI rows (moondream, llama4scout, detr) via REST + wrangler OAuth token
 *    (token read at runtime from env var — never logged)
 *  - t4-color-lines runs locally (free)
 *  - t7-consensus runs in DEGRADED 2-voter form (openrouter key unavailable locally)
 *  - t1-openrouter / t6-knn(real embedder) / t3-finetuned recorded as NOT RUN with reasons
 *
 * ponytail: concurrency fixed at 5; raise only if Cloudflare rate limits allow.
 *
 * Usage: bun run scripts/run-bakeoff-live.ts [--limit N]
 * Requires: WRANGLER_OAUTH_TOKEN env var (or set it from your wrangler config manually)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  type BakeoffManifest,
  type BakeoffRun,
  passesBar,
  runStrategy,
  scoreResults,
  type ScoredResult,
} from "../src/vision/bakeoff";
import { FAIL_SAFE } from "../src/vision/classifier";
import { makeT1Strategies, T1_MOONDREAM, T1_LLAMA4SCOUT, makeConsensusStrategy } from "../src/vision/strategies-vlm";
import { makeT2DetrRulesStrategy, makeT4ColorLinesStrategy } from "../src/vision/strategies-cv";
import { classifySequence, makeHybridWithStats } from "../src/vision/strategies-contextual";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? "a1d68d92ed0cda5cea113ff208eba3a1";
const DATA_DIR = "data/labeled-pipes";
const CONCURRENCY = 5;
const limitArg = process.argv.indexOf("--limit");
const LIMIT = limitArg > -1 ? Number(process.argv[limitArg + 1]) : undefined;

function readOAuthToken(): string {
  const token = process.env.WRANGLER_OAUTH_TOKEN;
  if (!token) {
    throw new Error(
      "WRANGLER_OAUTH_TOKEN not set. Extract it from your wrangler config:\n" +
      "  macOS: grep oauth_token ~/Library/Preferences/.wrangler/config/default.toml\n" +
      "  Then: export WRANGLER_OAUTH_TOKEN=<value>",
    );
  }
  if (!/^[A-Za-z0-9_.\-]+$/.test(token)) throw new Error("token format invalid");
  return token;
}

/** AiInvoker adapter over Workers AI REST; provider modules send image as number[], REST wants base64 string. */
function makeRestInvoker(token: string) {
  return async (model: string, input: Record<string, unknown>): Promise<unknown> => {
    let image = input.image;
    if (Array.isArray(image)) {
      image = Buffer.from(image as number[]).toString("base64");
    } else if (image instanceof ArrayBuffer || image instanceof Uint8Array) {
      image = Buffer.from(image as Uint8Array).toString("base64");
    }
    const body = JSON.stringify({ ...input, image });
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${model}`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body,
            signal: AbortSignal.timeout(60_000),
          },
        );
        if (res.status === 429 || res.status >= 500) throw new Error(`http ${res.status}`);
        const j = (await res.json()) as { result?: unknown; errors?: unknown[] };
        if (!res.ok || j.errors?.length) throw new Error(JSON.stringify(j.errors)?.slice(0, 200));
        return j.result;
      } catch (err) {
        if (attempt === 1) throw err;
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
    throw new Error("unreachable");
  };
}

async function mapPool<T, R>(items: T[], n: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, worker));
  return out;
}

async function main() {
  const token = readOAuthToken();
  const invoker = makeRestInvoker(token);
  const manifest: BakeoffManifest = JSON.parse(readFileSync(join(DATA_DIR, "manifest.json"), "utf8"));
  const split = JSON.parse(readFileSync(join(DATA_DIR, "split.json"), "utf8"));
  const holdoutPaths = new Set<string>(split.holdout.map((e: { path: string }) => e.path));
  const holdoutManifest: BakeoffManifest = {
    images: manifest.images.filter((i) => holdoutPaths.has(i.path)),
  };
  console.log(
    `hold-out set: ${holdoutManifest.images.length} images ` +
      `(flooded ${holdoutManifest.images.filter((i) => i.label === "flooded").length}, ` +
      `dry ${holdoutManifest.images.filter((i) => i.label === "dry").length}, ` +
      `invalid ${holdoutManifest.images.filter((i) => i.label === "invalid").length})`,
  );
  if (LIMIT) console.log(`--limit ${LIMIT}: smoke mode`);

  const t1 = makeT1Strategies({ ai: invoker });
  const t4 = makeT4ColorLinesStrategy();
  const t2 = makeT2DetrRulesStrategy({ ai: invoker });
  const hybrid = makeHybridWithStats({ precheck: t4, base: t1[T1_MOONDREAM] });

  const entries = holdoutManifest.images.slice(0, LIMIT ?? undefined);

  async function runLive(name: string, strategy: (b: ArrayBuffer) => Promise<any>): Promise<BakeoffRun> {
    console.log(`→ running ${name} …`);
    const results: ScoredResult[] = await mapPool(entries, CONCURRENCY, async (entry) => {
      try {
        const buf = readFileSync(join(DATA_DIR, entry.path));
        const classification = await strategy(
          buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer,
        );
        return { path: entry.path, label: entry.label, classification };
      } catch {
        return { path: entry.path, label: entry.label, classification: FAIL_SAFE };
      }
    });
    const score = scoreResults(results);
    return { name, results, score, passed: passesBar(score) };
  }

  const runs: BakeoffRun[] = [];
  runs.push(await runLive("t1-moondream", t1[T1_MOONDREAM]));
  runs.push(await runLive("t1-llama4scout", t1[T1_LLAMA4SCOUT]));
  runs.push(await runLive("t2-detr-rules", t2));
  runs.push(await runLive("t4-color-lines", t4));

  // t7-consensus in documented degraded form (2 voters; no local OpenRouter key)
  runs.push(await runLive("t7-consensus(2v)", makeConsensusStrategy([t1[T1_MOONDREAM], t1[T1_LLAMA4SCOUT]])));
  // t10-hybrid: CV gate → moondream
  const hybridRun = await runLive("t10-hybrid", hybrid.strategy);
  runs.push(hybridRun);
  console.log(
    `   hybrid stats: precheck_refused=${hybrid.stats.precheck_refused} base_called=${hybrid.stats.base_called}`,
  );

  // t8-temporal under documented simulation: pseudo-sequences of 3 same-class holdout frames (sorted by path), last frame scored
  console.log("→ running t8-temporal (simulated sequences) …");
  const byLabel = new Map<string, typeof entries>();
  for (const e of entries) {
    const arr = byLabel.get(e.label) ?? [];
    arr.push(e);
    byLabel.set(e.label, arr);
  }
  const seqResults: ScoredResult[] = [];
  for (const [, arr] of byLabel) {
    const sorted = [...arr].sort((a, b) => a.path.localeCompare(b.path));
    for (let i = 0; i + 3 <= sorted.length; i += 3) {
      const trio = sorted.slice(i, i + 3);
      try {
        const bufs = trio.map((e) => {
          const buf = readFileSync(join(DATA_DIR, e.path));
          return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
        });
        const seq = await classifySequence(t1[T1_MOONDREAM], bufs);
        seqResults.push({
          path: trio[2].path,
          label: trio[2].label,
          classification: seq[seq.length - 1],
        });
      } catch {
        seqResults.push({ path: trio[2].path, label: trio[2].label, classification: FAIL_SAFE });
      }
    }
  }
  const t8Score = scoreResults(seqResults);
  runs.push({ name: "t8-temporal(sim-seq)", results: seqResults, score: t8Score, passed: passesBar(t8Score) });

  // NOT RUN rows — honest blockers
  const notRun: Array<[string, string]> = [
    ["t1-openrouter", "NO_KEY: no OPENROUTER_API_KEY available in this environment"],
    ["t6-knn(real-embedder)", "NOT_RUN: @xenova/transformers not installed here; use scripts/embed-knn.ts where model download is possible"],
    ["t3-finetuned", "NOT_TRAINED: torch/torchvision absent in this environment; training/train.py ready to run where GPU/torch exists"],
    ["t9-active-learn", "CURVE_ONLY: simulated curve over injected results; see module docs"],
  ];

  // ---- leaderboard ----
  const fmt = (x: number | undefined) => (x === undefined ? "  — " : `${(x * 100).toFixed(1)}%`);
  console.log("\n================ LIVE LEADERBOARD (hold-out) ================");
  console.log("name                  | n  | autoPass | badSlip | flooded | dry  | invalid | verdict");
  for (const r of [...runs].sort((a, b) => Number(b.passed) - Number(a.passed))) {
    console.log(
      `${r.name.padEnd(21)} | ${String(r.results.length).padStart(2)} | ` +
        `${fmt(r.score.goodAutoPass).padStart(8)} | ${fmt(r.score.badSlipThrough).padStart(7)} | ` +
        `${fmt(r.score.perClassAccuracy?.flooded).padStart(7)} | ${fmt(r.score.perClassAccuracy?.dry).padStart(4)} | ` +
        `${fmt(r.score.perClassAccuracy?.invalid).padStart(7)} | ${r.passed ? "PASS" : "FAIL"}`,
    );
  }
  for (const [name, reason] of notRun) {
    console.log(`${name.padEnd(21)} |  — | NOT RUN — ${reason}`);
  }

  writeFileSync(
    join(DATA_DIR, "bakeoff-results.json"),
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        scope: "hold-out split",
        runs: runs.map((r) => ({
          name: r.name,
          n: r.score.n,
          goodAutoPass: r.score.goodAutoPass,
          badSlipThrough: r.score.badSlipThrough,
          perClassAccuracy: r.score.perClassAccuracy,
          passed: r.passed,
        })),
        not_run: notRun,
      },
      null,
      2,
    ),
  );
  console.log("\nresults saved to data/labeled-pipes/bakeoff-results.json");
}

main().catch((e) => {
  console.error("FATAL:", e instanceof Error ? e.message : e);
  process.exit(1);
});
