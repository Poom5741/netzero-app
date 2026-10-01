# Feature Specification: Admin + Sponsor Web Console Design Parity

**Feature ID**: 017-admin-sponsor-design-parity
**Status**: planned
**Umbrella purpose**: `.super-speckit/purpose/017-admin-sponsor-design-parity/purpose-map.md`
(human-confirmed 2026-10-01, card tap by THE USER (Poom5741); transcribed in `decision.json`)
**Design evidence (landed, verified 12/14 MATCH on 2026-10-01)**:
`admin-design-spec.md` (1052 ln) · `admin-artifact.json` (2173 ln) · `sponsor-design-spec.md`
(1001 ln) · `sponsor-artifact.json` (1723 ln) · `feedback-loop.md` (760 ln) ·
`GATE-PENDING.md` · `HANDOFF-AGENT-017-WEB-CONSOLE-PARITY-2026-09-30.md` (repo root)

## Why

The admin console (9 screens) and sponsor portal (4 screens) were designed in client
Claude Design artifacts and fully decoded into the landed evidence files above. The live
Next.js frontend (`frontend/`, deployed at `https://netzero-frontend.poom-a1d.workers.dev`,
HTTP 200 verified 2026-09-30) still renders a pre-artifact design language: a 2026-era
palette, wrong shell geometry, and screens that are partial or structurally different
(GAP C: 2 routes structurally close, 4 with major structure missing, 2 minimal, 1 with no
route at all — `admin-design-spec.md:1048-1052`). Operators see the mismatch daily.

The purpose gate approved all seven tension resolutions on record
(`GATE-PENDING.md:38-43`, `purpose-map.md` "approved resolutions" table). This spec encodes
exactly those resolutions — it adds no new scope and re-opens no tension.

## Scope

### In scope — `frontend/` only
- Admin shell + 9 admin screens: AD-AUTH, AD-OV, AD-REV, AD-FAR, AD-CHART, AD-APP,
  AD-REPORT, AD-SPONSOR, AD-SETTINGS (tension 2 resolution (b), slice A).
- Sponsor shell + 4 sponsor screens: SP-AUTH, SP-OV, SP-AREA, SP-REPORT (slice B).
- Restyle of existing components under `frontend/src/components/{ui,dashboard,sponsor,admin-review}/`
  plus 8 missing shared components (tension 3 resolution (b); the 8 are enumerated at plan
  time in `plan.md` — the gate asserted the count, never the list).
- Map C alias tokens in `frontend/src/app/globals.css` (decided in `feedback-loop.md:717-742`).
- New route `/admin/charts` shipping as a shell (tension 4 resolution (b)).
- Nav styling on the existing route-driven Next.js layouts (tension 5 resolution (b)).
- Existing logo pipeline for brand marks (tension 6 resolution (b)).
- Tier-1 literal-freedom tests + Tier-2 Playwright computed-style tests per
  `feedback-loop.md` (75 Tier-1 + 18 Tier-2 test designs).

### Out of scope — non-goals
- **Worker HTML**: `src/routes/` admin/sponsor templates are unreachable over HTTP —
  `src/index.ts` registers 302 redirects at `:382`/`:387` BEFORE `adminRoutes`/`sponsorRoutes`
  mount at `:404`/`:407`; Hono matches in order (`GATE-PENDING.md`; HANDOFF §1). No `src/` change.
- **The 6 chart types**: Gauge, Donut, CreditChart, BarSeries, Treemap, Bubbles — deferred
  (tension 4 (b)). Host sections render explicitly-labelled deferred placeholders.
- **A parallel `ds/` component tree** (tension 3 (b) explicitly rejects it).
- **Invented binary assets**: logo files, `renewables-wind-farm.png`, the Lucide icon sprite
  are referenced by the artifacts but not recoverable (HANDOFF §10.4).
- **Constitution amendment** (tension 0 (c): document the two deviations, amend nothing).
- **013 artifacts**: the R-901 `superseded` annotation stays blocked until the 013 matrix
  lands locally; GATE-PENDING.md deletion is deferred (purpose-map "Blocked items").
- **LINE surfaces** (farmer bot/LIFF — Principle IV governs those; this feature is operator
  web dashboards), backend APIs, auth logic, database writes.
- **Data-source swap**: the artifacts' sample rows and MockNotes are documentation, not a
  fixture to implement. Live API wiring is kept as-is (R-025).

## Documented deviations (tension 0, resolution (c) — amend nothing)

1. **Neumorphic cards white-on-gray**: Constitution Principle VIII mandates neumorphic white
   cards on `#f0f4f8`; the artifacts mandate a cool-grey ramp (`--surface-sunken: #F2F2F2`
   vs current `--color-surface: #f0f4f8` — different values, flagged in
   `feedback-loop.md:733-736`). Deviation: artifacts win inside admin/sponsor parity scope;
   the token conflict is recorded, never silently resolved.
2. **Sidebar responsiveness**: Constitution requires a responsive sponsor sidebar; artifacts
   fix a 232px rail with no mobile breakpoint (admin-design-spec.md:907, 915).
   Deviation + resolution: tension 1 (b) — desktop exact at ≥1024px; hamburger + drawer
   below 1024px (R-003). This hybrid is the documented deviation, scoped to admin+sponsor.

## Requirements

### Shell & navigation

**R-001 — Admin shell keeps its route-driven layout and adopts artifact nav geometry.**
`frontend/src/app/admin/layout.tsx` continues using `DashboardShell` + `usePathname`
(no state-driven rewrite — tension 5 (b)). Sidebar: 232px rail, `rgb(6, 30, 92)`
(`--navy-900`), sticky, 100vh; nav items restyled to artifact labels/icons
(admin-design-spec.md:1042; HANDOFF §9 DoD).

**R-002 — Sponsor shell mirrors the same rail with the sponsor NAV definition.**
Nav entries exactly: ภาพรวม (divider) · เครดิตและพื้นที่ · รายแปลงในพื้นที่ · เอกสาร (divider,
label-only — intentional, not a missing screen) · รายงานและใบรับรอง
(sponsor-design-spec.md §5, NAV + divider render branch).

**R-003 — Responsive collapse below 1024px.**
≥1024px: fixed 232px rail (desktop-exact). <1024px: hamburger button + overlay drawer
carrying the same nav, keyboard-operable and focus-managed (WCAG 2.2 AA baseline,
super-speckit.yml `design.accessibility_baseline`). Viewport boundary behaviour is
asserted at 1024px (rail) and 1023px (drawer) in Tier-2 tests.

**R-004 — No Worker-side shell.**
`src/routes/` admin/sponsor HTML stays untouched; the 302-redirect topology is asserted
by a Tier-1 read-only test (presence of the redirects in `src/index.ts`) so no future edit
"restores" the unreachable Worker HTML by mistake.

### Tokens & the hex rule

**R-005 — Map C alias tokens land in `globals.css`.**
Artifact ramp tokens (`--navy-*`, `--teal-*`, `--grey-*`, plus control/status/gradient
families) are added as aliases alongside existing semantic tokens; no existing
`--color-*` utility is renamed (Map A rejected). 186 admin tokens / 180 sponsor tokens,
currently 0 present in `globals.css` (GATE-PENDING "Key facts"; feedback-loop.md:717-742).
The `--color-surface` vs `--surface-sunken` conflict is recorded as a tension-0 deviation
row, not silently remapped.

**R-006 — Zero non-artifact inlined hex in parity scope (approved criterion, Q4).**
Scope: the six parity directories (`frontend/src/app/admin`, `frontend/src/app/sponsor`,
`frontend/src/components/ui`, `frontend/src/components/dashboard`,
`frontend/src/components/sponsor`, `frontend/src/components/admin-review`).
Baseline: 17 inlined hex occurrences across 8 files (13 Tailwind arbitrary values +
4 inline `style` props; feedback-loop.md:131-175). Criterion: after implementation, every
remaining raw-hex literal must be an artifact token value (e.g. `#52ECCA` = `--teal-300`,
4 baseline occurrences) and each must be listed with its matrix row; all others migrate to
tokens. Enforcement mechanism is specified in `plan.md` (Tier-1 `readFileSync` + regex,
patterns `HEX_RAW`/`TW_ARB` from feedback-loop.md:149-169; jsdom computed-style parity
tests are banned — HANDOFF lesson 1).

### Shared components

**R-007 — Existing components are restyled, not replaced.**
`ui/button.tsx`, `ui/input.tsx`, `sponsor/kpi-card.tsx` (= artifact StatTile) and the rest
of the four existing component dirs keep their props/APIs and adopt artifact geometry —
Button: 36/46/54px heights, 999px pill radius, primary/secondary/outline/ghost/onDark
variants (admin-design-spec.md:909-940; HANDOFF §9).

**R-008 — The 8 missing artifact components are added.**
Badge, Tag, DataTable, FilterBar, ProgressBar, Checkbox, Field, GradientRule — enumerated
with citations and the derivation rule in `plan.md` §"Plan-time derivation" (count approved
at gate; list derived 2026-10-01). Each implements the geometry of its artifact chunk in
GAP B (admin-design-spec.md:919-1023, 605-611).

**R-009 — Components land in the existing tree.**
New components go under `frontend/src/components/` following current conventions; no
parallel `ds/` tree (tension 3 (b)).

**R-010 — Icons without invented assets.**
The artifact's `window.lucide` sprite is not recoverable; icons ship via the existing
inline-SVG strategy inside restyled components (IconButton is a Button render,
admin-design-spec.md:971-981). Any icon-library dependency decision belongs to
design-first, not to this spec (open point in `plan.md`).

### Admin screens (slice A)

**R-011 — AD-AUTH LoginScreen** (`frontend/src/app/admin/login/page.tsx`): two-column
split `1.05fr .95fr` — left gradient-deep brand panel (Logo, "Admin Console" eyebrow,
Thai headline, GradientRule 120px, copy, footer), right white form (email + password +
OTP, remember checkbox, CTA, audit note) (admin-design-spec.md:268-291; admin variant of
the shared login token table, sponsor-design-spec.md:504-511).

**R-012 — AD-OV OverviewScreen** (`frontend/src/app/admin/page.tsx`): KPI StatTile row,
Work Queue cards, GHG-source DataTable (6×5), Province DataTable with `onRowClick` →
AD-FAR. The artifact's CreditChart section renders as a deferred-chart placeholder frame
(R-015 deferral) (admin-design-spec.md:293-320, 1033).

**R-013 — AD-REV ReviewScreen** (`frontend/src/app/admin/evidence/page.tsx`): dense
DataTable queue (รหัสภาพ/CPA/แปลง/รอบ/น้ำ/พิกัด/อายุ/ผล), completeness DataTable, photo
viewer (4/3 aspect, pipe SVG overlay, GPS badge), metadata panel, approve/reject flow with
reason checkboxes + textarea (admin-design-spec.md:321-348, 1034). Existing
`admin-review/*` components restyled into this structure.

**R-014 — AD-FAR FarmersScreen** (`frontend/src/app/admin/farmers/page.tsx`): 11-column
DataTable (CPA mono, name, area, sponsor Tag, plots/rai/photos/BE/PE/ER/Badge), นำเข้าเป็นชุด
+ ส่งออกราย CPA code outline actions, and the 760px slide-over drawer (gradient header,
5 tabs: แปลง/calc/N/photo/audit) (admin-design-spec.md:349-370, 681-696, 1035).

**R-015 — AD-CHART ChartsScreen ships as a shell** at the new route
`frontend/src/app/admin/charts/page.tsx`: PageTitle + FilterBar + layout geometry. The 6
SVG chart types (Gauge, Donut, CreditChart, BarSeries, Treemap, Bubbles) render as
explicitly-labelled deferred placeholders. The GHG DataTable section (table content, not a
chart) ships (admin-design-spec.md:371-394, 697-711, 1036, 1041; GATE-PENDING.md:42).

**R-016 — AD-APP ApplicationsScreen** (`frontend/src/app/admin/applications/page.tsx`):
two-column split — application DataTable + detail panel (metadata list + approval
checklist). Existing tab + approve/reject behaviour and live API data are preserved
(admin-design-spec.md:395-411, 1037; R-025).

**R-017 — AD-REPORT ReportsScreen** (`frontend/src/app/admin/reports/page.tsx`):
report DataTable + T-VER submission panel with 3 ProgressBars and download buttons
(admin-design-spec.md:412-426, 1038).

**R-018 — AD-SPONSOR SponsorsScreen** (`frontend/src/app/admin/sponsors/page.tsx`):
section per sponsor with province-area checkboxes + visibility-level checkboxes + stats
header (admin-design-spec.md:427-439, 1039).

**R-019 — AD-SETTINGS SettingsScreen** (`frontend/src/app/admin/settings/page.tsx`):
permissions matrix table (15 rows × 5 role columns) replacing the Record-checkbox grid;
two constants DataTables (Group A / Group B); notifications as a toggle-row list (6 items)
(admin-design-spec.md:440-456, 712-727, 1040).

### Sponsor screens (slice B)

**R-020 — SP-AUTH Login** (`frontend/src/app/sponsor/login/page.tsx`): same split-panel
geometry as AD-AUTH with the sponsor token variants (eyebrow "Sponsor Portal", Thai
headline/copy, `esg@company-a.example`, sponsor sub copy). Wind-farm background is the
documented designer gap (R-027) (sponsor-design-spec.md:444-511).

**R-021 — SP-OV SponsorOverview** (`frontend/src/app/sponsor/page.tsx`): PageTitle +
FilterBar + PdpaNote; hero grid (CreditHero gradient card with Badge + GradientRule,
2 StatTiles); lower grid (CreditChart section as deferred-chart placeholder + GHG
breakdown + season ProgressBars `showBaseline=false`); 4 outcome KPIs
(sponsor-design-spec.md:488-556, 990-998).

**R-022 — SP-AREA SponsorAreas** (`frontend/src/app/sponsor/areas/page.tsx`): PdpaNote +
one `pad=false` Section per province (title + stats sub) each with a 7-column DataTable
(cpa mono 12px, plot mono 11.5px, rai right 2dp, rice, 4 photo pills 24×18px radius 3px,
sfw mono with ⚠ fallback, ER right 3dp) + 4-column photo gallery section
(sponsor-design-spec.md:557-602).

**R-023 — SP-REPORT SponsorReports** (`frontend/src/app/sponsor/reports/page.tsx`):
available-reports DataTable (name+note, `<Tag tone="teal">` format, scope, right-aligned
outline download Button) + issued-certificates DataTable (id, season, tCO₂eq right,
status Badge, issued date) (sponsor-design-spec.md:603-640).

### Behaviour, data, and content

**R-024 — No behavioural regression.** Presentation-only plus the one new frontend route:
no API contract, auth flow, session-gate, state-machine, or database change. The diff to
`frontend/src/lib/` must be nil or token-only; `src/` untouched except nothing.

**R-025 — Data sources unchanged.** Screens keep their existing live API wiring
(`frontend/src/lib/api.ts` relative paths). Artifact sample rows / MockNotes are design
documentation. Tier-2 tests assert computed CSS, never API-backed values (HANDOFF §4).

**R-026 — Session gates preserved.** `useAdminSessionGate` and the sponsor equivalent keep
guarding their route trees; the parity restyle must not alter their render/redirect
contracts.

**R-027 — Asset gaps are recorded, never invented.** Logos via the existing logo pipeline
(tension 6 (b)); `renewables-wind-farm.png` (sponsor-design-spec.md:925) renders as the
documented reversible alternative — `--gradient-deep` background without the image — and
is tracked as a designer-gap row in the release matrix. No placeholder PNG is fabricated.

**R-028 — Thai content is verbatim from the artifacts**, including the SP-AREA "เอกสาร"
divider semantics (R-002) and all screen copy; `lang="th"` stays on the document root
(verified live 2026-09-30, HANDOFF §4).

### QA and gates

**R-029 — Tier-1 tests green.** Token-definition tests (T1-COL-01…54 family) and
literal-freedom tests (regex blocks of feedback-loop.md:149-169) pass under the R-006
criterion; the suite breaks if one raw hex is re-added (mutation checks,
feedback-loop.md:616-669).

**R-030 — Tier-2 Playwright green.** Computed-style assertions per the 18 Tier-2 designs
in feedback-loop.md; desktop viewport + drawer viewport pair (1024px rail / 1023px
drawer); no API-backed value assertions (R-025). Configured gate command: `npx playwright test`.

**R-031 — The 4 stale tests are deleted or rewritten against the artifact** — never
re-added as dead CSS (button.test.tsx ×3, live-calc.test.tsx ×1; GATE-PENDING "Key
facts"; HANDOFF §5).

**R-032 — Baselines hold.** `bun test tests/unit/` → 914 pass / 0 fail;
`bun test tests/integration/` → 73 pass; `cd frontend && npx vitest run` green after
R-031; `npx tsc --noEmit` clean; `npx eslint .` 0 errors; frontend production build
(static export) green. Bare repo-wide `bun test` is forbidden (cannot parse .tsx —
HANDOFF §5).

**R-033 — Design decision precedes implementation.** super-speckit.yml sets
`design.required_when_paths: **/*.tsx` and `require_decision_before_implementation: true`;
the design-first decision artifact must be status `decided` before any UI code (HANDOFF
§7 stage 4). Human visual sign-off remains a release-stage requirement — automated checks
prove computed styles, not that it looks right (HANDOFF §9).

## Success criteria

1. Every AD-*/SP-* screen has a route rendering its artifact-specified sections; AD-CHART
   ships as a shell with deferred chart placeholders (HANDOFF §9 DoD).
2. Zero non-artifact inlined hex literals in the six parity-scoped directories (R-006);
   each residual artifact-token literal appears in the matrix with its exemption.
3. Tier-1 + Tier-2 suites green (R-029/R-030); the 4 stale tests resolved (R-031).
4. Backend suites unchanged: 914 unit / 73 integration, 0 fail; frontend typecheck, lint,
   and build green (R-032).
5. Design decision artifact `decided` before implementation; maker/checker distinct;
   merge only after `required_gate_status: pass` with human approval per cycle rule.
6. Release summary labels every matrix row `verified` / `not-verified` / `not-applicable`
   with an evidence path; missing environment access is an explicit unverified, never a
   pass (HANDOFF §9).

## Verification

- Matrix: `specs/017-admin-sponsor-design-parity/GATE-PENDING.md` (kit state pointer until
  the release-stage verification matrix, modelled on `specs/013-farmer-chat-design-parity.md`,
  replaces it at candidate time).
- Grill: `.super-speckit/grills/017-admin-sponsor-design-parity/spec-grill.md` (local-only;
  `.super-speckit/` is gitignored per Q5 decision).
- Feedback loop: `specs/017-admin-sponsor-design-parity/feedback-loop.md` (75 T1 + 18 T2).
- Plan (incl. the 8-component derivation): `specs/017-admin-sponsor-design-parity/plan.md`.
- Tasks: `specs/017-admin-sponsor-design-parity/tasks.md`.
- Atlas/change story: `.super-speckit/atlas/` (local-only, docs-only).
