# Release Matrix — 017-admin-sponsor-design-parity

**Status**: SKELETON (created 2026-10-01 at implementation start; rows flip to
`verified` / `not-applicable` with evidence paths at candidate time per tasks.md T-605).
**Replaces**: `GATE-PENDING.md` (kit-state matrix pointer until this file; deletion
authorized by THE USER (Poom5741) "implement it" 2026-10-01T04:43:50Z, relayed by Chief —
GATE-PENDING.md self-instructed post-confirmation).
**Schema**: modelled on `specs/013-farmer-chat-design-parity.md`.
**Requirement source**: `specs/017-admin-sponsor-design-parity/spec.md` (R-001…R-033).

## Requirement rows

| ID | Requirement (short) | Status | Evidence |
|---|---|---|---|
| R-001 | Admin shell route-driven + artifact nav geometry (232px rail rgb(6,30,92)) | not-verified | pending T-211 |
| R-002 | Sponsor shell same rail, sponsor NAV + เอกสาร divider semantics | not-verified | pending T-211/T-4xx |
| R-003 | ≥1024px rail / <1024px focus-managed drawer, 1024/1023 Tier-2 pair | not-verified | pending T-501/T-601 |
| R-004 | No Worker-side shell; redirect topology asserted read-only | not-verified | pending T-502 |
| R-005 | Map C alias tokens in globals.css; no --color-* rename; deviation row recorded | not-verified | pending T-101 |
| R-006 | Zero non-artifact inlined hex in six parity dirs; artifact-token allowlist matrix-referenced | not-verified | pending T-102 |
| R-007 | Existing components restyled not replaced (button/input/kpi-card/dashboard trio) | not-verified | pending T-209/T-210 |
| R-008 | The 8 missing artifact components added (Badge, Tag, DataTable, FilterBar, ProgressBar, Checkbox, Field, GradientRule) | not-verified | pending T-201…T-208 |
| R-009 | Components land in existing tree; no ds/ parallel tree | not-verified | pending T-201…T-208 |
| R-010 | Icons without invented assets (inline-SVG strategy; no sprite fabrication) | not-verified | pending design-first O-2 + T-2xx |
| R-011 | AD-AUTH split-panel login (admin variant) | not-verified | pending T-301 |
| R-012 | AD-OV KPI tiles, work queue, GHG + province DataTables, deferred CreditChart frame | not-verified | pending T-302 |
| R-013 | AD-REV queue + completeness tables, photo viewer, approve/reject flow | not-verified | pending T-303 |
| R-014 | AD-FAR 11-col table, import/export, 760px drawer (5 tabs) | not-verified | pending T-304 |
| R-015 | AD-CHART shell at new route; 6 deferred placeholders; GHG table ships; zero fetches | not-verified | pending T-309 |
| R-016 | AD-APP two-column split; live API preserved | not-verified | pending T-305 |
| R-017 | AD-REPORT report table + T-VER panel (3 ProgressBars) | not-verified | pending T-306 |
| R-018 | AD-SPONSOR per-sponsor sections (province + visibility checkboxes) | not-verified | pending T-307 |
| R-019 | AD-SETTINGS 15×5 permissions matrix, 2 constants tables, 6 toggles | not-verified | pending T-308 |
| R-020 | SP-AUTH sponsor token variants; gradient-deep panel, no wind-farm img | not-verified | pending T-401 |
| R-021 | SP-OV PageTitle + FilterBar + CreditHero + StatTiles + deferred chart + ProgressBars + KPIs | not-verified | pending T-402 |
| R-022 | SP-AREA pad=false per-province Sections, 7-col table, photo gallery | not-verified | pending T-403 |
| R-023 | SP-REPORT reports + certificates DataTables | not-verified | pending T-404 |
| R-024 | No behavioural regression; lib/ nil or token-only; src/ untouched | not-verified | pending T-603 diff review |
| R-025 | Data sources unchanged; no API-value assertions in tests | not-verified | pending T-305/T-601 |
| R-026 | Session gates preserved (admin + sponsor) | not-verified | pending T-603 diff review |
| R-027 | Asset gaps recorded never invented (--gradient-deep alternative; designer-gap rows below) | not-verified | pending T-401 + gap rows |
| R-028 | Thai content verbatim; lang="th" preserved | not-verified | pending T-310/T-405 |
| R-029 | Tier-1 suites green (tokens + literal-freedom + mutation checks) | not-verified | pending T-102/T-103 |
| R-030 | Tier-2 Playwright green (computed CSS, 1024/1023 pair) | not-verified | pending T-601 |
| R-031 | 4 stale tests deleted or rewritten against artifact | not-verified | pending T-209/T-210 |
| R-032 | Baselines hold (914/0 unit, 73 integration, vitest, tsc, eslint, build) | not-verified | pending T-602 |
| R-033 | Design decision `decided` before implementation; human visual sign-off at release | pending → decision recorded at design-first (this date); visual sign-off = HUMAN gate, open | design decision artifact + T-606 |

## Designer-gap rows (never invented; tracked until designer supplies)

| Asset | Status | Handling |
|---|---|---|
| renewables-wind-farm.png (login imagery, 18% opacity) | designer-gap | --gradient-deep background only (documented reversible alternative); no placeholder fabricated (R-027) |
| Logo binaries (horizontal/mark × tones) | designer-gap | existing logo pipeline supplies current marks (tension 6(b)) |
| Lucide icon sprite (window.lucide bundle) | designer-gap | unrecoverable (HANDOFF §10.4); icons via vendored inline-SVG lucide-derived path subset per O-2 decision |

## Residual artifact-token hex allowlist (populated at candidate time)

Per approved Q4 criterion: any raw hex remaining in parity scope must be an artifact token
value AND carry its matrix row here. Baseline context: 17 occurrences across 8 files,
4 = #52ECCA (--teal-300). This table is filled when T-102's suite goes green.

| File | Literal | Token | Matrix row |
|---|---|---|---|
| (none yet — parity scope still at baseline) | — | — | — |
