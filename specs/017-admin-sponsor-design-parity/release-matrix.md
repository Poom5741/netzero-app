# Release Matrix — 017-admin-sponsor-design-parity

**Status**: FILLED AT CANDIDATE (2026-10-01, T-605) — candidate SHA
`d306214c57fa915c49942388ca9fa7be060d8ec3` (branch `dev/017-impl-r1`, 38 commits over base
`13bd602`). Rows flipped from the 2026-10-01 skeleton per tasks.md T-605.
**Replaces**: `GATE-PENDING.md` (deleted standalone commit `bfee655`; deletion authorized by
THE USER (Poom5741) "implement it" 2026-10-01T04:43:50Z, relayed by Chief).
**Schema**: modelled on `specs/013-farmer-chat-design-parity.md`.
**Requirement source**: `specs/017-admin-sponsor-design-parity/spec.md` (R-001…R-033).
**Evidence roots** (gitignored, on this machine):
`.super-speckit/qa/017-impl-r1-t000b-baseline/` (pre-implementation baseline) ·
`.super-speckit/qa/017-impl-r1-t102-red/` (literal-freedom RED proof) ·
`.super-speckit/qa/017-impl-r1-t602-full-gates/` (maker six-gate run) ·
`.super-speckit/qa/017-impl-r1-t601-playwright/` (Tier-2 log) ·
`.super-speckit/qa/017-impl-r1-t604-checker/` (INDEPENDENT checker report — verdict PASS,
10/10 sections re-derived).
`verified*` = requirement's substance holds; a disclosed delta is listed in the evidence
cell and consolidated in "Disclosed deltas" below — flagged for T-606 HUMAN review.

## Requirement rows

| ID | Requirement (short) | Status | Evidence |
|---|---|---|---|
| R-001 | Admin shell route-driven + artifact nav geometry (232px rail rgb(6,30,92)) | verified | T-211 `ffb0c44`; Tier-2 T2-SH rail assertions (computed CSS @1280×720); dashboard-shell tests; checker §G |
| R-002 | Sponsor shell same rail, sponsor NAV + เอกสาร divider semantics | verified* | slice-b-t405.test.ts assertions; delta: divider carried as documented comment + assertion, not a rendered nav row (เอกสาร is label-only, no screen; live nav = 3 routes) — for T-606 human review |
| R-003 | ≥1024px rail / <1024px focus-managed drawer, 1024/1023 Tier-2 pair | verified | T-501 `dbf60ee` (19 tests: trap/Escape/backdrop/focus-return/scroll-lock); Tier-2 1024/1023 handover live; single boundary (pre-existing 768px block removed); checker §I |
| R-004 | No Worker-side shell; redirect topology asserted read-only | verified | worker-redirect-guard.test.ts (`c85fd61`): 302s :382/:387 precede mounts :404/:407; `src/` diff empty (checker §A) |
| R-005 | Map C alias tokens in globals.css; no --color-* rename; deviation row recorded | verified | T-101 `f9aa1ba` (+107, 0 deletions); T1-COL 54 assertions; CORRECTED 2026-10-02: **33 ramp tokens (navy/teal/grey ×11) byte-exact vs both artifact HTMLs** (`design-artifacts/2026-09-28/admin-console.html` + `sponsor-portal.html`: 33 defs each, intersection 33, value-agree 33, css-exact 33); artifact JSONs hold usages only, no definitions — earlier "17 tokens" figure was the unrelated hex-baseline count; deviation rows at both definition sites |
| R-006 | Zero non-artifact inlined hex in six parity dirs; allowlist matrix-referenced | verified | literal-freedom suite GREEN (0 HEX_RAW + 0 TW_ARB); checker §D independent scan: 0 real residuals; all 17 §2.2 baseline occurrences migrated; allowlist table truthfully zero rows |
| R-007 | Existing components restyled not replaced (button/input/kpi-card/dashboard trio) | verified | T-209 `a911735`, T-210 `7d8d47a`, T-211 `ffb0c44`; APIs kept (additive: Button outline/onDark, KpiCard tone); Tier-2 T2-BTN computed geometry |
| R-008 | The 8 missing artifact components added | verified | T-201…T-208 (`ddf18c0`…`9f8a549`): badge, tag, data-table, filter-bar, progress-bar, checkbox, field, gradient-rule + 46 unit tests; checker spot-checks |
| R-009 | Components land in existing tree; no ds/ parallel tree | verified | all under frontend/src/components/ui/; scope diff (checker §A) shows no ds/ |
| R-010 | Icons without invented assets | verified | design decision O-2 (`13bd602`): inline-SVG strategy, no new dependency; lucide sprite = designer-gap row; IconButton = Button render (excluded per plan) |
| R-011 | AD-AUTH split-panel login (admin variant) | verified | T-301 `29e4835`; slice-a-t310-part1; Tier-2 login chrome; auth wiring byte-preserved |
| R-012 | AD-OV KPI tiles, work queue, GHG + province DataTables, deferred CreditChart frame | verified* | T-302 `75e55f9`; delta: GHG ships 2 live columns (live type has {source,value}); KPI labels kept live (artifact mocks would mislabel real data) |
| R-013 | AD-REV queue + completeness tables, photo viewer, approve/reject flow | verified | T-303 `a1c15b9`; slice-a-t310-part2; all review API paths preserved (verified/rejected/retake) |
| R-014 | AD-FAR 11-col table, import/export, 760px drawer (5 tabs) | verified* | T-304 `d9db12c`; delta: 5 live columns ship (artifact's 11 describe mock fields; live PlotSummary has 5); import/export rendered disabled (no invented handlers) |
| R-015 | AD-CHART shell at new route; 6 deferred placeholders; GHG table ships; zero fetches | verified | T-309 `526589a`; live getGhgSources wired; part4 assertions (8 DeferredChartFrame call sites, 6 type labels); Tier-2 static chrome |
| R-016 | AD-APP two-column split; live API preserved | verified | T-305 `b312860`; fetchApplications/approve/reject verbatim; part3 |
| R-017 | AD-REPORT report table + T-VER panel (3 ProgressBars) | verified* | T-306 `119ff9a`; delta: T-VER downloads rendered locked (no live file mapping); photos bar empty (no computable source) — artifact gives 71/88 numbers only |
| R-018 | AD-SPONSOR per-sponsor sections (province + visibility checkboxes) | verified* | T-307 `88d7630`; delta: visibility-level options = labelled DEFERRED placeholder (no enumeration anywhere in landed evidence; inventing Thai labels would violate R-028) |
| R-019 | AD-SETTINGS 15×5 permissions matrix, 2 constants tables, 6 toggles | verified* | T-308 `832f2d2`; delta: matrix binds live records only where keys match (5/15 rows), other 10 render '-' with footnote (no invented permission semantics); Group B = artifact calc fixture read-only |
| R-020 | SP-AUTH sponsor token variants; gradient-deep panel, no wind-farm img | verified | T-401 `dc21651`; last 2 hex migrated (R-006 complete); R-027 gradient-only |
| R-021 | SP-OV PageTitle + FilterBar + CreditHero + StatTiles + deferred chart + ProgressBars + KPIs | verified | T-402 `0eda014`; slice-b-t405; season bars 2/season showBaseline=false |
| R-022 | SP-AREA pad=false per-province Sections, 7-col table, photo gallery | verified* | T-403 `7c5c967`; delta: rice/sfw columns omitted (no live PlotSummary field), disclosed in-file |
| R-023 | SP-REPORT reports + certificates DataTables | verified* | T-404 `181fed8`; delta: format Tag shows CSV (live download truth) vs artifact sample XLSX |
| R-024 | No behavioural regression; lib/ nil or token-only; src/ untouched | verified | checker §A: 56 files, 0 non-frontend paths, +8102/−1709; lib/ untouched |
| R-025 | Data sources unchanged; no API-value assertions in tests | verified | per-page preserved-wiring lists in maker reports; Tier-2 asserts chrome only (render-enabler session mock pattern, no values); checker §G/§H |
| R-026 | Session gates preserved (admin + sponsor) | verified | useAdminSessionGate/sponsor gate untouched (not in diff); all auth tests green (checker §C: zero regressions) |
| R-027 | Asset gaps recorded never invented | verified | wind-farm: gradient-only + in-code comment documenting gap (checker §H note); logos: existing pipeline; no placeholder fabricated |
| R-028 | Thai content verbatim; lang="th" preserved | verified | slice tier-1 assertions (65+ assertions); checker §H: 16+ verified artifact-anchored incl. Thai |
| R-029 | Tier-1 suites green (tokens + literal-freedom + mutation checks) | verified | vitest 372/372 incl. 66 token/mutation + 4 slice part files; checker §B re-run |
| R-030 | Tier-2 Playwright green (computed CSS, 1024/1023 pair) | verified* | T-601 `d306214`: 22 passed / 0 failed / 12 EXPLICIT named skips (reasons independently spot-verified genuine by checker §G); unverified designs listed below — never a silent pass |
| R-031 | 4 stale tests deleted or rewritten against artifact | verified | button ×3 rewritten to GAP B tones (8→16 tests), live-calc ×1 rewritten to artifact card chrome; all green (checker §C verbose rerun) |
| R-032 | Baselines hold (914/0 unit, 73 integration, vitest, tsc, eslint, build) | verified | maker six-gate run (t602-full-gates) + checker §B independent re-run: all six exit 0 |
| R-033 | Design decision `decided` before implementation; human visual sign-off at release | verified (gate) | decision.json DECIDED `13bd602` @04:52:28Z BEFORE any UI commit (f9aa1ba is next); visual sign-off = T-606 HUMAN — SIGNED `2026-10-01T22:46:29Z` (chat, verbatim in Verification chain); merge approval still pending, never autonomous |

## Designer-gap rows (never invented; remain open until designer supplies)

| Asset | Status | Handling |
|---|---|---|
| renewables-wind-farm.png (login imagery, 18% opacity) | designer-gap OPEN | --gradient-deep background only (documented reversible alternative); R-027 honored; if supplied: drop into frontend/public/ + one-line img |
| Logo binaries (horizontal/mark × tones) | designer-gap OPEN | existing logo pipeline supplies current marks (tension 6(b)) |
| Lucide icon sprite (window.lucide bundle) | designer-gap OPEN | unrecoverable (HANDOFF §10.4); icons via existing inline-SVG strategy per O-2 decision (no new dependency) |

## Residual artifact-token hex allowlist

**Zero residual rows** — all 17 baseline occurrences (feedback-loop §2.2: 8 files, 4 ×
#52ECCA) were migrated to tokens. Independently verified by checker §D (own scanner:
0 real hex in the six parity dirs). This table is intentionally empty; the criterion
remains enforced by the literal-freedom suite (any future raw hex turns it RED unless
allowlisted here with its matrix row).

| File | Literal | Token | Matrix row |
|---|---|---|---|
| (none — scope is hex-clean) | — | — | — |

## Disclosed deltas (consolidated — for T-606 HUMAN review)

1. R-002: เอกสาร divider documented (comment + assertion), not a rendered nav row.
2. R-012: GHG table 2 live columns (live type), KPI labels live.
3. R-014: farmers table 5 live columns vs artifact 11; import/export disabled.
4. R-017: T-VER downloads locked; photos bar empty.
5. R-018: sponsor visibility checkboxes = labelled DEFERRED placeholder.
6. R-019: settings matrix binds live keys on 5/15 rows, '-' + footnote elsewhere.
7. R-022: SP-AREA rice/sfw columns omitted (no live field).
8. R-023: format Tag shows CSV (live) vs artifact sample XLSX.
9. R-030: 12 Tier-2 designs explicitly skipped (named + reasons): T2-SH-03 (rail has width,
   no max-width property), T2-BTN-03/04 (no static md/lg instances), T2-BTN-06 (post-save
   state needs API), T2-TILE-01..04 (stat-tile data-only, no testid in DOM), T2-PB-01..03
   (bars data-backed only), GHG headers (renders only with rows).
10. Landed-chrome notes (not drift, pinned by tests): rail is `fixed` (T-211 deviation);
    sm Button used-height = 44px `.touch-target` WCAG floor over the 36px token;
    outline border rides --border-default.

## Verification chain

Landing verify (12/14, 2026-10-01) → purpose gate (user card tap ~02:19Z, decision.json
03:13:56Z) → planning cycle (checker PASS) → implementation T-000…T-605 (maker runs, this
branch) → T-604 INDEPENDENT CHECKER: **VERDICT PASS** (10/10 sections; report:
`.super-speckit/qa/017-impl-r1-t604-checker/checker-report.md`). **2026-10-02 LOCAL
SELF-HEAL** (`017-selfheal-local`, on a fresh clone machine): all six T-602 gates + Tier-2
chromium re-run GREEN (914/0 · 73/0 after host repoint `16151b3` · 372/372 · tsc/eslint/build 0 ·
22/0/12); §A scope + §D hex + §E tokens re-derived (33/33 byte-exact; matrix R-005 figure
corrected 17→33). Report: `.super-speckit/qa/017-selfheal-local/report.md`.
**T-606 VISUAL SIGN-OFF RECEIVED**: THE USER (Poom5741), `2026-10-01T22:46:29Z`, chat verbatim
"sure i signoff that design", against review surface `localhost:3100/{admin,sponsor}` at
`000d6b5` (isolated worktree, all gates green).
**T-606 MERGE APPROVED**: THE USER (Poom5741), `2026-10-01T22:49:11Z`, chose "Merge to main +
push" over {push branch + PR only, hold local}. Pre-merge audit (skill
safe-push-to-github-multi-agent-repo): main unmoved (0 behind), 51 commits 0 scaffolding,
1 deletion (`GATE-PENDING.md`, user-authorized), 0 strict secret-pattern hits, fast-forward
merge = merged tree identical to the fully-gated tree. **T-606 CLOSED.**
