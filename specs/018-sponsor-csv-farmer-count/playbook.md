# Micro playbook — 018-sponsor-csv-farmer-count

Selected PStack method: `tdd` (vendor/pstack/skills/tdd/SKILL.md, sha256 eeb868e2…) — bounded fix with an obvious cheap unit-test target. Route: micro. One writer (omp-dev), independent checker (rakazo).

## Purpose (user instruction, 2026-10-13)
"Fix the 2 visible items first" — the two client-visible staging findings from Rakazo r2–r5 that remain unresolved: (1) EX-2042 CSV `จำนวนเกษตรกร` (2) disagrees with `/sponsor/farmers` list (1); (2) sponsor ภาพรวม province filter offered unassigned provinces. Goal: staging surfaces reconcile before the client's r6 round, on the way to production-ready without breaking client testing.

## Ordered steps
1. Investigation: read `getSponsorSummary`/`areaFilter`/`getSponsorFarmers` (`src/sponsor/dashboard.ts`), CSV emission (`src/routes/sponsor.ts:269`), FE filter options source (`frontend/src/app/sponsor/page.tsx:298`). Confirm root causes. *(completed — see investigation receipt)*
2. Register delivery (playbook-led knowledge-v2), receipts before maker work.
3. Write failing unit regression test for R-1 (MockDB pattern, `tests/unit/`), run it, confirm it fails for the intended reason.
4. Fix: make `totalFarmers` plot-scoped (`JOIN plots p ON p.farmer_id = f.id`) so it matches the farmers list; smallest change, no other query touched.
5. Rerun regression test + targeted sponsor unit suite; run configured type/lint checks.
6. Commit candidate (only this feature's files; the dirty `.super-speckit` upgrade tree stays untouched).
7. Independent QA: checker runs the matrix in a clean qa-clone against the exact candidate SHA.
8. Deploy backend staging (BUILD_ID = candidate SHA), live re-smoke R-1/R-2/R-3, record results in matrix + AGENTS.md, register shared-result.
9. Dispatch r6 independent round to Rakazo via `rakazo chat` (LINE client logged in on Rakazo's computer — include the J1 fresh-identity journey that was previously not runnable).

## Skip reasons / scope boundary
- R-2 needs no product change if live check confirms scoped options (D-5 fix already covered it) — record verified status with evidence instead.
- No FE code change planned; `frontend/` untouched unless live check contradicts R-2.
- Out of scope: production provisioning (separate track, needs owner authority), other parked cosmetics.
