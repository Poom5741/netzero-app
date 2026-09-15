# Feature Specification: Match Shared Tokens, Dashboard Shell and Login Presentation

**Feature Branch**: `003-shared-tokens-dashboard-shell-login`

**Created**: 2026-09-15

**Status**: Draft

**Input**: GitHub Issue #143 — 03 — Match shared tokens, dashboard shell and login presentation. Part of #141, blocked by #143. Work in frontend/src/app/globals.css, app/layout.tsx, components/dashboard/, components/ui/, app/admin/login/page.tsx and the Sponsor auth surface located by inventory. Port measured client tokens and assets; match sidebar/header/content widths, active states, cards, buttons and Thai typography. Scope changes by surface where LINE native green differs from portal teal/navy. Remove decorative effects only where the reference differs. Do not add a nonfunctional OTP/remember-device/password-reset control: inventory support and raise a separate functional blocker if unavailable. Verify Admin and Sponsor shell/login and LIFF regression at target widths. Acceptance: all shared states and auth visuals from inventory have reference/before/after evidence, no new dead controls and unchanged auth behavior.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Admin Login Matches Reference Design (Priority: P1)

An admin user opens the Admin login page and sees a presentation that matches the extracted reference design — logo, form fields, button, Thai copy, and color scheme match exactly. The auth flow (POST to `/login`, cookie-based session) is unchanged.

**Why this priority**: Login is the entry point for all admin users. Any visual mismatch at login erodes trust in the entire system before any real workflow begins.

**Independent Test**: Open Admin login at 1280×720 in a browser. Visually compare against the reference screenshot of the Admin login from `visual-qa-screenshots/admin-extracted/9482f706-3071-47ef-a10d-293ec76b9810.js`. Verify: logo placement, form layout, button color, error states, Thai labels. Then complete a real login with a valid test credential and confirm the session redirects to `/admin`.

**Acceptance Scenarios**:

1. **Given** a browser loads the Admin login page at 1280×720, **Then** the logo/icon, email and password fields, submit button, and Thai labels match the reference layout — same positions, same spacing, same colors.
2. **Given** an admin enters invalid credentials, **Then** an error message appears in Thai with the same styling as the reference.
3. **Given** an admin enters valid credentials and submits, **Then** the POST to `/login` succeeds with a cookie, and the browser redirects to `/admin` — auth behavior is unchanged.
4. **Given** the session cookie is absent, **Then** the admin is returned to the login page (not a broken/blank page).

---

### User Story 2 — Admin Dashboard Shell Matches Reference (Priority: P1)

An admin user logs in and sees the dashboard shell — sidebar, header, and content area — matching the extracted reference layout. Sidebar width, header height, active nav state, and card styles match exactly.

**Why this priority**: The dashboard shell is the persistent frame for every admin workflow. Inconsistent shell geometry breaks navigation trust and layout stability across all pages.

**Independent Test**: Log in as admin and navigate to the overview page at 1280×720. Capture the dashboard shell and compare against the reference from `visual-qa-screenshots/admin-extracted/1e8c88ce-9966-4c5f-8ec4-ac0bc4ce90d2.js`. Verify sidebar width (288px), header height, active nav item highlight, card radius, and content padding.

**Acceptance Scenarios**:

1. **Given** the Admin overview page is loaded at 1280×720, **Then** the sidebar is 288px wide with a fixed left position, the header spans the remaining width, and the content area starts at the correct offset — matching the reference geometry.
2. **Given** the admin clicks the active nav item in the sidebar, **Then** the active state (highlighted background or border) matches the reference and the URL updates correctly.
3. **Given** the admin resizes the viewport to 1440×900, **Then** the sidebar and header adapt without layout breakage and no decorative neumorphic/claymorphic shadows appear unless the reference shows them.
4. **Given** the admin navigates to any admin sub-page, **Then** the shell geometry (sidebar width, header, content offset) remains consistent with the overview.

---

### User Story 3 — Sponsor Login and Shell Matches Reference (Priority: P1)

A sponsor user opens the Sponsor login and, after authentication, sees a dashboard shell that matches the Sponsor reference design — distinct teal/navy color scheme (separate from Admin's green), sidebar layout, and card presentation.

**Why this priority**: Sponsor and Admin are separate user roles with distinct brand treatments. Confusing the two would break trust and could expose data to the wrong role.

**Independent Test**: Open Sponsor login at 1280×720 and visually compare against the Sponsor reference. After login, navigate to the Sponsor overview and compare shell geometry, color scheme, and card styles against `visual-qa-screenshots/sponsor-extracted/` reference sources.

**Acceptance Scenarios**:

1. **Given** a browser loads the Sponsor login page at 1280×720, **Then** the logo, form layout, button, and Thai copy match the Sponsor reference — with teal/navy tones distinct from the Admin green.
2. **Given** a sponsor enters valid credentials and submits, **Then** authentication succeeds, the session cookie is set, and the user lands on the Sponsor overview — auth behavior unchanged.
3. **Given** the Sponsor dashboard shell is loaded, **Then** sidebar width, header, and content layout match the Sponsor reference; the color scheme uses teal/navy tokens (not the Admin primary green or LINE green).
4. **Given** a sponsor navigates between Sponsor pages, **Then** the shell geometry remains consistent and role-appropriate.

---

### User Story 4 — Shared Typography and Thai Text Rendering (Priority: P2)

All three surfaces (Admin, Sponsor, LIFF) render Thai text using the same font family, size, line-height, and wrapping behavior as the reference designs. Thai characters do not overflow, wrap correctly, and are legible at all target viewports.

**Why this priority**: Thai is the primary user-facing language. Poor Thai typography causes miscommunication for farmers and admin users alike, and could obscure critical carbon accounting information.

**Independent Test**: Inspect Thai text rendering on Admin login, Admin dashboard, and Sponsor dashboard at 1280×720, 1440×900, 390×844 (LIFF), and 360×844 (LIFF narrow). Verify line wrapping, no overflow, and consistent font rendering.

**Acceptance Scenarios**:

1. **Given** any surface renders Thai text at 1280×720, **Then** line-height, font weight, and font size match the reference — text is legible and not clipped.
2. **Given** Thai text appears in a sidebar or card at 360×844 LIFF width, **Then** text wraps correctly without horizontal overflow and touch targets remain usable.
3. **Given** the viewport changes to 1440×900, **Then** Thai text reflows correctly and does not produce unexpected orphans or widows.

---

### User Story 5 — LIFF Shell Regression at Target Widths (Priority: P2)

The LIFF pages render correctly inside the LINE app at 390×844 and 360×844 widths. The dashboard shell for LIFF-trigged flows (camera, upload confirmation) has correct geometry, font loading, and no layout breakage.

**Why this priority**: LIFF is used for camera and file upload flows inside LINE. If the LIFF shell is broken, farmers cannot submit photo evidence, which is essential for carbon verification.

**Independent Test**: Open a LIFF URL on a real LINE-capable device or emulator at 390×844 and 360×844. Verify the page renders without wrapper chrome, fonts load correctly, and the content fits the viewport.

**Acceptance Scenarios**:

1. **Given** a LIFF page is opened at 390×844, **Then** the content fills the viewport, fonts render correctly, and there is no horizontal scroll.
2. **Given** the same LIFF page is opened at 360×844, **Then** content wraps and resizes correctly and no critical UI elements are hidden.
3. **Given** font loading is slow, **Then** the page does not flash unstyled text or render a blank page; font readiness is confirmed before user interaction.

---

### Edge Cases

- What happens when the extracted reference for a specific screen state (e.g., login with error) does not exist in the inventory? → That state is marked as "blocked — missing reference" in the acceptance evidence; do not fabricate a design for it.
- What happens when the current implementation uses neumorphic/claymorphic shadows but the reference design has none? → Remove the decorative shadows only where the reference differs; do not add shadow effects the reference does not show.
- What happens when the Sponsor auth surface cannot be located in the inventory? → Raise a functional blocker explicitly naming the missing surface; do not assume a location.
- What happens when a nonfunctional OTP/remember-device/password-reset control exists in the reference but is not wired to a real backend? → Do not add it; report it as a functional blocker per the issue constraint.
- What happens when Thai text overflows a card or sidebar at narrow LIFF widths? → Document the overflow as a visual discrepancy; fix only if the reference shows correct wrapping at that width.
- What happens when the implementation login page renders but the POST to `/login` fails silently? → Ensure error handling is preserved; do not silently swallow auth failures to achieve a visual match.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Admin login page (`app/admin/login/page.tsx`) visual presentation MUST match the reference from `visual-qa-screenshots/admin-extracted/9482f706-3071-47ef-a10d-293ec76b9810.js` — logo, form layout, button styling, color tokens, Thai labels, and spacing — verified by visual comparison at 1280×720.
- **FR-002**: The Admin dashboard shell (sidebar, header, content layout) in `components/dashboard/` and `app/globals.css` MUST match the reference from `visual-qa-screenshots/admin-extracted/1e8c88ce-9966-4c5f-8ec4-ac0bc4ce90d2.js` — sidebar width of 232px, header positioning, active nav state styling — verified by visual comparison at 1280×720 and 1440×900.
- **FR-003**: The Sponsor login and dashboard shell MUST match the Sponsor reference from `visual-qa-screenshots/sponsor-extracted/` using teal/navy color tokens distinct from the Admin green — verified by visual comparison at 1280×720.
- **FR-004**: Shared tokens in `globals.css` MUST be updated to match the extracted reference values for color, spacing, border-radius, and typography. LINE native green tokens (used in LINE OA surfaces) MUST remain distinct from portal teal/navy tokens (used in Admin and Sponsor).
- **FR-005**: The Admin and Sponsor login forms MUST NOT gain any nonfunctional OTP, remember-device, or password-reset controls; if the reference shows such controls and the backend does not support them, the missing capability is reported as a functional blocker.
- **FR-006**: The Admin and Sponsor auth behavior MUST remain unchanged — POST to `/login`, cookie-based session, redirect on success, error display on failure. Visual changes MUST NOT alter the authentication mechanism.
- **FR-007**: Thai typography MUST be consistent across Admin, Sponsor, and LIFF surfaces: same font family, line-height, and font-size as the reference; Thai text MUST NOT overflow or wrap incorrectly at any target viewport.
- **FR-008**: LIFF pages MUST render correctly at 390×844 and 360×844 widths with no horizontal overflow, correct font loading, and no neumorphic/claymorphic decorative effects unless the reference shows them.
- **FR-009**: No new dead (nonfunctional visible) controls MAY be added to Admin or Sponsor shells or login pages; any existing dead control is documented.
- **FR-010**: Material Symbols MUST load via a Google Fonts `<link>` in `app/layout.tsx`, not via `next/font/google`, per Constitution Principle VIII. Font loading state MUST be confirmed before user interaction.
- **FR-011**: All visual changes MUST produce reference/before/after evidence for every affected screen and state. A build passing or a text assertion passing alone is not visual acceptance.
- **FR-012**: For each screen where the reference does not match the implementation, the discrepancy MUST be documented with: file path, selector, expected (reference) value, actual (current) value, and severity (geometry / color / typography / spacing / state).

### Key Entities

- **Design Token Set**: A named group of CSS custom properties (colors, spacing, typography, border-radius, shadows) that define the visual language of one surface. Surfaces are: Admin (teal/navy), Sponsor (teal/navy), LINE OA (green), and Shared.
- **Dashboard Shell**: The persistent layout frame consisting of sidebar (navigation), header (top bar), and content area. Its geometry (widths, offsets, heights) is shared across all pages within a surface.
- **Auth Surface**: The login page and authentication flow for a given role (Admin, Sponsor). The visual presentation may differ by role; the authentication mechanism is shared infrastructure.
- **Reference Screenshot**: A captured image from the extracted artifact source at a specific viewport, used as the visual ground truth for comparison.
- **LIFF Context**: The runtime environment when a page is loaded inside the LINE app via a LIFF URL, with viewport constraints of 390×844 (primary) or 360×844 (narrow).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin login page at 1280×720 visually matches the reference screenshot with no geometry, color, typography, or spacing discrepancies — evidenced by a captured before/after comparison.
- **SC-002**: Admin dashboard shell at 1280×720 and 1440×900 visually matches the reference with sidebar at 232px, correct header offset, and active nav state matching — evidenced by captured comparisons.
- **SC-003**: Sponsor login and dashboard shell use teal/navy color tokens distinct from Admin green, matching the Sponsor reference — evidenced by captured comparisons.
- **SC-004**: Thai text renders correctly (no overflow, correct line wrapping) on Admin, Sponsor, and LIFF surfaces at all target viewports (1280×720, 1440×900, 390×844, 360×844) — verified by manual inspection or viewport captures.
- **SC-005**: LIFF pages render without horizontal overflow, with correct font loading, at 390×844 and 360×844 — verified by viewport captures.
- **SC-006**: Auth behavior is unchanged: valid login redirects to the correct dashboard, invalid login shows a Thai error message, unauthenticated access redirects to login.
- **SC-007**: No nonfunctional OTP, remember-device, or password-reset controls exist on Admin or Sponsor login pages.
- **SC-008**: All discrepancies between reference and implementation are documented with file path, selector, expected vs. actual values, and severity — no undocumented visual differences remain.

## Clarifications

### Session 2026-09-15

- Q: Should neumorphic/claymorphic shadows be removed globally or only where the reference differs? → A: Only where the reference differs. If the reference shows no shadow on a card, remove the shadow only from that card's class. Do not globally remove neumorphic styling unless all references consistently omit it.
- Q: How to handle a missing auth surface in the Sponsor inventory? → A: Raise a functional blocker naming the missing surface and the expected location from the #142 inventory; do not guess the design.
- Q: What DPR should be used for LIFF viewport captures? → A: Use DPR 3 for 390×844 and 360×844 captures per the reference capture spec (#143).

## Assumptions

- The extracted source trees in `visual-qa-screenshots/{admin,sponsor,line-oa}-extracted/` contain sufficient style and layout information for the shared token and shell surfaces, as established by #142.
- The Admin and Sponsor auth backends (`/login` endpoint) are functional and unchanged; visual changes do not require backend modifications.
- The `components/dashboard/` directory contains the sidebar and header components used across all Admin and Sponsor pages.
- Thai font rendering stability can be verified by font readiness wait (as established in #143 capture pipeline) before user interaction.
- The three target viewports for this phase are: 1280×720 (desktop primary), 1440×900 (desktop wide), and 390×844 / 360×844 (LIFF primary / narrow).

## Technical and Compliance Constraints

- Changes are scoped to CSS/presentation only: no modification of APIs, authentication logic, data models, or carbon calculation behavior.
- Per Constitution Principle VIII: Material Symbols MUST load through Google Fonts `<link>`, not `next/font/google`.
- Per Constitution Principle VI: Sponsor-facing views MUST retain CPA-code scoping; visual changes MUST NOT alter data access scope.
- One bounded commit per logical change (e.g., one commit per surface per phase); no merge or deploy as part of this handoff.
- Browser work MUST use the repository-required `browser-use:control-browser` skill for manual QA. Playwright MCP tools MUST NOT be substituted for manual verification per AGENTS.md.
- If `browser-use:control-browser` is unavailable, independent source work proceeds and the specific verification blocker is reported.
