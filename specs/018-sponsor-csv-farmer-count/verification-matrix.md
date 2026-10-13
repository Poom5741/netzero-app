# Verification matrix — 018-sponsor-csv-farmer-count

Candidate lineage: main@`6b0aa0e` (investigation base). Micro playbook: `playbook.md` (beside this matrix). Checker: `rakazo` (independent). Maker: `omp-dev`.

| ID | Requirement | Verification | Status | Evidence |
| --- | --- | --- | --- | --- |
| FR-1 | EX-2042 CSV `จำนวนเกษตรกร` counts farmers the same way the sponsor farmers list does (plot-scoped), so CSV, `/sponsor/summary`, and `/sponsor/farmers` reconcile | Unit regression test on `getSponsorSummary` with a plotless in-scope farmer (fails before fix, passes after) | pending | — |
| FR-2 | Sponsor ภาพรวม province filter offers only ทุกจังหวัด + assigned areas (สุพรรณบุรี) | Live browser check on staging against post-fix deploy | pending | r2/r4 finding was a D-5 symptom (401 → fallback demo data); PR #177 credentialed XHR already scoped it — verify live |
| FR-3 | No regression: EX-2042 first line, logout chain, ภาพรวม real data | Live re-smoke after deploy (same checks as 2026-10-13 pre-client smoke) | pending | baseline: `.super-speckit/qa/2026-10-13-pre-client-smoke/report.md` |
| FR-4 | Configured engineering checks pass on the candidate (type, lint, unit) | `bun run check:type`, `bun run check:lint`, targeted `bun test tests/unit/sponsor` in qa-clone by independent checker | pending | — |

Status vocabulary: pending / verified / not-verified / not-applicable (with reason).
