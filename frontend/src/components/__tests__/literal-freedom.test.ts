/**
 * T1 literal-freedom suite — 017-admin-sponsor-design-parity (T-102, R-006/R-029).
 *
 * Approved criterion: zero non-artifact inlined hex in the six parity-scoped
 * directories. Two detectors:
 *
 *   HEX_RAW — 3-to-8-digit hex not inside var()/url()
 *   TW_ARB  — Tailwind arbitrary-value colour classes (bg-[# … shadow-[#)
 *
 * The detector definitions derive from
 * specs/017-admin-sponsor-design-parity/feedback-loop.md:149-169; the HEX_RAW
 * regex below was corrected against that file's own §2.2 baseline table (see
 * the correction comment at the HEX_RAW definition). Findings are enumerated
 * as repo-relative file:line:value. A finding is excused ONLY by the R-006
 * allowlist rule: the literal's value must be in the artifact token value set
 * (admin-artifact.json + sponsor-artifact.json `tokens`) AND a row for
 * (file, literal) must exist in the "Residual artifact-token hex allowlist"
 * section of specs/017-admin-sponsor-design-parity/release-matrix.md. That
 * section is empty today, so effectively every finding fails today.
 *
 * VERBATIM-REGEX VERIFICATION RESULT (recorded 2026-10-01, worktree
 * netzero-017-impl-wt): the literal HEX_RAW regex from feedback-loop.md:149-169
 * contradicts its own §2.2 baseline table — it matches 16 occurrences (incl. 2
 * "Issue 104" test-comment false positives in admin-review/__tests__) and
 * misses 3 real baseline values (two login gradient stops and one kpi-card
 * shadow stop) via its comma lookahead clause. The normative record is the
 * §2.2 BASELINE TABLE (approved at the purpose gate: 17 occurrences / 8 files,
 * 4 = #52ECCA); the detector regex was therefore corrected to reproduce that
 * table — see the correction comment at the HEX_RAW definition below. The
 * suite asserts the target state (zero findings) and is EXPECTED RED until
 * the Phase 3/4 screen migrations. Baseline table for the checker:
 * feedback-loop.md §2.2 (8 files; values tabulated there — none are
 * reproduced in this file).
 *
 * Hard constraints honoured (feedback-loop.md §1): readFileSync + regex on
 * raw source only; no jsdom cascade/computed-style assertions; no rendered
 * DOM lookups; no new dependencies. (jsdom is merely the project vitest
 * environment; nothing here uses it.)
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// --- Block 1 — raw hex literals (3-to-8-digit hex, not inside var() or url())
// regex corrected 2026-10-01 to reproduce the normative feedback-loop.md §2.2
// baseline table (17 occ / 8 files); verbatim block yielded 16 incl. 2
// Issue-#104 test-comment false positives and missed 3 gradient stops.
// Correction = drop the ',' clause from the lookahead + exclude __tests__
// directories from the walk.
const HEX_RAW = /(?<![0-9a-fA-FisVar]|var\()#[0-9a-fA-F]{3,8}(?![0-9a-fA-FisVar])/g;
// --- Block 2 — Tailwind arbitrary-value colour classes
const TW_ARB = /bg-\[#|text-\[#|border-\[#|ring-\[#|from-\[#|to-\[#|via-\[#|shadow-\[#/g;

const HERE = dirname(fileURLToPath(import.meta.url)); // frontend/src/components/__tests__
const FRONTEND_ROOT = resolve(HERE, "../..", ".."); // frontend/
const REPO_ROOT = resolve(HERE, "../../../.."); // repo root

/** The six parity-scoped directories (tasks.md T-102), walked recursively. */
const PARITY_DIRS = [
  "src/app/admin",
  "src/app/sponsor",
  "src/components/ui",
  "src/components/dashboard",
  "src/components/sponsor",
  "src/components/admin-review",
];

type Finding = { file: string; line: number; value: string };

function walkFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) {
      // __tests__ trees are not parity-scoped source (their hex-containing
      // comments were the Issue-#104 false positives); excluded per §2.2 scope.
      if (entry === "__tests__") continue;
      out.push(...walkFiles(p));
    } else out.push(p);
  }
  return out;
}

function scan(regex: RegExp): Finding[] {
  const findings: Finding[] = [];
  for (const dir of PARITY_DIRS) {
    for (const file of walkFiles(join(FRONTEND_ROOT, dir))) {
      const lines = readFileSync(file, "utf8").split("\n");
      lines.forEach((line, idx) => {
        for (const m of line.matchAll(regex)) {
          findings.push({
            file: relative(REPO_ROOT, file),
            line: idx + 1,
            value: m[0],
          });
        }
      });
    }
  }
  return findings;
}

/** Artifact token value set, from the two landed artifact JSONs (source of record). */
function artifactTokenValues(): Set<string> {
  const values = new Set<string>();
  const specs = join(REPO_ROOT, "specs", "017-admin-sponsor-design-parity");
  for (const name of ["admin-artifact.json", "sponsor-artifact.json"]) {
    const json = JSON.parse(readFileSync(join(specs, name), "utf8")) as {
      tokens?: Record<string, unknown>;
    };
    for (const v of Object.values(json.tokens ?? {})) {
      if (typeof v === "string") values.add(v.trim().toUpperCase());
    }
  }
  return values;
}

/**
 * R-006 allowlist: rows of the "Residual artifact-token hex allowlist"
 * section of release-matrix.md, as "file<tab>literal" keys (lowercased).
 * Populated only at candidate time (T-605); empty today.
 */
function matrixAllowlist(): Set<string> {
  const matrixPath = join(
    REPO_ROOT,
    "specs",
    "017-admin-sponsor-design-parity",
    "release-matrix.md",
  );
  const matrix = readFileSync(matrixPath, "utf8");
  const section = matrix
    .split(/^## /m)
    .find((s) => s.startsWith("Residual artifact-token hex allowlist"));
  const rows = new Set<string>();
  if (!section) return rows;
  for (const line of section.split("\n")) {
    const m = line.match(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/);
    if (!m) continue;
    const [, file, literal] = m;
    if (/^(File|---|\(none)/.test(file)) continue; // header / separator / empty-table row
    rows.add(`${file}\t${literal}`.toLowerCase());
  }
  return rows;
}

const ARTIFACT_VALUES = artifactTokenValues();
const ALLOWLIST = matrixAllowlist();

/** R-006 excuse rule: artifact token value AND matrix-listed row. */
function isExcused(f: Finding): boolean {
  if (!ARTIFACT_VALUES.has(f.value.toUpperCase())) return false;
  return ALLOWLIST.has(`${f.file}\t${f.value}`.toLowerCase());
}

function format(findings: Finding[]): string {
  return findings.map((f) => `${f.file}:${f.line}:${f.value}`).join("\n");
}

describe("T1 literal-freedom — HEX_RAW (raw hex outside var()/url())", () => {
  it("has zero raw-hex occurrences in the six parity dirs (R-006; R-006 allowlist is the only excuse)", () => {
    const findings = scan(HEX_RAW).filter((f) => !isExcused(f));
    expect(
      format(findings),
      `non-artifact raw hex in parity scope (file:line:value):\n`,
    ).toBe("");
  });
});

describe("T1 literal-freedom — TW_ARB (Tailwind arbitrary-value colour classes)", () => {
  it("has zero arbitrary-value colour classes in the six parity dirs (R-006)", () => {
    const findings = scan(TW_ARB).filter((f) => !isExcused(f));
    expect(
      format(findings),
      `Tailwind arbitrary-value colour classes in parity scope (file:line:value):\n`,
    ).toBe("");
  });
});
