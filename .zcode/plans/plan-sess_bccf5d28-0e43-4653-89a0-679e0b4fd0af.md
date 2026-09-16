## Issue #142 — Inventory exact design sources and map every screen/state

**Goal:** Produce a single reviewable manifest document (`docs/design-inventory.md`) mapping every design source screen/state to current implementation. No code changes.

### What we know from exploration

**Design sources** (3 Claude artifact extractions in `visual-qa-screenshots/`):
- `admin-extracted/` — 13 JS files (8 app-specific), 59 woff2 fonts, 1 HTML shell
- `sponsor-extracted/` — 9 JS files (5 app-specific), 59 woff2 fonts, 1 HTML shell  
- `line-oa-extracted/` — 7 JS files (3 app-specific), 59 woff2 fonts, 1 HTML shell
- No image assets in any extraction (referenced externally but not bundled)

**Key token mismatches already identified:**
- Fonts: artifacts use Fira Sans + Noto Sans Thai; current impl uses Plus Jakarta Sans + Sarabun
- Sidebar: artifacts use navy-900 `#061E5C`, 232px; current uses `#0d1f17` dark green, 288px
- Colors: artifacts use teal/navy palette; current uses green/neumorphic palette
- Login: artifacts have split-layout with gradient panel; current is a centered card

### Deliverable: `docs/design-inventory.md`

Single markdown file with these sections:

#### 1. Source provenance
- Artifact IDs, URLs, extraction dates, file hashes
- File manifest per tree (app-specific JS only, skip shared Babel/React bundles)
- Font inventory (59 woff2 files per tree, all identical)
- Missing assets (images referenced but not bundled)

#### 2. Design token extraction
- Full color palette with CSS variable names and hex values (teal, navy, grey, status, special)
- Typography: font families, weight scale, size scale, line heights, letter spacing
- Spacing scale, gutters, container widths, control heights
- Border-radius tokens, shadow values, gradients
- Transition durations and easing curves
- Side-by-side comparison with current `globals.css` tokens

#### 3. Screen/state inventory — Admin Console
Map each admin screen from source JS to current route:
- LoginScreen (`9482f706`) → `/admin/login` — split layout, OTP, remember-device
- OverviewScreen (`1e8c88ce`) → `/admin` — stat tiles, task queue, credit chart, GHG table
- FarmersScreen (`8c07477b`) → `/admin/farmers` — DataTable, detail drawer with 5 tabs
- ReviewScreen (`f24453af`) → `/admin/applications` — photo review, approve/reject
- ReportsScreen (`20301eef`) → `/admin/reports`
- SettingsScreen → `/admin/settings`
- ConsoleShell → sidebar (232px, navy-900) + nav items with count badges
- States: empty, loading, populated, error per screen

#### 4. Screen/state inventory — Sponsor Portal
- LoginScreen (same `a350f295`) → `/admin/login` (shared)
- SponsorOverview (`7ccc65fc`) → `/sponsor` — hero card, StatTiles, CreditChart, GHG table
- SponsorAreas → `/sponsor/areas` — per-province plot tables
- SponsorReports → `/sponsor/reports`
- PdpaNote component — recurring PDPA compliance notice
- Sidebar: 3 nav items

#### 5. Screen/state inventory — LINE OA
Map all 10 scenes / 43 steps from `5a25b866`:
- Onboarding: OB-01→OB-15 (friend add, PDPA, phone, identity, conditions, registration, docs, activation)
- Season: PJ-00→PJ-13 (season opening, 9-step calendar, photo evidence WET-1/DRY-1, rejected photos)
- Results: RP-01→RP-04 (pending tasks, results summary)
- Rich Menu: 6 buttons with exact Thai labels and LIFF destinations
- LIFF pages: register, camera, calendar, docs, summary, fields, contact (7 destinations)
- Flex message types: heroTone variants (teal/navy/amber/grey), heroBadge, rows, actions
- LiffShell component: gradient-deep header, NZC logo, overlay panel

#### 6. Requirement ID cross-reference
Map each screen to REQUIREMENTS.md requirement IDs (AD-01 through AD-18, F-34, etc.)

#### 7. Current route/component mapping
Table: source screen → current route → current component file → status (exists/partial/missing)

#### 8. Reusable asset list
- Design system components from `NetZeroCarbonDesignSystem_f3e7a8`
- Calculation engine (AWD carbon credit methodology)
- Thai copy strings

#### 9. Conflicts and unknowns
- Font mismatch (Fira Sans vs Plus Jakarta Sans)
- Color palette mismatch (teal/navy vs green)
- Sidebar width/color mismatch
- Missing image assets
- Stale DESIGN-COMPARISON-REPORT.md warnings
- Native LINE rendering caveats

#### 10. Implementation checklist
Screen-by-screen checklist for jobs 02-07, ordered by dependency

### Execution steps
1. Read the 8 app-specific JS files in detail to extract exact screen definitions, Thai copy, and component structures
2. Parse `index.html` from each tree for CSS custom properties and @font-face rules
3. Cross-reference with REQUIREMENTS.md for requirement IDs
4. Cross-reference with current frontend routes and components
5. Write `docs/design-inventory.md` with all 10 sections
6. Commit with reference to #142

### Verification
- `npm run lint` passes
- `npm run typecheck` passes (if configured)
- No implementation files changed
- Document covers all screens in all 3 artifacts
- Every screen has: source file, requirement IDs, current route, status, Thai copy summary