# TDD Feedback-Loop Design — 017-admin-sponsor-design-parity

> **Purpose**: Establish the red→green loop BEFORE any implementation. This document specifies
> every test to be written first, the commands to run them, and what each red test proves.
> It is a planning artifact — the tests are written by the maker from this spec.

---

## 1. Purpose and Constraints

### Why red-first
The Super-SpecKit protocol requires a failing test before the first line of implementation
code. The test encodes the acceptance criterion in a form that is mechanically executable.
The loop prevents two classes of failure:
- **Absence failure**: a required token/geometry/value was never implemented because no test
  demanded it.
- **Regression failure**: a subsequent change silently removes a correctly-implemented token.

### Hard constraint 1 — No computed style in jsdom
`frontend/vitest.config.mjs` sets `environment: "jsdom"`. `frontend/src/test/setup.ts` is
exactly one line (`import '@testing-library/jest-dom'`) and never injects `globals.css`.
Measured on 2026-09-29:
- `bg-blue-500` → `getComputedStyle(el).backgroundColor === "rgba(0, 0, 0, 0)"`
- `border border-red-500` → `getComputedStyle(el).border === "16px none rgb(0, 0, 0)"`
- Inline `style={{backgroundColor:"#061E5C"}}` → correctly returns `rgb(6, 30, 92)`

jsdom has no CSS cascade. Tier-1 (vitest) tests that assert computed styles on class-based
styling are fabrication generators. The ONLY mechanically honest Tier-1 assertion is
**string-search on the source file** — proving the token name appears in the source, not that
the browser paints it.

### Hard constraint 2 — No rendered-DOM lookups in Tier 1
Tier-1 runs with no server, no browser, no router, no React render. It reads raw source
files with `readFileSync` and applies regex/string assertions. Any test that calls
`render()`, `screen.getBy*()`, or `page.locator()` belongs in Tier 2 (Playwright) only.

---

## 2. The Red-First Test Inventory

### 2.1 T1 — Token-Definition Tests (`frontend/src/components/__tests__/admin-parity-tokens.test.ts`)

**Mechanism**: `readFileSync('frontend/src/app/globals.css', 'utf8')` + `regex.test(content)`
per token. Each test goes RED because the ramp is absent today.

**File under test**: `frontend/src/app/globals.css`
**Run command**: `cd frontend && npx vitest run src/components/__tests__/admin-parity-tokens.test.ts`
**Baseline**: 0 ramp tokens present → all 54 tests fail.

#### Colour-ramp tokens — from `admin-artifact.json` `tokens` key (lines 132–220)

| Test ID | Token | Artifact value | Regex (simplified) |
|---|---|---|---|
| T1-COL-01 | `--navy-50` | `#EEF2FB` | `--navy-50:\s*#[0-9A-Fa-f]+` |
| T1-COL-02 | `--navy-100` | `#D6E0F4` | `--navy-100:\s*#[0-9A-Fa-f]+` |
| T1-COL-03 | `--navy-200` | `#AEC2E8` | `--navy-200:\s*#[0-9A-Fa-f]+` |
| T1-COL-04 | `--navy-300` | `#7C9AD8` | `--navy-300:\s*#[0-9A-Fa-f]+` |
| T1-COL-05 | `--navy-400` | `#5279CB` | `--navy-400:\s*#[0-9A-Fa-f]+` |
| T1-COL-06 | `--navy-500` | `#2C5EB8` | `--navy-500:\s*#[0-9A-Fa-f]+` |
| T1-COL-07 | `--navy-600` | `#1C489F` | `--navy-600:\s*#[0-9A-Fa-f]+` |
| T1-COL-08 | `--navy-700` | `#123787` | `--navy-700:\s*#[0-9A-Fa-f]+` |
| T1-COL-09 | `--navy-800` | `#0B2A72` | `--navy-800:\s*#[0-9A-Fa-f]+` |
| T1-COL-10 | `--navy-900` | `#061E5C` | `--navy-900:\s*#[0-9A-Fa-f]+` |
| T1-COL-11 | `--navy-950` | `#030E2E` | `--navy-950:\s*#[0-9A-Fa-f]+` |
| T1-COL-12 | `--teal-50` | `#E7FCF7` | `--teal-50:\s*#[0-9A-Fa-f]+` |
| T1-COL-13 | `--teal-100` | `#C6F9EE` | `--teal-100:\s*#[0-9A-Fa-f]+` |
| T1-COL-14 | `--teal-200` | `#8FF3DE` | `--teal-200:\s*#[0-9A-Fa-f]+` |
| T1-COL-15 | `--teal-300` | `#52ECCA` | `--teal-300:\s*#[0-9A-Fa-f]+` |
| T1-COL-16 | `--teal-400` | `#24C4B2` | `--teal-400:\s*#[0-9A-Fa-f]+` |
| T1-COL-17 | `--teal-500` | `#0AA8A3` | `--teal-500:\s*#[0-9A-Fa-f]+` |
| T1-COL-18 | `--teal-600` | `#028E91` | `--teal-600:\s*#[0-9A-Fa-f]+` |
| T1-COL-19 | `--teal-700` | `#027276` | `--teal-700:\s*#[0-9A-Fa-f]+` |
| T1-COL-20 | `--teal-800` | `#01565F` | `--teal-800:\s*#[0-9A-Fa-f]+` |
| T1-COL-21 | `--teal-900` | `#013B45` | `--teal-900:\s*#[0-9A-Fa-f]+` |
| T1-COL-22 | `--teal-950` | `#012730` | `--teal-950:\s*#[0-9A-Fa-f]+` |
| T1-COL-23 | `--grey-50` | `#F2F2F2` | `--grey-50:\s*#[0-9A-Fa-f]+` |
| T1-COL-24 | `--grey-100` | `#EDEFF3` | `--grey-100:\s*#[0-9A-Fa-f]+` |
| T1-COL-25 | `--grey-200` | `#DDE1E8` | `--grey-200:\s*#[0-9A-Fa-f]+` |
| T1-COL-26 | `--grey-300` | `#C2C8D2` | `--grey-300:\s*#[0-9A-Fa-f]+` |
| T1-COL-27 | `--grey-400` | `#9AA3B2` | `--grey-400:\s*#[0-9A-Fa-f]+` |
| T1-COL-28 | `--grey-500` | `#737E91` | `--grey-500:\s*#[0-9A-Fa-f]+` |
| T1-COL-29 | `--grey-600` | `#566277` | `--grey-600:\s*#[0-9A-Fa-f]+` |
| T1-COL-30 | `--grey-700` | `#3C4A5C` | `--grey-700:\s*#[0-9A-Fa-f]+` |
| T1-COL-31 | `--grey-800` | `#273343` | `--grey-800:\s*#[0-9A-Fa-f]+` |
| T1-COL-32 | `--grey-900` | `#1B2330` | `--grey-900:\s*#[0-9A-Fa-f]+` |
| T1-COL-33 | `--grey-950` | `#141414` | `--grey-950:\s*#[0-9A-Fa-f]+` |

#### Semantic / NZC-alias tokens

| Test ID | Token | Artifact value | Notes |
|---|---|---|---|
| T1-COL-34 | `--nzc-navy` | `#061E5C` | = `--navy-900` |
| T1-COL-35 | `--nzc-teal` | `#028E91` | = `--teal-600` |
| T1-COL-36 | `--nzc-aqua` | `#43D8B8` | Not in ramp |
| T1-COL-37 | `--nzc-mint` | `#52ECCA` | = `--teal-300` |
| T1-COL-38 | `--nzc-off-white` | `#F2F2F2` | = `--grey-50` |
| T1-COL-39 | `--nzc-space-grey` | `#273343` | = `--grey-800` |
| T1-COL-40 | `--surface-inverse` | `#061E5C` | Sidebar bg |
| T1-COL-41 | `--surface-card` | `#FFFFFF` | Card bg |
| T1-COL-42 | `--surface-sunken` | `#F2F2F2` | Sunken bg |
| T1-COL-43 | `--text-heading` | `#061E5C` | Heading colour |
| T1-COL-44 | `--text-body` | `#273343` | Body colour |
| T1-COL-45 | `--text-muted` | `#566277` | Muted text |
| T1-COL-46 | `--text-accent` | `#028E91` | Accent text |
| T1-COL-47 | `--action-primary` | `#028E91` | Button primary bg |
| T1-COL-48 | `--action-primary-hover` | `#027276` | Button primary hover |
| T1-COL-49 | `--action-primary-active` | `#01565F` | Button primary active |
| T1-COL-50 | `--action-secondary` | `#061E5C` | Button secondary bg |
| T1-COL-51 | `--action-secondary-hover` | `#0B2A72` | Button secondary hover |
| T1-COL-52 | `--status-success` | `#0AA8A3` | Success tone |
| T1-COL-53 | `--status-danger` | `#C8464F` | Danger tone |
| T1-COL-54 | `--status-warning` | `#E2A33C` | Warning tone |

#### Control-dimension tokens

| Test ID | Token | Artifact value |
|---|---|---|
| T1-CTL-01 | `--control-height-sm` | `36px` |
| T1-CTL-02 | `--control-height-md` | `46px` |
| T1-CTL-03 | `--control-height-lg` | `54px` |
| T1-CTL-04 | `--radius-pill` | `999px` |
| T1-CTL-05 | `--focus-ring` | `0 0 0 3px rgba(10,168,163,.32)` |
| T1-CTL-06 | `--shadow-accent` | `0 12px 28px rgba(2,142,145,.24)` |
| T1-CTL-07 | `--gradient-deep` | `linear-gradient(150deg,#061E5C 0%,#0B2A72 45%,#027276 100%)` |
| T1-CTL-08 | `--gradient-rule` | `linear-gradient(90deg,#52ECCA 0%,#028E91 55%,#061E5C 100%)` |

**Total T1 token-definition tests: 62**

---

### 2.2 T1 — Literal-Freedom Tests (`frontend/src/components/__tests__/literal-freedom.test.ts`)

**Mechanism**: `readFileSync` on each parity-scoped file + regex for raw hex literals and
Tailwind arbitrary-value colour classes. Each test goes RED because the 17 baseline
occurrences exist today.

**Scope**: All files in the following directories, recursively:
- `frontend/src/components/ui/` (button.tsx, input.tsx, bottom-nav.tsx)
- `frontend/src/components/dashboard/` (dashboard-sidebar.tsx, dashboard-header.tsx)
- `frontend/src/app/admin/` (all page files and layout)
- `frontend/src/app/sponsor/` (all page files and layout)
- `frontend/src/components/sponsor/` (all components)

**Baseline count**: 17 inlined hex literal occurrences across 8 files (scope: the six directories `frontend/src/app/admin`, `frontend/src/app/sponsor`, `frontend/src/components/ui`, `frontend/src/components/dashboard`, `frontend/src/components/sponsor`, `frontend/src/components/admin-review`), verified by grep 2026-09-29.

**Exact regex patterns** (implemented as two `describe` blocks):

```typescript
// Block 1 — raw hex literals (3-to-8-digit hex, not inside var() or url())
const HEX_RAW = /(?<![0-9a-fA-FisVar]|var\()#[0-9a-fA-F]{3,8}(?![0-9a-fA-FisVar]|,)/g;
// Block 2 — Tailwind arbitrary-value colour classes
const TW_ARB = /bg-\[#|text-\[#|border-\[#|ring-\[#|from-\[#|to-\[#|via-\[#|shadow-\[#/g;
```

**Baseline occurrences (verified by grep 2026-09-29)**:

| File | Count | Values |
|---|---|---|
| `frontend/src/components/ui/button.tsx` | 4 | `#02A8AC`, `#028E91` (line 13: `from-[#02A8AC]`, `to-[#028E91]`); `#D95560`, `#C8464F` (line 15: `from-[#D95560]`, `to-[#C8464F]`) |
| `frontend/src/components/ui/input.tsx` | 1 | `#028E91` |
| `frontend/src/components/ui/bottom-nav.tsx` | 1 | `#028E91` |
| `frontend/src/components/dashboard/dashboard-sidebar.tsx` | 4 | `#061E5C` (×2), `#028E91` (×2) |
| `frontend/src/components/dashboard/dashboard-header.tsx` | 1 | `#028E91` |
| `frontend/src/app/admin/login/page.tsx` | 2 | `#52ECCA`, `#52ECCA` (inline style props) |
| `frontend/src/app/sponsor/login/page.tsx` | 2 | `#52ECCA`, `#52ECCA` (inline style props) |
| `frontend/src/components/sponsor/kpi-card.tsx` | 2 | `#D1D9E6`, `#FFFFFF` (line 39) |

**Structural breakdown**: 13 occurrences are Tailwind arbitrary values (patterns like
`bg-[#...]`, `ring-[#...]`, `from-[#...]`, `to-[#...]`, `shadow-[...]` containing a hex) and
4 occurrences are inline `style={{ … #52ECCA … }}` props in the two login pages. These two
classes have different remediation paths: Tailwind arbitrary values map to theme tokens
(`bg-inverse-surface` etc.), while inline style props must migrate to artifact tokens or
documented deviations.

**Exemption**: `#FFFFFF` is neutral — the artifact defines `--white: #FFFFFF` — and is
exempt from drift counting; the tracked set is the colour-bearing literals that are NOT
artifact token values.

**Why red first**: The target is zero. Each of these occurrences is a tokenisation gap.
Writing the test at baseline confirms it is non-zero and anchors the non-regression
commitment.

**Total T1 literal-freedom tests: 2** (one `describe` block per regex pattern, counting the
entire scope as one test file; sub-counts enumerate per-file baseline numbers).

---

### 2.3 T1 — Button Geometry-In-Source Tests (`frontend/src/components/__tests__/button-geometry.test.ts`)

**Mechanism**: `readFileSync('frontend/src/components/ui/button.tsx', 'utf8')` + string/regex
assertion on the source. These assert the SOURCE expresses the value; they do NOT assert
the browser paints it (that is T2).

**Baseline** (from `button.tsx:18-21`):
- sm: `min-h-[36px]` ✓ (correct)
- md: `min-h-[44px]` ✗ (artifact: 46px)
- lg: `min-h-[48px]` ✗ (artifact: 54px)
- Radius: `rounded-xl` ✗ (artifact: `rounded-[999px]` / `--radius-pill`)

**Tier 1 approach — literal px only, no `--control-height-*` tokens in this feature**:
The artifact specifies heights as 36px / 46px / 54px. These three values are the
acceptance criterion. The `--control-height-*` token family is part of the open
artifact-token → theme-name mapping decision (Tension 3) and is NOT introduced by this
feature. T1 assertions use the literal px values directly.

The implementation change is:
- `button.tsx` size strings: `min-h-[44px]` → `min-h-[46px]` and `min-h-[48px]` → `min-h-[54px]`
- `button.tsx` radius: `rounded-xl` → `rounded-[999px]`

**Exact assertions** (one unambiguous form):

```typescript
// sm height — already correct (36px)
expect(source).toMatch(/sm.*min-h-\[36px\]/);

// md height — RED until 44→46px
expect(source).toMatch(/md.*min-h-\[46px\]/);

// lg height — RED until 48→54px
expect(source).toMatch(/lg.*min-h-\[54px\]/);

// Border radius — RED until rounded-xl → rounded-[999px]
expect(source).toMatch(/rounded-\[999px\]/);

// fontWeight semibold — artifact requires --weight-semibold = 600
expect(source).toMatch(/font-semibold/);
```

**Why red first**: The size discrepancies (44 vs 46, 48 vs 54) and the `rounded-xl` vs
`999px` radius are genuine drift. The test encodes the target; without it, drift accumulates.

**Total T1 Button geometry tests: 5**

---

### 2.4 T1 — Shell Geometry-In-Source Tests (`frontend/src/components/__tests__/shell-geometry.test.ts`)

**Mechanism**: `readFileSync` on `frontend/src/components/dashboard/dashboard-sidebar.tsx` and
`frontend/src/app/admin/layout.tsx` + string assertions.

**From `admin-design-spec.md` "Shell geometry"**:
- Sidebar width: `232px` (`grid-template-columns: 232px minmax(0,1fr)`)
- Sidebar bg: `var(--surface-inverse)` = `#061E5C`
- Sidebar: sticky, `100vh`
- Main padding: `var(--space-8) var(--space-10) var(--space-16)` = `32px 40px 64px`

**Current state** (from `dashboard-sidebar.tsx:56-59`):
```typescript
"fixed left-0 top-0 h-full bg-[#061E5C] z-50 ... md:flex",
expanded ? "flex w-[232px]" : "hidden md:flex md:w-[72px] lg:w-[232px]",
```
The sidebar is already `w-[232px]` at lg breakpoint — good. But the bg uses the raw hex
`#061E5C` instead of `var(--surface-inverse)`.

```typescript
// sidebar uses the Tailwind bg-inverse-surface utility (derived from --color-inverse-surface: #061E5C)
// RED until bg-[#061E5C] raw hex becomes bg-inverse-surface
// Note: --color-inverse-surface is already declared at globals.css:24;
// the utility bg-inverse-surface is generated by Tailwind v4 from that declaration.
expect(source).toMatch(/bg-inverse-surface/);

// sidebar is sticky (fixed, top-0, full-height) — already correct
expect(source).toMatch(/fixed.*top-0.*h-full/);
```

**Total T1 Shell geometry tests: 2**

---

### 2.5 T1 — Stale-Test Removal Assertions

**File**: `frontend/src/components/__tests__/button-geometry.test.ts` (same file, appended)

These are NOT new tests that go red. These are assertions that the stale tests have been
removed or rewritten — the test file itself verifies its own health.

```typescript
// Assert the 4 stale failing tests are GONE from the test file itself
// (they assert .claymorphic / .neumorphic / .text-on-error which do not exist
// in frontend/src — verified 0 occurrences by grep 2026-09-29)

describe("stale-test removal", () => {
  it("no longer asserts claymorphic primary button variant", () => {
    const buttonTestSource = readFileSync(
      join(process.cwd(), "src/components/__tests__/button.test.tsx"),
      "utf8"
    );
    expect(buttonTestSource).not.toMatch(/claymorphic/);
  });

  it("no longer asserts neumorphic secondary button variant", () => {
    const buttonTestSource = readFileSync(
      join(process.cwd(), "src/components/__tests__/button.test.tsx"),
      "utf8"
    );
    expect(buttonTestSource).not.toMatch(/neumorphic/);
  });

  it("no longer asserts text-on-error danger variant", () => {
    const buttonTestSource = readFileSync(
      join(process.cwd(), "src/components/__tests__/button.test.tsx"),
      "utf8"
    );
    expect(buttonTestSource).not.toMatch(/text-on-error/);
  });

  it("no longer asserts neumorphic on sponsor live-calc panel", () => {
    const liveCalcTestSource = readFileSync(
      join(process.cwd(), "src/components/sponsor/__tests__/live-calc.test.tsx"),
      "utf8"
    );
    expect(liveCalcTestSource).not.toMatch(/neumorphic/);
  });
});
```

**Why this matters**: The 4 pre-existing failures (button.test.tsx × 3, live-calc.test.tsx × 1)
assert a design vocabulary that has 0 occurrences in the implementation. The purpose-map
calls them "stale assertions of a superseded design" and says they "must be updated or
removed." The TDD loop treats them as an internal cleanliness invariant: they should not
exist in the source being tested.

**Total T1 stale-test removal tests: 4**

---

### 2.6 T2 — Playwright Computed-Style Specs

**File**: `frontend/e2e/admin-page-parity.spec.ts` (new)
**Run command**: `cd frontend && npx playwright test e2e/admin-page-parity.spec.ts`
**Prerequisite**: `npm run dev` running at `http://localhost:3000`
**Projects**: `chromium` (Desktop Chrome) only — artifact is desktop-only; `mobile-chrome`
is covered by the existing `mobile-accessibility.spec.ts` guard.

**Why computed style**: Tier 2 is the ONLY tier where `getComputedStyle()` returns a
physically honest result. The CSS cascade resolves; the browser paints; the test measures
what the farmer/admin actually sees.

#### 2.6.1 Shell — sidebar

| Test ID | Locator | Property | Expected value | Hex→rgb |
|---|---|---|---|---|
| T2-SH-01 | `aside` | `backgroundColor` | `rgb(6, 30, 92)` | `#061E5C` |
| T2-SH-02 | `aside` | `width` | `232px` | — |
| T2-SH-03 | `aside` | `maxWidth` | `232px` | — |
| T2-SH-04 | `aside` | `position` | `sticky` | — |
| T2-SH-05 | `aside` | `minHeight` | `100vh` | — |

```typescript
await expect(page.locator("aside")).toHaveCSS("background-color", "rgb(6, 30, 92)");
await expect(page.locator("aside")).toHaveCSS("width", "232px");
await expect(page.locator("aside")).toHaveCSS("max-width", "232px");
await expect(page.locator("aside")).toHaveCSS("position", "sticky");
await expect(page.locator("aside")).toHaveCSS("min-height", "100vh");
```

#### 2.6.2 Button — all variants (from `sponsor-design-spec.md` "Button" section and `admin-design-spec.md`)

Tests run against each of the 4 variant+size combinations present in the component.

| Test ID | Locator | Property | Expected value | Notes |
|---|---|---|---|---|
| T2-BTN-01 | `[class*="rounded-pill"]` first button | `borderRadius` | `999px` | `--radius-pill` = 999px |
| T2-BTN-02 | sm button | `height` | `36px` | `--control-height-sm` |
| T2-BTN-03 | md button | `height` | `46px` | `--control-height-md` |
| T2-BTN-04 | lg button | `height` | `54px` | `--control-height-lg` |
| T2-BTN-05 | primary button | `backgroundColor` | `rgb(2, 142, 145)` | `--action-primary` = `#028E91` |
| T2-BTN-06 | secondary button | `backgroundColor` | `rgb(6, 30, 92)` | `--action-secondary` = `#061E5C` |
| T2-BTN-07 | outline button | `borderColor` | `rgb(2, 142, 145)` | `--border-accent` = `#028E91` |
| T2-BTN-08 | primary button hover | `backgroundColor` | `rgb(2, 114, 118)` | `--action-primary-hover` = `#027276` |

```typescript
// Pill radius
const pillButtons = page.locator("button").filter({ has: page.locator("text=เข้าสู่ระบบ") });
await expect(pillButtons.first()).toHaveCSS("border-radius", "999px");

// Heights
await expect(page.getByRole("button", { name: /sm/i }).first()).toHaveCSS("height", "36px");
await expect(page.getByRole("button", { name: /md/i }).first()).toHaveCSS("height", "46px");
await expect(page.getByRole("button", { name: /lg/i }).first()).toHaveCSS("height", "54px");

// Primary colour
const primaryBtn = page.getByRole("button", { name: "เข้าสู่ระบบ" });
await expect(primaryBtn).toHaveCSS("background-color", "rgb(2, 142, 145)");
```

#### 2.6.3 Login — gradient panel (from `admin-design-spec.md` AD-AUTH and `sponsor-design-spec.md` SP-AUTH)

The left panel of the login page uses `--gradient-deep` covering the full left half.

| Test ID | Locator | Property | Expected value | Notes |
|---|---|---|---|---|
| T2-LOGIN-01 | `.login-left-panel` or `main` first child | `background` | `linear-gradient(150deg, rgb(6, 30, 92) 0%, rgb(11, 42, 114) 45%, rgb(2, 114, 118) 100%)` | `#061E5C → #0B2A72 → #027276` |
| T2-LOGIN-02 | `.login-left-panel` or `main` first child | `minHeight` | `100vh` | Full viewport |

```typescript
const leftPanel = page.locator(".login-left-panel");
await expect(leftPanel).toHaveCSS(
  "background",
  "linear-gradient(150deg, rgb(6, 30, 92) 0%, rgb(11, 42, 114) 45%, rgb(2, 114, 118) 100%)"
);
```

**Unknown**: Whether the login page uses a `.login-left-panel` class or a structural
selector. The exact selector must be confirmed by reading the implemented login page at
`frontend/src/app/admin/login/page.tsx` and `frontend/src/app/sponsor/login/page.tsx`
before the test is written. The design intent is that the left panel has the gradient.

#### 2.6.4 StatTile (from `admin-design-spec.md` AD-OV StatTile section and `sponsor-design-spec.md`)

| Test ID | Locator | Property | Expected value | Notes |
|---|---|---|---|---|
| T2-TILE-01 | `[data-testid="stat-tile"]` first | `borderRadius` | `16px` | `--radius-card` |
| T2-TILE-02 | `[data-testid="stat-tile"]` first | `backgroundColor` | `rgb(255, 255, 255)` | `--surface-card` |
| T2-TILE-03 | dark StatTile | `backgroundColor` | `rgb(6, 30, 92)` | `--surface-inverse` |
| T2-TILE-04 | dark StatTile value | `color` | `rgb(255, 255, 255)` | `--text-on-dark` |

#### 2.6.5 ProgressBar (from `sponsor-design-spec.md` ProgressBar section)

| Test ID | Locator | Property | Expected value | Notes |
|---|---|---|---|---|
| T2-PB-01 | `[data-testid="progress-bar"]` | `borderRadius` | `999px` | `--radius-pill` |
| T2-PB-02 | `[data-testid="progress-bar"]` track | `backgroundColor` | `rgb(237, 239, 243)` | `--grey-100` |
| T2-PB-03 | `[data-testid="progress-bar"]` fill teal | `backgroundColor` | `rgb(2, 142, 145)` | `--teal-600` |

**Total T2 computed-style tests: ~18** (exact count depends on final selector resolution
for T2-TILE and T2-PB which require `data-testid` attributes to be added to the components
as part of implementation).

---

### 2.7 T2 — Non-Regression Guards (existing tests that must stay green)

These are NOT red-first tests — they are the guardrails that must remain green throughout.
They are listed here so their survival is explicit.

| File | What it tests | Purpose |
|---|---|---|
| `frontend/e2e/admin.spec.ts` | Admin overview, KPI section, work queue, sidebar brand, mobile layout | Existing behaviour guard |
| `frontend/e2e/sponsor.spec.ts` | Sponsor portal navigation, KPI cards, sidebar | Existing behaviour guard |
| `frontend/e2e/mobile-accessibility.spec.ts` | Pixel 5 WCAG 2.2 AA compliance | Accessibility baseline (Tension 1 deviation) |
| `frontend/src/components/__tests__/button.test.tsx` | *(to be rewritten)* — must be rewritten to artifact Button variants, not deleted | Prevents component regression |
| `frontend/src/components/sponsor/__tests__/live-calc.test.tsx` | *(to be rewritten)* — must be rewritten to non-neumorphic design | Prevents sponsor panel regression |

---

## 3. Commands

### Tier 1 — vitest (no server required)
```bash
# Run all T1 tests
cd frontend && npx vitest run

# Run only token-definition tests
cd frontend && npx vitest run src/components/__tests__/admin-parity-tokens.test.ts

# Run only literal-freedom tests
cd frontend && npx vitest run src/components/__tests__/literal-freedom.test.ts

# Run only button geometry tests
cd frontend && npx vitest run src/components/__tests__/button-geometry.test.ts

# Run only shell geometry tests
cd frontend && npx vitest run src/components/__tests__/shell-geometry.test.ts
```

**Red signature**: 62 + 2 + 5 + 2 + 4 = **75 failures** at baseline.
**Green signature**: **0 failures** after all tokens declared, all literals removed,
button/shell geometry updated, and stale tests rewritten.

**Note**: `bun test` cannot parse `.tsx` files. Frontend tests MUST use `npx vitest run`
from the `frontend/` directory.

### Tier 2 — Playwright (requires running server)
```bash
# Start the frontend dev server
npm run dev          # from repo root, starts Next.js on port 3000
# OR
npm run dev:all      # starts both Worker (3001) and Next.js (3000)

# In a second terminal, run Playwright
cd frontend && npx playwright test e2e/admin-page-parity.spec.ts

# Run only shell tests
cd frontend && npx playwright test e2e/admin-page-parity.spec.ts --grep "shell"

# Run only button tests
cd frontend && npx playwright test e2e/admin-page-parity.spec.ts --grep "button"

# Run admin non-regression guard
cd frontend && npx playwright test e2e/admin.spec.ts

# Run sponsor non-regression guard
cd frontend && npx playwright test e2e/sponsor.spec.ts
```

**Red signature**: T2 tests fail with `Expect.toHaveCSS` mismatch until shell and
components are updated.
**Green signature**: All T2 assertions match computed values.

---

## 4. Red→Green Walkthrough — Button

This is the worked example for ONE component. The same pattern applies to every component.

### Baseline state (what exists today)

`frontend/src/components/ui/button.tsx:18-21`:
```typescript
const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-label-md min-h-[36px]",
  md: "px-6 py-3 text-body-md min-h-[44px]",   // artifact: 46px
  lg: "px-8 py-4 text-body-lg min-h-[48px]",   // artifact: 54px
};
```
`button.tsx:20`: `rounded-xl` (24px radius).

### Red test (written before any implementation change)

```typescript
// frontend/src/components/__tests__/button-geometry.test.ts

it("md button height is 46px per artifact --control-height-md", () => {
  const src = readFileSync(
    join(process.cwd(), "frontend/src/components/ui/button.tsx"),
    "utf8"
  );
  // Artifact: md → min-h-[46px], NOT 44px
  expect(src).toMatch(/md.*min-h-\[46px\]/);
});

it("lg button height is 54px per artifact --control-height-lg", () => {
  const src = readFileSync(
    join(process.cwd(), "frontend/src/components/ui/button.tsx"),
    "utf8"
  );
  // Artifact: lg → min-h-[54px], NOT 48px
  expect(src).toMatch(/lg.*min-h-\[54px\]/);
});

it("button uses 999px pill radius per artifact --radius-pill", () => {
  const src = readFileSync(
    join(process.cwd(), "frontend/src/components/ui/button.tsx"),
    "utf8"
  );
  // Artifact: borderRadius: var(--radius-pill) = 999px, NOT rounded-xl (24px)
  expect(src).toMatch(/rounded-\[999px\]/);
});
```

**Result**: all 3 tests FAIL.

### Green change (implementation)

Edit `frontend/src/components/ui/button.tsx`:

```typescript
// BEFORE
const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-label-md min-h-[36px]",
  md: "px-6 py-3 text-body-md min-h-[44px]",   // WRONG: 44px
  lg: "px-8 py-4 text-body-lg min-h-[48px]",   // WRONG: 48px
};

// AFTER
const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-label-md min-h-[36px]",   // already correct
  md: "px-6 py-3 text-body-md min-h-[46px]",    // FIXED: 44→46
  lg: "px-8 py-4 text-body-lg min-h-[54px]",    // FIXED: 48→54
};
```

And fix the radius:
```typescript
// BEFORE
`rounded-xl transition-all`

// AFTER
`rounded-[999px] transition-all`
```

### Green assertion (after change)

Same test file, same assertions — now they PASS.

```typescript
expect(src).toMatch(/md.*min-h-\[46px\]/);   // ✓
expect(src).toMatch(/lg.*min-h-\[54px\]/);   // ✓
expect(src).toMatch(/rounded-\[999px\]/);    // ✓
```

---

## 5. Mutation-Proofing

A test that passes when the implementation is broken is worthless. For each tier-1
category, the specific break is:

### T1 token-definition — break `--surface-inverse`

```bash
# Break: change #061E5C to #FF0000 in globals.css
# T1-COL-40 (--surface-inverse) MUST go red
sed -i 's/--surface-inverse: #061E5C/--surface-inverse: #FF0000/' frontend/src/app/globals.css
npx vitest run src/components/__tests__/admin-parity-tokens.test.ts
# Expected: T1-COL-40 fails with "expected false to be true"

# Restore
git checkout frontend/src/app/globals.css
```

If `T1-COL-40` does NOT fail, the test is vacuous — it is not actually checking the
token value.

### T1 literal-freedom — break by adding one raw hex back

```bash
# Break: add a raw hex to button.tsx
echo 'className="bg-[#FF0000]"' >> frontend/src/components/ui/button.tsx
npx vitest run src/components/__tests__/literal-freedom.test.ts
# Expected: literal-freedom test fails

# Restore
git checkout frontend/src/components/ui/button.tsx
```

If the test does NOT fail after adding a raw hex, the test is vacuous.

### T1 shell geometry — break the sidebar width

```bash
# Break: change sidebar from 232px to 200px
sed -i 's/w-\[232px\]/w-[200px]/' frontend/src/components/dashboard/dashboard-sidebar.tsx
npx vitest run src/components/__tests__/shell-geometry.test.ts
# Expected: T1-SH-WIDTH test fails

# Restore
git checkout frontend/src/components/dashboard/dashboard-sidebar.tsx
```

### T1 shell geometry — break the sidebar bg utility

```bash
# Break: change bg-inverse-surface back to raw hex
sed -i 's/bg-inverse-surface/bg-[#FF0000]/' frontend/src/components/dashboard/dashboard-sidebar.tsx
npx vitest run src/components/__tests__/shell-geometry.test.ts
# Expected: shell-geometry test fails (bg-inverse-surface not found)

# Restore
git checkout frontend/src/components/dashboard/dashboard-sidebar.tsx
```

### T1 button geometry — break the pill radius

```bash
# Break: change rounded-[999px] back to rounded-xl
sed -i 's/rounded-\[999px\]/rounded-xl/' frontend/src/components/ui/button.tsx
npx vitest run src/components/__tests__/button-geometry.test.ts
# Expected: T1 button-geometry test fails (rounded-\[999px\] not found)

# Restore
git checkout frontend/src/components/ui/button.tsx
```

### T2 Playwright — break the sidebar background colour

```bash
# Break: change sidebar bg from bg-inverse-surface to a wrong raw hex
# (edit dashboard-sidebar.tsx: replace bg-inverse-surface with bg-[#FF0000])
# Then run Playwright (requires npm run dev)
npx playwright test e2e/admin-page-parity.spec.ts --grep "shell"
# Expected: T2-SH-01 fails with "expected rgb(255, 0, 0) to be rgb(6, 30, 92)"

# Restore
git checkout frontend/src/components/dashboard/dashboard-sidebar.tsx
```

**Repo lesson** (from memory, verified 2026-09-29): a test that passes when the bug is
introduced is worthless and must be reported, not quietly "fixed" by removing the
assertion. The mutation break is the proof the test is honest.

---

## 6. Known Limits and Human-Only Checks

### What the loop CANNOT prove

**Visual appearance (human sign-off required)**
The automated loop verifies that the correct tokens are referenced in the source and that
the browser resolves the correct computed values. It does NOT prove that the result looks
right — that two colours are harmonious, that typography is legible at 1280px, that
spacing feels balanced. This requires the client design owner to sign off with a
side-by-side screenshot comparison at desktop viewport. Purpose-map criterion #8:
"Each admin screen (9) and sponsor screen (4) is visually indistinguishable from the
artifact on a desktop browser at 1280px+ — signed off by the client design owner."

**Responsive/mobile deviation (Tension 1)**
The artifact has no mobile layout. The repo has `mobile-chrome` (Pixel 5) Playwright
projects and `WCAG 2.2 AA` accessibility requirements. The recommended resolution
(Tension 1, option b) is a minimal responsive shell: 232px rail on ≥1024px, hamburger +
drawer on <1024px. The loop tests the desktop shell geometry correctly. The mobile
collapse is a separate layout decision and must be verified manually or with a separate
responsive spec.

**Missing binary assets (Tension 6)**
The artifact references `../../assets/logos/horizontal-white.png` (login panel logo) and
a wind-farm background image at 18% opacity. Neither is recoverable from the artifact
HTML. The loop cannot prove these assets are present — they must be supplied by the design
owner.

**Chart rendering (Tension 4)**
AD-CHART has 6 SVG chart types (Gauge, Donut, CreditChart, BarSeries, Treemap, Bubbles)
that are deferred to a follow-on feature. The T2 loop tests the shell (PageTitle,
FilterBar, layout geometry) but does NOT test chart geometry.

### Open prerequisite — artifact-token → theme-name mapping — DECIDED: Map C

**Decision: Map C (alias tokens).** Rationale:
- It preserves the existing semantic tokens the codebase already uses
  (`--color-inverse-surface`, `--color-primary`, `--color-surface-*`) so no existing
  component class name breaks.
- It adds the artifact ramp names as aliases mapping to the same values, so the artifact's
  vocabulary becomes assertable — which is the whole point of the feature.
- Map A would force a rename sweep across every component for no visual gain.
- Map B is partially true already (e.g. `--color-inverse-surface: #061E5C` already matches
  artifact `--navy-900`) but leaves the artifact ramp names unassertable.

**Conflict requiring separate resolution**: `--color-surface: #f0f4f8` (current
`globals.css`) vs artifact `--surface-sunken: #F2F2F2` — these are different values, not
just different names. This is a Tension 0 decision and must be flagged as a conflict, not
silently resolved by this feature's token mapping.

**Rejected alternatives**:
- Map A: Would require renaming all existing `--color-*` utilities across every component;
  rejected — same visual result, much higher implementation cost.
- Map B: Leaves the artifact ramp names (`--navy-*`, `--teal-*`, `--grey-*`) absent from
  `globals.css`, making T1 token-definition assertions impossible for those families;
  rejected — the whole purpose of this feature is to make those tokens assertable.

The token-definition tests (T1-COL-01…T1-COL-54) assert the **artifact token names** are
present in `globals.css`. Under Map C, the ramp tokens are added as aliases alongside the
existing semantic tokens.

### Summary of unknowns requiring human decision

> **Resolved — `--teal-400`**: Ground truth is `#24C4B2` — both artifacts agree. Verified by
> grep of raw HTML: `admin-console.html` and `sponsor-portal.html` both emit `--teal-400:#24C4B2`.
> All four source files (`admin-design-spec.md`, `sponsor-design-spec.md`,
> `admin-artifact.json`, `sponsor-artifact.json`) already had the correct value `#24C4B2`.
> My earlier claim that `admin-design-spec.md` line 100 contained `#24C4B6` was a misread of
> the table during writing — the source file was never wrong. T1-COL-16 in this document
> is confirmed as `#24C4B2`.

| Unknown | Source | Decision needed |
|---|---|---|
| Login panel left-panel CSS class name | Not yet implemented | Exact class/selector for T2-LOGIN tests |
| `data-testid` attributes on StatTile and ProgressBar | Not yet in components | Whether to add testids or use role-based selectors |
| Wind-farm background image | Artifact binary not recoverable | Whether to omit or substitute solid gradient |
| Chart deferral scope | purpose-map Tension 4 | Whether AD-CHART placeholder is in-scope for this feature |
