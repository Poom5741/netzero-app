/**
 * Leaderboard — renders the full comparison table.
 */
import type { PassBarVerdict } from "./passbar.js";

export interface LeaderboardRow {
  name: string;
  description: string;
  floodedPrecision: number;
  floodedRecall: number;
  dryPrecision: number;
  dryRecall: number;
  invalidPrecision: number;
  invalidRecall: number;
  autoPassRate: number;
  badSlipRate: number;
  latencyMs: number;
  costPer1000: number;
  verdict: PassBarVerdict;
}

export function renderLeaderboard(rows: LeaderboardRow[]): string {
  const sorted = [...rows].sort((a, b) => b.autoPassRate - a.autoPassRate);

  const header =
    "| Strategy | flooded P/R | dry P/R | invalid P/R | auto-pass | bad-slip | latency | cost/1000 | verdict |";
  const separator =
    "|----------|-------------|---------|-------------|-----------|----------|---------|-----------|---------|";

  const body = sorted
    .map((r) => {
      const fmt = (n: number) => (n * 100).toFixed(1) + "%";
      const pr = (p: number, rec: number) => `${fmt(p)}/${fmt(rec)}`;
      const v = r.verdict.passed ? "✅ PASS" : `❌ FAIL: ${r.verdict.reason}`;
      return `| ${r.name} | ${pr(r.floodedPrecision, r.floodedRecall)} | ${pr(r.dryPrecision, r.dryRecall)} | ${pr(r.invalidPrecision, r.invalidRecall)} | ${fmt(r.autoPassRate)} | ${fmt(r.badSlipRate)} | ${r.latencyMs}ms | $${r.costPer1000.toFixed(2)} | ${v} |`;
    })
    .join("\n");

  return [header, separator, body].join("\n");
}
