# Feature Specification: Match Shared Tokens, Dashboard Shell and Login Presentation

**Feature Branch**: `006-match-dashboard-shell-login`

**Created**: 2026-09-15

**Status**: Draft

**Input**: User description: "Issue #144 — Match shared tokens, dashboard shell and login presentation"

## Dependencies

**This spec is blocked until the following are complete:**

1. **Spec 005 (Reference Captures)**: Must provide valid reference captures for all screens and states covered by this spec. Reference captures are the authoritative visual specification.
2. **Issue #142 Inventory Manifest**: Must provide a complete inventory of all screens, states, and viewports to be compared. This spec covers all items in the inventory related to shared tokens, dashboard shell, and login surfaces.
3. **Backend OTP/Remember-Device Support**: The backend must either (a) support OTP, remember-device, and password-reset functionality, or (b) explicitly document that these features are unavailable. If unavailable, the UI controls must be hidden/disabled and a separate functional blocker issue must be filed.

**Current Status**: Backend OTP/remember-device support is **not yet confirmed**. This spec assumes these controls are **conditionally rendered** — visible only when backend support is confirmed. If backend support is unavailable, the login forms will display only email, password, and submit button, with a separate issue filed for the missing functionality.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Login Visual Parity (Priority: P1)

An administrator opens the Admin Console login page and sees a branded split layout with deep gradient/imagery panel on the left and login form on the right. The left panel displays the NetZeroCarbon logo, Thai project title, project purpose statement, and methodology reference (T-VER-P-METH-13-08). The right panel contains email, password, and submit button. OTP field, remember-device checkbox, and forgot-password link are rendered only when backend support is confirmed. All discrete design tokens (hex colors, gradients, shadow values, font families) match the client design artifact exactly. All pixel-level layout measurements (widths, heights, spacing, border-radius) match within the per-region tolerance values from spec 005.

**Why this priority**: Login is the first touchpoint for administrators. Visual parity establishes trust and brand consistency. This is the foundation for all Admin Console work.

**Independent Test**: Open `/admin/login` in a browser at 1280x720 and 1440x900 viewports. Compare side-by-side with the reference capture from spec 005. Measure sidebar width, header height, button dimensions, font sizes, line heights, colors, and spacing. All measurements must match within the per-region tolerance values derived from measured repeat-capture noise as defined in spec 005 (FR-009). Thai text must render with correct font and line height without clipping or overflow.

**Acceptance Scenarios**:

1. **Given** the administrator navigates to `/admin/login`, **When** the page loads, **Then** the split layout displays with the left panel showing NetZeroCarbon branding, Thai title, purpose, and methodology reference, and the right panel showing the login form with all required fields and actions.
2. **Given** the login page is displayed, **When** measured at 1280x720 viewport, **Then** all dimensions (panel widths, form field heights, button sizes, spacing) match the reference capture within the per-region tolerance values from spec 005.
3. **Given** the login page is displayed, **When** Thai text is rendered, **Then** the correct Thai font loads, line height matches the reference, and no text clipping or overflow occurs.
4. **Given** the login page is displayed, **When** comparing colors and shadows, **Then** all hex values, gradients, and neumorphic shadows match the reference exactly.

---

### User Story 2 - Sponsor Login Visual Parity (Priority: P1)

A sponsor user opens the Sponsor Portal login page and sees a branded split layout with "Sponsor Portal" eyebrow text, NetZeroCarbon logo, supported-area title, scoped-access explanation, methodology reference, and login form (email, password, audit notice). OTP field and remember-device checkbox are rendered only when backend support is confirmed. All discrete design tokens match the client design artifact exactly. All pixel-level layout measurements match within the per-region tolerance values from spec 005.

**Why this priority**: Sponsor login is the first touchpoint for sponsor users. Visual parity establishes trust and demonstrates professional presentation to partner organizations.

**Independent Test**: Open the Sponsor login page in a browser at 1280x720 and 1440x900 viewports. Compare side-by-side with the reference capture from spec 005. Measure all dimensions, colors, typography, and spacing. All measurements must match within the per-region tolerance values from spec 005. Thai text must render correctly.

**Acceptance Scenarios**:

1. **Given** the sponsor navigates to the Sponsor Portal login, **When** the page loads, **Then** the split layout displays with "Sponsor Portal" eyebrow, NetZeroCarbon branding, area title, scoped-access explanation, methodology reference, and login form with all required fields and audit notice.
2. **Given** the Sponsor login page is displayed, **When** measured at target viewports, **Then** all dimensions match the reference capture within the per-region tolerance values from spec 005.
3. **Given** the Sponsor login page is displayed, **When** Thai text is rendered, **Then** the correct Thai font loads and renders without clipping or overflow.

---

### User Story 3 - Admin Dashboard Shell Visual Parity (Priority: P2)

An authenticated administrator navigates the Admin Console dashboard. The sidebar displays seven primary navigation items (ภาพรวม, ตรวจสอบใบสมัคร, ตรวจสอบภาพ, เกษตรกร, ผู้สนับสนุน, รายงาน, ตั้งค่า) with correct icons, active/hover states, and spacing. The header shows the current page title, user menu, and notifications. The content area uses correct card styles, table layouts, and spacing. All visual elements match the client design artifact exactly.

**Why this priority**: The dashboard shell is the container for all Admin Console work. Visual parity ensures consistent navigation and professional presentation across all admin screens.

**Independent Test**: Log in to the Admin Console and navigate to each primary screen (overview, applications, evidence review, farmers, sponsors, reports, settings). At 1280x720 and 1440x900 viewports, compare sidebar width, header height, navigation items, active states, content padding, card styles, and table layouts against reference captures. All measurements must match within the per-region tolerance values from spec 005.

**Acceptance Scenarios**:

1. **Given** the administrator is logged in, **When** viewing any Admin Console page, **Then** the sidebar displays all seven navigation items with correct icons, spacing, and active/hover states matching the reference.
2. **Given** the administrator is logged in, **When** viewing the header, **Then** the page title, user menu, and notifications display with correct styling and spacing.
3. **Given** the administrator is logged in, **When** viewing content areas, **Then** cards, tables, and spacing match the reference exactly.
4. **Given** the administrator navigates between pages, **When** the active navigation item changes, **Then** the active state styling matches the reference.

---

### User Story 4 - Sponsor Dashboard Shell Visual Parity (Priority: P2)

An authenticated sponsor user navigates the Sponsor Portal dashboard. The sidebar displays three primary navigation items (ภาพรวม, พื้นที่, รายงานและใบรับรอง) with correct icons, active/hover states, and spacing. The header shows the current page title and user menu. The content area uses correct card styles, table layouts, and spacing. All visual elements match the client design artifact exactly. Sponsor-specific scopes (CPA-code masking, area restrictions) remain functional.

**Why this priority**: The sponsor dashboard shell is the container for all sponsor work. Visual parity ensures consistent navigation and professional presentation to partner organizations.

**Independent Test**: Log in to the Sponsor Portal and navigate to each primary screen (overview, areas, reports). At target viewports, compare sidebar width, header height, navigation items, active states, content padding, card styles, and table layouts against reference captures. All measurements must match within the per-region tolerance values from spec 005. Verify that sponsor scope restrictions remain functional.

**Acceptance Scenarios**:

1. **Given** the sponsor is logged in, **When** viewing any Sponsor Portal page, **Then** the sidebar displays all three navigation items with correct icons, spacing, and active/hover states matching the reference.
2. **Given** the sponsor is logged in, **When** viewing content areas, **Then** cards, tables, and spacing match the reference exactly.
3. **Given** the sponsor is logged in, **When** viewing farmer data, **Then** names and identity details are masked to CPA codes only, and sponsor scope restrictions remain functional.

---

### User Story 5 - Shared Design Token Consistency (Priority: P2)

Both Admin Console and Sponsor Portal use the same design tokens (colors, typography, spacing, shadows, border radius) consistently across all surfaces. The design token system is documented and enforced. LINE OA surfaces use LINE-native green where appropriate, while Admin and Sponsor surfaces use deep navy for privileged/login contexts and teal/navy for navigation.

**Why this priority**: Shared design tokens ensure visual consistency across all surfaces and make future design updates easier to apply systematically.

**Independent Test**: Inspect the CSS custom properties or design token definitions. Verify that both Admin and Sponsor dashboards reference the same token values for colors, typography, spacing, shadows, and border radius. Compare token values against the client design artifact. All tokens must match the reference exactly.

**Acceptance Scenarios**:

1. **Given** the design token system, **When** inspecting token definitions, **Then** both Admin and Sponsor dashboards reference the same token values.
2. **Given** the design token system, **When** comparing token values to the reference, **Then** all colors, typography, spacing, shadows, and border radius values match exactly.
3. **Given** the design token system, **When** viewing LINE OA surfaces, **Then** LINE-native green is used where appropriate, while Admin and Sponsor surfaces use deep navy and teal/navy as specified.

---

### User Story 6 - LIFF Regression (Priority: P3)

After applying dashboard shell and login visual changes, all LIFF destinations (registration, documents, camera, calendar, summary, fields, contact) continue to function correctly and maintain visual parity at LIFF viewports (390x844, 360x844, 430x844). No LIFF functionality is broken by dashboard shell changes.

**Why this priority**: LIFF destinations are critical farmer-facing workflows. Visual changes to shared components must not break LIFF functionality or visual parity.

**Independent Test**: Open each LIFF destination at 390x844, 360x844, and 430x844 viewports. Verify that all LIFF destinations load correctly, render Thai text properly, and maintain visual parity with reference captures. Test all LIFF actions (form submission, photo capture, navigation).

**Acceptance Scenarios**:

1. **Given** dashboard shell changes are applied, **When** opening LIFF destinations at target viewports, **Then** all seven LIFF destinations load correctly without errors.
2. **Given** LIFF destinations are open, **When** Thai text is rendered, **Then** the correct Thai font loads and renders without clipping or overflow.
3. **Given** LIFF destinations are open, **When** testing all LIFF actions, **Then** all actions (form submission, photo capture, navigation) function correctly.

---

### User Story 7 - Error, Loading, and Empty States (Priority: P3)

Users encounter error, loading, and empty states during normal dashboard usage. Login pages display error messages for failed authentication attempts. Dashboard pages show loading skeletons while data loads. Empty queues and lists display appropriate empty-state messaging. All states maintain visual parity with the design system and do not break layout.

**Why this priority**: Error, loading, and empty states are common user experiences. Visual consistency in these states maintains trust and professionalism.

**Independent Test**: Trigger error states (failed login, API errors), observe loading states (slow network), and view empty states (no data). If the #142 inventory manifest includes reference captures for these states, compare against those captures. Otherwise, follow the project design system (neumorphic white cards on #f0f4f8, deep navy for login surfaces, Thai font rendering) and verify layout integrity.

**Acceptance Scenarios**:

1. **Given** a user enters incorrect credentials, **When** login fails, **Then** an error message displays with correct styling, spacing, and Thai text rendering matching the design system.
2. **Given** a dashboard page is loading, **When** data is being fetched, **Then** a loading skeleton displays with correct dimensions and spacing matching the design system.
3. **Given** a queue or list is empty, **When** no data is available, **Then** an empty-state message displays with correct styling and Thai text rendering.

---

### Edge Cases

- When the viewport is narrower than 1280px (e.g., 1024px laptop), the sidebar MUST collapse to icons-only mode while maintaining all navigation functionality.
- When the viewport is wider than 1440px (e.g., 1920px monitor), the layout MUST scale gracefully without breaking proportions or leaving excessive whitespace.
- When Thai text is longer than expected (e.g., long farmer names, long plot descriptions), text MUST wrap or truncate gracefully without breaking layout or overlapping other elements.
- When a user has a slow connection and fonts take time to load, a fallback font stack MUST be defined to prevent layout shift, and fonts MUST load asynchronously.
- When a user has browser zoom enabled (e.g., 125%, 150%), the layout MUST remain usable and readable without horizontal scroll or clipped content.
- When a sponsor account has access to multiple areas, the area selector MUST display all authorized areas and allow switching without breaking visual parity.
- When an admin account has limited permissions (e.g., verifier role), navigation items MUST be hidden or disabled based on permissions without breaking the layout.
- The auditor role defined in REQUIREMENTS.md section 2.7 is **out of scope** for this spec. Auditor dashboard views, if required, will be addressed in a separate spec.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Admin login page MUST display a split layout with left branding panel and right login form. All discrete design tokens (hex colors, gradients, shadow values, font families) MUST match the client design artifact exactly. All pixel-level layout measurements (widths, heights, spacing, border-radius) MUST match within the per-region tolerance values from spec 005 (AD-AUTH-01).
- **FR-002**: Admin login form MUST include email, password, and submit button. OTP field, remember-device checkbox, and forgot-password link MUST be rendered only when backend support is confirmed; otherwise they MUST be hidden and a separate functional blocker issue filed (AD-AUTH-02).
- **FR-003**: Sponsor login page MUST display a split layout with "Sponsor Portal" eyebrow, branding panel, and login form. All discrete design tokens MUST match the client design artifact exactly. All pixel-level layout measurements MUST match within the per-region tolerance values from spec 005 (SP-AUTH-01).
- **FR-004**: Sponsor login form MUST include email, password, and audit notice. OTP field and remember-device checkbox MUST be rendered only when backend support is confirmed; otherwise they MUST be hidden and a separate functional blocker issue filed (SP-AUTH-01).
- **FR-005**: Admin dashboard sidebar MUST display seven primary navigation items (ภาพรวม, ตรวจสอบใบสมัคร, ตรวจสอบภาพ, เกษตรกร, ผู้สนับสนุน, รายงาน, ตั้งค่า) with correct icons and active/hover states (Admin Navigation).
- **FR-006**: Sponsor dashboard sidebar MUST display three primary navigation items (ภาพรวม, พื้นที่, รายงานและใบรับรอง) with correct icons and active/hover states (Sponsor Navigation).
- **FR-007**: Both Admin and Sponsor dashboards MUST use shared design tokens for colors, typography, spacing, shadows, and border radius (4.1 Visual Language).
- **FR-008**: Admin and Sponsor dashboards MUST use deep navy for privileged/login surfaces and navigation. LINE OA surfaces MUST use LINE-native green where appropriate (4.1 Visual Language).
- **FR-010**: LINE OA surfaces MUST use LINE-native green where appropriate, distinct from Admin/Sponsor teal/navy (4.1 Visual Language).
- **FR-011**: All dashboards MUST use the correct Thai font with proper line height and rendering (4.1 Visual Language).
- **FR-012**: All dashboards MUST render correctly at 1280x720, 1440x900, and LIFF viewports (390x844, 360x844, 430x844).
- **FR-013**: Sponsor dashboard MUST restrict data access to authorized areas only and mask farmer identity to CPA codes (SP-AUTH-02, 4.2 Security and Privacy).
- **FR-014**: All dashboards MUST provide neumorphic white cards on gray #f0f4f8 background as specified in the constitution (Design Consistency principle).
- **FR-015**: Material Symbols MUST load through Google Fonts `<link>` rather than `next/font/google` (Design Consistency principle, known pitfall).
- **FR-016**: All visual elements (dimensions, colors, typography, spacing, shadows) MUST match reference captures within the per-region tolerance values derived from measured repeat-capture noise as defined in spec 005 (FR-009).
- **FR-017**: Dashboard shell changes MUST NOT break existing API integrations, authentication, role boundaries, or carbon calculations.
- **FR-018**: Dashboard shell changes MUST NOT break LIFF functionality or visual parity.
- **FR-019**: Decorative effects MUST NOT be removed unless the reference design differs (per issue #144 bounded job).
- **FR-020**: Nonfunctional controls (OTP, remember-device, password-reset) MUST NOT be rendered unless the backend supports them. If backend support is unavailable, these controls MUST be hidden from the UI and a separate functional blocker issue MUST be filed (per issue #144 bounded job).

### Key Entities

- **Design Token**: A named value for color, typography, spacing, shadow, or border radius that is shared across Admin and Sponsor dashboards. Tokens are defined in CSS custom properties or a design token file and referenced by all dashboard components.
- **Dashboard Shell**: The common layout structure including sidebar navigation, header, and content area. The shell is shared across all dashboard pages and provides consistent navigation and branding.
- **Login Surface**: The branded login page for Admin or Sponsor portals, including split layout, branding panel, and login form.
- **Navigation Item**: A primary navigation entry in the sidebar, including icon, label, active/hover states, and routing target.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of Admin and Sponsor login pages match reference captures within the per-region tolerance values from spec 005 at 1280x720 and 1440x900 viewports, verified by side-by-side visual comparison with overlay/diff evidence.
- **SC-002**: 100% of Admin and Sponsor dashboard shells (sidebar, header, content area) match reference captures within the per-region tolerance values from spec 005 at target viewports, verified by visual comparison with overlay/diff evidence.
- **SC-003**: 100% of shared design tokens (colors, typography, spacing, shadows, border radius) match reference captures exactly, verified by token inspection and comparison.
- **SC-004**: Thai text renders correctly with proper font, line height, and no clipping or overflow in 100% of dashboard pages and LIFF destinations, verified by visual inspection at all target viewports.
- **SC-005**: All seven Admin navigation items and all three Sponsor navigation items display correct icons, labels, and active/hover states matching the reference, verified by visual comparison.
- **SC-006**: All seven LIFF destinations continue to function correctly and maintain visual parity after dashboard shell changes, verified by functional testing and visual comparison at LIFF viewports.
- **SC-007**: Sponsor data scope restrictions remain functional after visual changes, verified by testing that sponsor accounts only see authorized areas and CPA-coded farmer data.
- **SC-008**: Zero regressions in existing API integrations, authentication, role boundaries, or carbon calculations after dashboard shell changes, verified by running the full test suite (unit + integration + e2e).
- **SC-009**: Visual comparison evidence (reference, before, after, overlay/diff) is provided for every screen and state enumerated in the issue #142 inventory manifest, with viewport/DPR, fixture ID, and remaining discrepancies documented.
- **SC-010**: All dashboard pages remain usable with browser zoom enabled at 125% and 150%, with no horizontal scroll or clipped content, verified by manual inspection at target viewports.

## Assumptions

- Reference captures from spec 005 are available and valid for comparison. If reference captures are missing or invalid, this spec is blocked until spec 005 is complete.
- The client design artifacts (Admin, Sponsor, LINE OA) are the authoritative visual specification. Any contradictions between the design artifacts and REQUIREMENTS.md must be reported explicitly.
- Existing API integrations, authentication, role boundaries, and carbon calculations are functional and must not be broken by visual changes.
- The Thai font is available via Google Fonts and can be loaded through `<link>` tags without breaking the static build.
- Material Symbols are available via Google Fonts and can be loaded through `<link>` tags without breaking the static build.
- The design token system can be implemented using CSS custom properties without requiring a build-time token transformation tool.
- LIFF destinations are functional and have reference captures available for comparison. If LIFF reference captures are missing, this spec is blocked until spec 005 is complete.
- Backend support for OTP, remember-device, and password-reset is either already implemented or explicitly out of scope for this visual parity work. If unavailable, these controls must not be added to the UI.
- Visual tolerance is determined by spec 005's per-region noise measurement approach, not a fixed global threshold.
- Visual comparison will be performed using browser-use (control-browser MCP) as required by AGENTS.md, not Playwright MCP or other tools.
- Dashboard shell changes are scoped to frontend components and CSS; backend API changes are out of scope unless required to support visual features (e.g., area selector for sponsors with multiple areas).
- The auditor role (defined in REQUIREMENTS.md section 2.7) is out of scope for this spec. If auditor dashboard views are required, they will be addressed in a separate spec.
