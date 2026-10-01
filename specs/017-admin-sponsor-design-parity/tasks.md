# Tasks — Admin + Sponsor Web Console Design Parity

**Spec**: `specs/017-admin-sponsor-design-parity/spec.md` (R-001…R-033)
**Plan**: `specs/017-admin-sponsor-design-parity/plan.md` (8-component derivation, hex
enforcement, drawer/charts/asset-gap notes, open points O-1…O-5)
**Feedback loop**: `specs/017-admin-sponsor-design-parity/feedback-loop.md` (75 T1 + 18 T2)
**Route**: milestone · **Roles**: maker `claude-maker` / checker `claude-checker`
(distinct per `super-speckit.yml` `require_distinct_maker_and_checker`)
**Merge**: human-approved only (`merge.required_gate_status: pass`; HANDOFF §9; plan O-4)

## Baseline (verified 2026-09-30, HANDOFF §5 — re-run before T-001)

```
cd frontend && npx vitest run     # 118 tests, 114 pass, 4 stale-fail
cd frontend && npx tsc --noEmit   # CLEAN
cd frontend && npx eslint .       # 0 errors, 17 warnings
bun test tests/unit/              # 914 pass / 0 fail
bun test tests/integration/       # 73 pass / 0 fail
```

The 4 stale failures are `button.test.tsx` ×3 (`claymorphic`, `neumorphic`,
`text-on-error`) + `live-calc.test.tsx` ×1 (`.neumorphic`). Delete or rewrite against the
artifact — never re-add dead CSS. → R-031.

## Phase 0 — Gate work (before any UI code)

- [x] **T-000** Run design-first: brief + prototype + `decision.json` status `decided`;
      resolve open point O-2 (icon strategy: inline-SVG lucide subset vs `lucide-react`
      dependency). Blocked on nothing; gates all implementation tasks. → R-033.
- [x] **T-000b** Record baseline outputs above verbatim into the run evidence folder
      `.super-speckit/qa/<run-id>/`. → R-032.

## Phase 1 — Tokens + Tier-1 suites (TDD red first)

- [x] **T-101** Land Map C alias tokens in `frontend/src/app/globals.css` (artifact ramp
      names as aliases; no `--color-*` rename; record the `--color-surface` vs
      `--surface-sunken` deviation row). → R-005.
- [x] **T-102** Add `frontend/src/components/__tests__/literal-freedom.test.ts` with the
      `HEX_RAW` + `TW_ARB` blocks (`feedback-loop.md:149-169`) over the six parity dirs +
      the R-006 allowlist rule (artifact-token values only, matrix-referenced). Confirm RED
      against the 17-occurrence baseline before fixing anything. → R-006, R-029.
- [x] **T-103** Add T1-COL token-definition assertions against `globals.css` (Map C names)
      and the mutation break-checks (`feedback-loop.md:616-669`). → R-029.

## Phase 2 — Shared components (8 additions + restyles)

- [x] **T-201** Add `ui/badge.tsx` (5 tones, 24px, dot). → R-008 (cites
      admin-design-spec.md:941-953).
- [x] **T-202** Add `ui/tag.tsx` (5 tones, 28px bordered pill). → R-008 (:954-966).
- [x] **T-203** Add `ui/data-table.tsx` (dense paddings, `grey-50` th, `navy-50` hover,
      tabular-nums, `onRowClick`, `dense` flag). → R-008 (:982-985).
- [x] **T-204** Add `ui/filter-bar.tsx` (148px labelled selects, active accent border,
      actions slot). → R-008 (:986-989).
- [x] **T-205** Add `ui/progress-bar.tsx` (132px label, 9px track, 5 fills). → R-008
      (:994-999).
- [x] **T-206** Add `ui/checkbox.tsx` (20px box, 4px radius, teal-600 on, 0.55 disabled).
      → R-008 (:1000-1003).
- [x] **T-207** Add `ui/field.tsx` (label + required asterisk + error + hint). → R-008
      (:1004-1007).
- [x] **T-208** Add `ui/gradient-rule.tsx` (`--gradient-rule`; width/thickness props). →
      R-008 (admin-design-spec.md:609-611; sponsor-design-spec.md:284).
- [x] **T-209** Restyle `ui/button.tsx` to artifact geometry (36/46/54px, 999px pill,
      primary/secondary/outline/ghost/onDark) + rewrite its stale tests against the
      artifact. → R-007, R-031.
- [x] **T-210** Restyle `ui/input.tsx` (+ stale-test sweep) and `sponsor/kpi-card.tsx`
      (StatTile geometry incl. tone="dark") + rewrite `live-calc` stale test. → R-007,
      R-031.
- [x] **T-211** Restyle `dashboard-{sidebar,header,shell}.tsx`: 232px sticky rail
      `rgb(6,30,92)`, artifact nav labels/icons; keep `usePathname` routing. → R-001,
      R-002.
- [x] **T-212** Every component file hex-clean under the R-006 rule; each unit test uses
      the Tier-1 technique (source + class assertions), never jsdom cascade. → R-006,
      R-009.

## Phase 3 — Slice A: admin screens

- [x] **T-301** AD-AUTH `app/admin/login/page.tsx` — split panel, admin variant copy,
      GradientRule 120px, 3 fields + remember checkbox + audit note. → R-011, R-028.
- [x] **T-302** AD-OV `app/admin/page.tsx` — KPI StatTiles, Work Queue, GHG DataTable,
      Province DataTable (row-click → farmers), CreditChart section = deferred
      placeholder. → R-012, R-015.
- [x] **T-303** AD-REV `app/admin/evidence/page.tsx` — queue + completeness DataTables,
      4/3 photo viewer + pipe overlay + GPS badge, metadata panel, approve/reject with
      reason Checkboxes + textarea; restyled admin-review components. → R-013.
- [x] **T-304** AD-FAR `app/admin/farmers/page.tsx` — 11-col DataTable, import/export
      actions, 760px slide-over drawer (gradient header, 5 tabs). → R-014.
- [x] **T-305** AD-APP `app/admin/applications/page.tsx` — 2-col split; live API data
      preserved; no fixture swap. → R-016, R-025.
- [x] **T-306** AD-REPORT `app/admin/reports/page.tsx` — report DataTable + T-VER panel
      (3 ProgressBars + downloads). → R-017.
- [x] **T-307** AD-SPONSOR `app/admin/sponsors/page.tsx` — per-sponsor sections with
      province + visibility Checkbox groups + stats header. → R-018.
- [x] **T-308** AD-SETTINGS `app/admin/settings/page.tsx` — 15×5 permissions matrix
      table, two constants DataTables, 6-row toggle list. → R-019.
- [x] **T-309** AD-CHART new `app/admin/charts/page.tsx` — shell only (PageTitle +
      FilterBar + layout); 6 deferred placeholders; GHG DataTable ships; zero fetches. →
      R-015, E4.
- [x] **T-310** Tier-1 assertions for slice A screens (strings verbatim incl. Thai, sizes,
      classes; hex-clean). → R-006, R-028, R-029.

## Phase 4 — Slice B: sponsor screens

- [x] **T-401** SP-AUTH `app/sponsor/login/page.tsx` — sponsor token variants;
      gradient-deep brand panel, no wind-farm `<img>` (gap row). → R-020, R-027.
- [x] **T-402** SP-OV `app/sponsor/page.tsx` — PageTitle + FilterBar + PdpaNote; CreditHero
      + Badge + GradientRule; 2 StatTiles; deferred CreditChart frame; GHG + season
      ProgressBars; outcome KPIs. → R-021, E5.
- [x] **T-403** SP-AREA `app/sponsor/areas/page.tsx` — per-province `pad=false` sections,
      7-col DataTable, photo pills, 4-col gallery. → R-022.
- [x] **T-404** SP-REPORT `app/sponsor/reports/page.tsx` — reports + certificates
      DataTables (Tag/Badge/outline Button). → R-023.
- [x] **T-405** Tier-1 assertions for slice B (as T-310). → R-006, R-028, R-029.

## Phase 5 — Responsive drawer (both shells)

- [x] **T-501** <1024px hamburger + overlay drawer from the same nav source; focus trap,
      Escape/backdrop close, focus return. No intermediate breakpoints. → R-003.
- [x] **T-502** Worker-redirect guard test: assert `src/index.ts:382,387` redirects exist
      (read-only) so the unreachable Worker HTML is never "restored". → R-004.

## Phase 6 — Tier-2, gates, independent QA, release

- [x] **T-601** Playwright Tier-2 suite per `feedback-loop.md` 18 designs; computed CSS
      only; desktop + 1024/1023 pair; no API-value assertions. → R-030, R-025.
- [x] **T-602** Maker full gate run (record verbatim): `bun test tests/unit/` (914/0);
      `bun test tests/integration/` (73); `cd frontend && npx vitest run`; `npx tsc
      --noEmit`; `npx eslint .` (0 errors); frontend build (static export). → R-031,
      R-032.
- [x] **T-603** Diff review: only `frontend/` + planning docs changed; `src/` diff empty
      except nothing; no protected paths touched; explicit-path commits only (never
      `git add -A`). → R-024, HANDOFF lesson 7.
- [x] **T-604** Checker (independent, fresh QA worktree at pinned candidate SHA): re-run
      T-602 gates; diff **failing test names** (not counts) against the clean baseline;
      re-observe computed styles; do not trust maker numbers. Record evidence under
      `.super-speckit/qa/<run-id>/`. → R-032.
- [x] **T-605** Release matrix modelled on `specs/013-farmer-chat-design-parity.md`: every
      R-0xx row `verified` / `not-verified` / `not-applicable` with evidence path; explicit
      designer-gap rows (wind-farm PNG, logo binaries, lucide sprite); repoint kit-state
      matrix (O-5). → R-033.
- [ ] **T-606** Human visual sign-off + human-approved merge; release summary with per-row
      verdicts. Milestone → run `reassess` for any follow-on slice (config
      `reassess_after_verified_milestone_slice`). → HANDOFF §9.

## Dependencies and ordering

T-000 gates everything. T-101→T-102→T-103 (tokens before suites). T-20x before all Phase
3/4 screen tasks. Slice A (T-3xx) and Slice B (T-4xx) are independent of each other; both
need T-203/T-204/T-205 (DataTable/FilterBar/ProgressBar) first. T-501 needs T-211/T-4xx
shells. T-601+ need a committed candidate SHA. T-604 requires T-602 evidence. T-605/T-606
close the milestone.

## Not in this slice

- The 6 chart implementations (Gauge, Donut, CreditChart, BarSeries, Treemap, Bubbles) —
  follow-on feature (O-1).
- Any `src/` change, API contract change, auth/session change, DB write.
- Constitution amendment; 013 artifact edits; GATE-PENDING.md deletion (deferred).
- Invented binary assets (wind-farm PNG, logo files, icon sprite) — designer-gap rows.
- `_redirects` deployment fix (O-3) — environment finding, reported not coded around.
