import { FAIL_SAFE, type ClassifyPipePhoto } from "./classifier";
import type { PipeLabel } from "./bakeoff";

export type EmbeddingFn = (image: ArrayBuffer) => Promise<number[]>;

export const T6_KNN = "t6-knn";
export const T3_FINETUNED = "t3-finetuned";
export const T3_ENDPOINT_PATH = "/classify";
export const T3_STATUS = { trained: false, status: "NOT_TRAINED" } as const;

export function cosineDistance(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0 || a.some((x) => !Number.isFinite(x)) || b.some((x) => !Number.isFinite(x))) return 1;
  let dot = 0; let aa = 0; let bb = 0;
  for (let i = 0; i < a.length; i += 1) { dot += a[i]! * b[i]!; aa += a[i]! * a[i]!; bb += b[i]! * b[i]!; }
  if (aa === 0 || bb === 0) return 1;
  return 1 - dot / (Math.sqrt(aa) * Math.sqrt(bb));
}

const validLabel = (label: PipeLabel) => label === "flooded" || label === "dry";
const hash = (bytes: ArrayBuffer) => Array.from(new Uint8Array(bytes)).join(",");

export function makeKnnStrategy(options: {
  embed: EmbeddingFn;
  exemplarEntries: Array<{ path: string; label: PipeLabel }>;
  loadImage: (path: string) => Promise<ArrayBuffer>;
  k?: number;
}): ClassifyPipePhoto {
  const cache = new Map<string, number[]>();
  const k = Math.max(1, Math.floor(options.k ?? 3));
  return async (image) => {
    if (!options.exemplarEntries.length) return FAIL_SAFE;
    try {
      const embedCached = async (bytes: ArrayBuffer) => {
        const key = hash(bytes); const cached = cache.get(key);
        if (cached) return cached;
        const vector = await options.embed(bytes);
        if (!vector.length || vector.some((x) => !Number.isFinite(x))) throw new Error("invalid embedding");
        cache.set(key, vector); return vector;
      };
      const query = await embedCached(image);
      const rows: { label: PipeLabel; distance: number; index: number }[] = [];
      for (let i = 0; i < options.exemplarEntries.length; i += 1) {
        const entry = options.exemplarEntries[i]!;
        const vector = await embedCached(await options.loadImage(entry.path));
        if (vector.length !== query.length) return FAIL_SAFE;
        rows.push({ label: entry.label, distance: cosineDistance(query, vector), index: i });
      }
      rows.sort((a, b) => a.distance - b.distance || a.index - b.index);
      const nearest = rows.slice(0, Math.min(k, rows.length));
      const groups = new Map<PipeLabel, { votes: number; distance: number; index: number }>();
      for (const row of nearest) { const g = groups.get(row.label) ?? { votes: 0, distance: 0, index: row.index }; g.votes += 1; g.distance += row.distance; g.index = Math.min(g.index, row.index); groups.set(row.label, g); }
      const winner = [...groups.entries()].sort((a, b) => b[1].votes - a[1].votes || a[1].distance - b[1].distance || a[1].index - b[1].index)[0];
      if (!winner || !validLabel(winner[0])) return FAIL_SAFE;
      return { validity: "valid", water_state: winner[0], confidence: winner[1].votes / nearest.length, reason_th: "ตรวจสอบจากภาพตัวอย่าง" };
    } catch { return FAIL_SAFE; }
  };
}

export function makeHttpPredictStrategy(options: { url: string; fetchImpl?: (url: string, init?: Record<string, unknown>) => Promise<{ ok: boolean; status: number; text(): Promise<string> }> }): ClassifyPipePhoto {
  const fetcher = options.fetchImpl ?? (fetch as unknown as NonNullable<typeof options.fetchImpl>);
  return async (image) => {
    try {
      const binary = String.fromCharCode(...new Uint8Array(image));
      const response = await fetcher(options.url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image_base64: btoa(binary) }) });
      if (!response.ok) return FAIL_SAFE;
      const value: unknown = JSON.parse(await response.text());
      if (!value || typeof value !== "object") return FAIL_SAFE;
      const result = value as Record<string, unknown>;
      if (result.validity !== "valid" && result.validity !== "invalid") return FAIL_SAFE;
      if (result.water_state !== "flooded" && result.water_state !== "dry" && result.water_state !== "invalid") return FAIL_SAFE;
      if (typeof result.confidence !== "number" || typeof result.reason_th !== "string") return FAIL_SAFE;
      return { validity: result.validity, water_state: result.water_state, confidence: result.confidence, reason_th: result.reason_th };
    } catch { return FAIL_SAFE; }
  };
}
