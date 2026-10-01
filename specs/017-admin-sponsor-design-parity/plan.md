# Implementation Plan: Admin + Sponsor Web Console Design Parity

**Branch**: `dev/017-planning-r1` | **Date**: 2026-10-01 | **Spec**: `specs/017-admin-sponsor-design-parity/spec.md`
**Route**: milestone · **Grill**: complete (`.super-speckit/grills/017-admin-sponsor-design-parity/spec-grill.md`)

## Summary

Restyle the Next.js admin (9 screens) and sponsor (4 screens) surfaces in `frontend/` to
the landed Claude Design artifacts under the seven gate-approved tension resolutions:
Map C alias tokens, restyle-existing + 8 enumerated new components, `/admin/charts` shell
with 6 chart types deferred, route-driven shells kept, desktop-exact ≥1024px + drawer
<1024px, existing logo pipeline with the wind-farm PNG as a designer gap, and the approved
hex criterion (zero non-artifact inlined hex in parity scope). No `src/` change; no
behaviour change (spec R-024).

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19, Next.js 16 (static export) in
`frontend/`; Cloudflare Workers + Hono in `src/` (untouched by this feature).
**Primary Dependencies**: next ^16.3.2, react 19.2.8, tailwindcss ^4 (via
@tailwindcss/postcss), @playwright/test ^1.62.1, vitest ^4.1.11 + testing-library
(frontend); no icon library is installed today (relevant to the 8-component plan, O-2).
**Storage**: none added. Existing D1/R2/KV behind `/api/*` (data wiring untouched, R-025).
**Testing**: two pyramids — frontend `vitest` (Tier-1 `readFileSync`+regex suites per
`feedback-loop.md`), `@playwright/test` (Tier-2 computed CSS); backend `bun test
tests/unit/ tests/integration/` must stay 914/0 + 73 pass (R-032). Bare repo-wide
`bun test` is forbidden (cannot parse `.tsx` — HANDOFF §5).
**Target Platform**: desktop browsers ≥1024px (parity-exact) + drawer below 1024px
(tension 1(b)); deployed at `https://netzero-frontend.poom-a1d.workers.dev`.
**Constraints**: presentation-only (R-024); jsdom computed-style parity tests banned
(HANDOFF lesson 1); design decision must be `decided` before implementation
(super-speckit.yml `design.require_decision_before_implementation`).

## Constitution Check

- **Principle VIII (design tokens / neumorphic / responsive sponsor sidebar)** —
  **deviation, documented per tension 0(c)**: artifacts mandate a cool-grey ramp and a
  fixed 232px rail. Two deviations recorded in spec "Documented deviations"; the hybrid
  drawer (R-003) is the approved answer for responsiveness. Amendment explicitly out of
  scope. No other principle conflict found in this pass.
- **Protected paths** (`auth/**`, `payments/**`, `migrations/**`, `infra/**`,
  `.github/workflows/**`, env/secret globs): untouched — all work is `frontend/` + docs.
- **Design gate**: `design.required_when_paths` includes `**/*.tsx` → design-first stage
  (brief + prototype + `decision.json` status `decided`) precedes any implementation task.

## Plan-time derivation — the 8 missing components (T3(b))

> **Provenance: derived 2026-10-01 from landed artifacts — the approved summary asserted
> the count but never enumerated it** (HANDOFF-AGENT-017-WEB-CONSOLE-PARITY-2026-09-30.md:73;
> purpose-map row 3d marks this as a plan-time derivation item). This section is that
> derivation, recorded at plan time as the gate requires.

**Derivation rule.** The artifact design system = 15 components in GAP B
(`admin-design-spec.md:919-1023`, module `c0d425a3`) plus the brand element GradientRule
(`admin-design-spec.md:609-611`; `sponsor-design-spec.md:284`, module `9a78bbdb`).
A component is **missing** iff `frontend/src/components/` contains **no file implementing
its geometry**. Native inline elements (`<input type="checkbox">`, `<select>`,
`<textarea>`) and page-local functions (`TrustBadge`, `farmers/page.tsx:260`;
`ProgressBars`, `sponsor/page.tsx:209`) are screen content to restyle, not shared
components — tension 3(b)'s restyle list is explicitly the four existing component dirs.

**The 8 — add under `frontend/src/components/` (spec R-008/R-009):**

| # | Component | Artifact source (geometry) | In-repo cross-check (verified 2026-10-01) | Needed by |
|---|---|---|---|---|
| 1 | **Badge** | `core/Badge.jsx` — `admin-design-spec.md:941-953` (5 tones, 24px pill, 6×6 dot) | no badge file; page-local `TrustBadge` (`app/admin/farmers/page.tsx:260`) has different semantics and is not shared | AD-OV work cards, AD-REV queue, SP-OV hero + certificate status |
| 2 | **Tag** | `core/Tag.jsx` — `admin-design-spec.md:954-966` (5 tones, 28px bordered pill, `0.02em`) | zero matches for a Tag component in `frontend/src` | AD-FAR sponsor tags, SP-REPORT XLSX/DOCX format tags |
| 3 | **DataTable** | `data/DataTable.jsx` — `admin-design-spec.md:982-985` (dense 8/11px paddings, `grey-50` th, `navy-50` hover, tabular-nums, `onRowClick`) | no table component anywhere (only a comment at `app/sponsor/areas/page.tsx:113`) | AD-OV, AD-REV, AD-FAR, AD-APP, AD-REPORT, AD-SETTINGS, AD-CHART (GHG), SP-AREA, SP-REPORT |
| 4 | **FilterBar** | `data/FilterBar.jsx` — `admin-design-spec.md:986-989` (148px labelled select boxes, active `border-accent`, actions slot) | `admin-review/filter-tabs.tsx` is tab-style — different geometry, not a counterpart | AD-FAR, AD-APP, AD-CHART shell, SP-OV |
| 5 | **ProgressBar** | `data/ProgressBar.jsx` — `admin-design-spec.md:994-999` (132px label, 9px track, 5 fills) | only page-local `ProgressBars` (`app/sponsor/page.tsx:209`), not shared | AD-REPORT T-VER panel (3 bars), SP-OV season section, SP-REPORT |
| 6 | **Checkbox** | `forms/Checkbox.jsx` — `admin-design-spec.md:1000-1003` (20px box, radius-xs 4px, `teal-600` on-state, 0.55 disabled) | native inputs inline only (`app/admin/page.tsx`, `app/admin/farmers/page.tsx`) | AD-REV reasons, AD-SPONSOR province/visibility, AD-SETTINGS matrix, SP-AUTH remember |
| 7 | **Field** | `forms/Field.jsx` — `admin-design-spec.md:1004-1007` (label + required asterisk + error + hint wrapper) | labels are inline in `components/auth/login-form.tsx`; no shared wrapper | every form: AD-AUTH, SP-AUTH, AD-FAR drawer, AD-APP detail |
| 8 | **GradientRule** | brand element — `admin-design-spec.md:609-611` + `sponsor-design-spec.md:284` (`components/brand/GradientRule.jsx`) | no counterpart; geometry = `--gradient-rule` (`linear-gradient(90deg,#52ECCA,#028E91,#061E5C)`) | AD-AUTH hero (120px), SP-AUTH hero, SP-OV CreditHero, `width="100%" thickness={2}` |

**Exclusions (so the count reconciles to 15+1):**

| Artifact component | Why not in the add-list |
|---|---|
| Button | exists — `components/ui/button.tsx` (restyle, R-007) |
| Input | exists — `components/ui/input.tsx` (restyle, R-007) |
| StatTile | exists — `components/sponsor/kpi-card.tsx` is the KPI-tile counterpart (restyle) |
| Logo | tension 6(b): existing logo pipeline (inline brand asset in login pages + sidebar); binary unrecoverable, not a new shared component |
| Icon / IconButton | artifact Icon renders a `window.lucide` sprite that is **not recoverable** (HANDOFF §10.4); repo has no icon dependency. IconButton is literally a Button render (`admin-design-spec.md:971-981`). Icons ship via the existing inline-SVG strategy inside restyled components; dependency choice = open point O-2 (design-first) |
| Select / Textarea | artifact geometry is Input geometry + (`appearance:none`+chevron) or `rows:5` — implemented as restyled native elements inside screens and inside added Field/FilterBar wrappers; if a standalone need emerges, a thin `ui/` wrapper may be added without altering this derivation (they are Input-geometry derivatives, not new geometry) |

**Hex-token enforcement mechanism (spec R-006/R-029).** Tier-1 suite
`frontend/src/components/__tests__/literal-freedom.test.ts` walks the six parity-scoped
directories with `readFileSync` and applies the two regex blocks from
`feedback-loop.md:149-169` — `HEX_RAW` (3-8 digit hex outside `var()`/`url()`) and
`TW_ARB` (`bg-[#…|text-[#…|border-[#…|ring-[#…|from-[#…|to-[#…|via-[#…|shadow-[#…`).
Failures name file + line + value. Approved criterion implementation: a failing match is
downgraded to an **allowlisted artifact token value** only if the literal is in the
artifact token value set (e.g. `#52ECCA` → `--teal-300`) *and* appears in the matrix with
its exemption row; anything else fails. Token landings are asserted by the T1-COL family
against `globals.css` (Map C aliases). Mutation-proofing: adding one raw hex back must
turn the suite red (`feedback-loop.md:616-628`); the sidebar/bg-token break-checks at
`:645-669` are included. jsdom computed-style tests are prohibited (HANDOFF lesson 1);
computed values belong to Tier-2 Playwright only.

**Component addition path.** New components live beside the existing ones under
`frontend/src/components/` (`ui/` for shared primitives; brand element GradientRule in
`ui/` too — no `brand/` duplication of a parallel tree). Naming: kebab-case files
(`data-table.tsx`, `filter-bar.tsx`, `progress-bar.tsx`, …), named exports, typed props.
**No `ds/` tree** (tension 3(b)); no component contains raw hex (R-006) — utilities +
CSS-variable tokens only, with the R-006 allowlist as the only escape hatch. Each new
component lands with a unit test asserting artifact geometry via the Tier-1 technique
(structure/classes in source), not jsdom cascade assertions.

**Drawer/rail responsive implementation notes (R-003).** One boundary only: `lg`/`min-width:
1024px` = fixed 232px sticky rail (`gridTemplateColumns: 232px minmax(0,1fr)` equivalent);
`<1024px` = 28px-equivalent hamburger in the header + overlay drawer with the same nav
data. The drawer is rendered from the *same* nav source as the rail (single source of
truth, so SP-AREA's divider semantics in R-002 hold in both modes); it must trap focus,
close on Escape/backdrop, and return focus to the hamburger (WCAG 2.2 AA baseline).
No intermediate breakpoints; no bottom-nav reuse from the farmer surface. Tier-2 asserts
the 1024/1023 pair.

**Charts shell data contract (R-015).** `/admin/charts` ships static: PageTitle + FilterBar
+ layout geometry. **No fetch, no props plumbing, no API call** — the 6 deferred chart
types (Gauge, Donut, CreditChart, BarSeries, Treemap, Bubbles) have no agreed data shape
in evidence (grill E4/I11), so the shell must not invent one. Deferred chart bodies render
as explicitly-labelled placeholder frames (same treatment on AD-OV/SP-OV CreditChart
sections — grill E5). The GHG DataTable on that screen is table content and ships (R-015).

**Asset-gap handling (`renewables-wind-farm.png`) (R-027).** The artifact references
`../../assets/imagery/renewables-wind-farm.png` at 18% opacity on both login left panels
(`sponsor-design-spec.md:448-453,925`). The binary is not recoverable. Implementation:
render the brand panel with `--gradient-deep` background only (the documented reversible
alternative — layout fidelity unaffected, image is decorative at 18%); **do not** fabricate
a placeholder PNG, do not hotlink external imagery, do not commit random art. Record one
designer-gap row in the release matrix covering: wind-farm PNG, logo binaries (existing
pipeline supplies current logos in the meantime), lucide sprite. If the designer later
supplies the PNG, it drops into `frontend/public/` + a one-line `<img>` addition — a
self-contained follow-up.

## Project Structure

```text
specs/017-admin-sponsor-design-parity/
├── spec.md                 # this feature's requirements (R-001…R-033)
├── plan.md                 # this file
├── tasks.md                # maker/checker task graph
├── GATE-PENDING.md         # kit-state matrix pointer until release matrix replaces it
├── admin-design-spec.md    # landed evidence (do not edit)
├── admin-artifact.json     # landed evidence (do not edit)
├── sponsor-design-spec.md  # landed evidence (do not edit)
├── sponsor-artifact.json   # landed evidence (do not edit)
└── feedback-loop.md        # T1/T2 test designs (do not edit)

frontend/src/
├── app/globals.css                      # Map C alias tokens (R-005)
├── app/admin/{login,page,evidence,farmers,charts,applications,reports,sponsors,settings}/
├── app/sponsor/{login,page,areas,reports}/
├── components/ui/                       # + badge, tag, data-table, filter-bar, progress-bar, checkbox, field, gradient-rule
├── components/dashboard/                # restyled shell/sidebar/header (+drawer mode)
├── components/sponsor/                  # restyled kpi-card etc.
├── components/admin-review/             # restyled into AD-REV structure
└── components/__tests__/                # literal-freedom + token + component tests
```

## Implementation phases (contract; tasks.md is the executable form)

- **Phase 0 — design-first**: brief + prototype + `decision.json` → `decided` (config
  requires it before any UI code; resolves O-2 icon strategy).
- **Phase 1 — tokens + tests first (TDD)**: Map C aliases in `globals.css`; Tier-1
  literal-freedom suite lands RED against the 17-occurrence baseline, then drives the
  restyle (R-005/R-006/R-029).
- **Phase 2 — shared components**: 8 additions (table above) + restyled
  button/input/kpi-card/dashboard trio (R-007…R-010).
- **Phase 3 — slice A (admin)**: AD-AUTH → AD-OV → AD-REV → AD-FAR → AD-APP → AD-REPORT →
  AD-SPONSOR → AD-SETTINGS → AD-CHART shell (R-011…R-019).
- **Phase 4 — slice B (sponsor)**: SP-AUTH → SP-OV → SP-AREA → SP-REPORT (R-020…R-023).
- **Phase 5 — drawer + responsive pair**: <1024px drawer both shells (R-003).
- **Phase 6 — Tier-2 + gates**: Playwright computed-CSS suite (R-030); stale-test
  resolution (R-031); full gate run (R-032); independent checker at pinned candidate SHA;
  release matrix + human visual sign-off (R-033, merge policy below).

## Open points (carried, not blockers)

- **O-1** Chart data contracts — deferred with the 6 chart types (follow-on feature).
- **O-2** Icon strategy — inline-SVG subset of lucide open-source paths vs adding
  `lucide-react`; decided at design-first. Neither invents the unrecoverable sprite.
- **O-3** Deployed `_redirects` proxy existence (HANDOFF §10.1) — if absent, API-backed
  screens render empty states in QA: record as environment finding, never code around it.
- **O-4** Config discrepancy `merge_requires_human: false` (yml) vs HANDOFF §7.8 (true) —
  this cycle treats merge as human-required regardless; config edit is out of scope here.
- **O-5** Matrix pointer — kit state still points at `GATE-PENDING.md`; repoint to the
  release-stage verification matrix at candidate time (no CLI for matrix re-pointing
  exists; hand-maintain matching the 013 schema, per HANDOFF §7 note).
- **O-6** (checker flag, 2026-10-01): Shared Component Inventory (admin-design-spec.md ~:500, module
  c0d425a3) lists PageTitle and Section — no counterpart files under frontend/src/components/,
  neither enumerated in the 8 (R-008/GAP-B derivation) nor excluded. The approved count of 8
  (HANDOFF:73) is preserved via the GAP-B arithmetic (16 sections + GradientRule − 8 exclusions = 8);
  resolve at design-first (Phase 0 / T-000) whether PageTitle and Section are (a) page-local inline
  patterns (like TrustBadge), (b) derivatives of existing primitives (Card/SectionHeading family),
  or (c) genuine additions beyond the approved 8 — the third outcome requires user/Chief sign-off
  since it contradicts the approved count. Tasks T-309/T-402/R-015/R-021/R-022 reference them and
  must not proceed to implementation before O-6 is resolved.

## Merge policy

`super-speckit.yml` `merge.required_gate_status: pass` + `require_ocr_triage_complete` +
`require_no_open_confirmed_bugs`; distinct maker/checker; **human approves the merge**
(HANDOFF §9 + cycle authorization; see O-4). Automated checks prove computed styles, not
that it looks right — human visual sign-off is a release requirement.
