## research
Sources consulted before code, with relevance:
- `src/sponsor/dashboard.ts` (getSponsorSummary L395-470, areaFilter L360-377, getSponsorFarmers L472-516) — the defect site; farmers count lacks the plot join every other surface has.
- `src/routes/sponsor.ts` L258-278 — CSV emission reads `summary.totalFarmers`; field order/first-line contract observed.
- `frontend/src/app/sponsor/page.tsx` L95-135, L289-299 — filter options derive from scoped `/sponsor` response; fallback demo data explains the r2 sighting.
- `tests/verification/staging-e2e-2026-10-05.md` r5 appendix — defect first evidenced; semantic-mismatch flag for owner.
- `docs/handoff/STAGING-HANDOFF-clients-2026-10-02.md` — deploy practice (BUILD_ID records candidate; backend redeploy preserves LINE webhook).
No unfamiliar external APIs involved; no web research required (local evidence settles the boundary).
