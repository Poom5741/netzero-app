# Feature Specification: Admin Dashboard Visual Polish

**Feature Branch**: `008-admin-dashboard-visual-polish`

**Created**: 2026-09-16

**Status**: Draft

**Input**: User description: "Admin dashboard still looks poor from latest speckit implementation — it didn't touch the dashboard visual design. Bring the admin dashboard in line with the approved admin design references."

**Reference authority**: The approved project baseline is `visual-qa-screenshots/design-admin-full.png` as identified by `REQUIREMENTS.md`. The Stitch artifact `stitch_netzerocarbon_platform/admin_review_dashboard/screen.png` is a supplemental visual reference for the evidence-review composition and interaction treatments. Where they differ, the approved project baseline and existing requirements take precedence.

**Scope**: This is a visual refinement of the existing Admin Console overview, applications, evidence, farmers, sponsors, reports, settings, and shared shell. Existing authentication, role-based visibility, evidence decisions, request-retake flow, rejection reasons, review history, audit records, loading/error states, and data behavior MUST remain intact and be visually verified; no new business workflow is introduced.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Reviews Evidence with Visual Confidence (Priority: P1)

An admin opens the evidence review page and immediately sees a polished photo card grid where each card shows the farm photo with a glassmorphic AI confidence badge overlaid on the image, a gradient label at the bottom with the farm ID and province, and a smooth lift animation on hover. When the admin clicks a card, it gets a clear selection state (outline + ring). The side detail panel uses neumorphic inset shadows on the AI analysis section, shows the farmer profile with an avatar, and presents claymorphic Approve/Reject buttons with gradient backgrounds, inner white highlights, and hover-lift feedback. The GPS section shows an actual map thumbnail instead of raw text coordinates.

**Why this priority**: The evidence review page is the admin's primary daily workflow. If it looks polished and matches the design reference, the admin trusts the system and works faster. This is the single most visible surface.

**Independent Test**: Open the evidence review page in a browser. Verify: (1) photo cards show real images with glassmorphic AI badges, (2) hover causes a visible lift animation, (3) clicking a card shows a selection ring, (4) the detail panel has inset shadows on the AI analysis block, (5) Approve/Reject buttons are claymorphic with gradient + inner highlight, (6) GPS section shows a map image with coordinate overlay.

**Acceptance Scenarios**:

1. **Given** the admin navigates to the evidence review page, **When** the page loads, **Then** photo cards display with glassmorphic AI confidence badges overlaid on the top-left of each image, and farm ID/province labels with a gradient overlay at the bottom.
2. **Given** the admin hovers over a photo card, **When** the cursor enters the card area, **Then** the card lifts upward with an enhanced shadow (smooth 300ms transition).
3. **Given** the admin clicks a photo card, **When** the card is selected, **Then** it shows a visible outline and ring indicating selection, and the detail side panel populates with that farm's data.
4. **Given** the detail panel is open, **When** the admin views the AI analysis section, **Then** the section has a subtle inset shadow giving it a recessed/neumorphic appearance, with progress bars for each analysis metric.
5. **Given** the detail panel shows action buttons, **When** the admin sees the Approve and Reject buttons, **Then** they have gradient backgrounds (green for Approve, red for Reject), inner white highlight shadows (claymorphic), and lift slightly on hover.
6. **Given** the detail panel shows geolocation evidence, **When** the admin views the GPS section, **Then** a map thumbnail image is displayed with coordinate and GPS-match badges overlaid at the bottom, rather than plain text coordinates.
7. **Given** an evidence item requires another submission, **When** the admin chooses Request Retake and enters a reason, **Then** the reason is saved, shown in the review history with reviewer and timestamp, and presented in farmer-communicable language without changing the existing decision workflow.
8. **Given** an admin role is not authorized to view personal identity details, **When** the detail panel or table renders, **Then** the visual refresh does not expose restricted names or identity data.

---

### User Story 2 - Admin Overview Dashboard Feels Modern (Priority: P2)

An admin opens the overview dashboard and sees KPI tiles with elevated card styling, a proper chart visualization for carbon credits (not hand-rolled CSS bars), and well-formatted tables with hover states and clear typography. The overall page uses consistent spacing, design tokens, and subtle shadows that match the project's modern aesthetic.

**Why this priority**: The overview is the landing page and first impression. It needs to look professional but is less critical than the daily evidence review workflow.

**Independent Test**: Open the admin overview page. Verify: (1) KPI tiles have elevated card shadows, (2) the credit chart uses a proper visualization (not plain CSS bars), (3) tables have hover row highlighting, (4) overall spacing and typography match the design token system.

**Acceptance Scenarios**:

1. **Given** the admin navigates to the overview page, **When** the page loads, **Then** four KPI tiles display with elevated card shadows and clear metric values.
2. **Given** the overview page shows carbon credit data, **When** the admin views the chart area, **Then** a proper bar or area chart renders with labeled axes, gridlines, and season labels (not plain colored divs).
3. **Given** the overview page shows data tables, **When** the admin hovers over a table row, **Then** the row highlights with a subtle background change.
4. **Given** the overview page loads, **When** the admin scans the layout, **Then** consistent spacing (design token scale), typography (Plus Jakarta Sans / Sarabun), and shadow elevation levels are visible throughout.
5. **Given** the overview contains credit data, **When** the admin views the visualization, **Then** verified credits and estimates are visibly distinguished and the data can be read by province/area and season.
6. **Given** the visual refresh is deployed, **When** an admin signs in, encounters loading or error states, or performs an existing operational action, **Then** authentication, role-based visibility, loading/error feedback, and existing data behavior remain usable and unchanged.

---

### User Story 3 - Filter Tabs Match Design Reference (Priority: P2)

An admin uses the filter tabs on the evidence review page and sees a pill-shaped segmented control with a neumorphic container. The active tab has a solid primary background with smooth transition, and inactive tabs show subtle hover states.

**Why this priority**: Filter tabs are used on every evidence review session. They should feel tactile and responsive, matching the reference's pill-segmented design.

**Independent Test**: Open the evidence review page. Verify: (1) filter tabs are in a rounded pill container, (2) the active tab has a solid fill with smooth transition, (3) inactive tabs have hover feedback.

**Acceptance Scenarios**:

1. **Given** the evidence review page loads, **When** the admin sees the filter tabs, **Then** they are contained in a rounded pill-shaped bar with subtle background.
2. **Given** the admin clicks a different filter tab, **When** the tab changes, **Then** the active state transitions smoothly with a solid primary background.

---

### User Story 4 - Sidebar Navigation Is Clean and Focused (Priority: P3)

An admin sees a sidebar with clear navigation items, proper active state highlighting, and a user chip at the bottom. The sidebar uses the project's navy color and has smooth hover transitions.

**Why this priority**: The sidebar is always visible but rarely the focus. It should be clean and professional without being the primary investment.

**Independent Test**: Look at the sidebar on any admin page. Verify: (1) navy background, (2) active item has clear primary-container highlight, (3) hover transitions are smooth, (4) user chip shows at the bottom.

**Acceptance Scenarios**:

1. **Given** any admin page loads, **When** the admin sees the sidebar, **Then** it has a dark navy background with the NetZero logo and clean navigation items.
2. **Given** the admin hovers over a non-active nav item, **When** the cursor enters the item, **Then** a subtle white-opacity background appears with a smooth transition.
3. **Given** the admin views the current page's nav item, **When** they look at the active state, **Then** it has a distinct primary-container background with bold text.

---

### Edge Cases

- What happens when a photo image fails to load? The card should show a graceful placeholder (icon + farm ID) rather than a broken image icon, maintaining the card's visual weight.
- What happens when GPS coordinates are missing or invalid? The map section should show a "No GPS data" placeholder with the same visual treatment as a valid map, not break the layout.
- What happens on tablet viewport (768px–1024px)? The photo grid should reflow to 2 columns, the detail panel should become a full-screen overlay or slide-up sheet, and the sidebar should collapse to icons-only or a hamburger menu.
- What happens when the AI analysis has no data? The progress bars section should show a "Pending analysis" state rather than empty bars.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Photo cards MUST display the actual farm photo with a glassmorphic AI confidence badge overlaid on the top-left corner (semi-transparent background with backdrop blur).
- **FR-002**: Photo cards MUST show a gradient overlay at the bottom with the farm ID and province name in white text.
- **FR-003**: Photo cards MUST animate with a vertical lift and shadow enhancement on hover (smooth transition, approximately 300ms).
- **FR-004**: Photo cards MUST show a clear selection state (outline + ring) when clicked, indicating which farm's details are shown in the side panel.
- **FR-005**: The detail side panel MUST use neumorphic inset shadows on the AI analysis section to create a recessed visual effect.
- **FR-006**: The Approve, Reject, and Request Retake actions MUST retain their existing behavior and use claymorphic styling: gradient backgrounds, outer colored shadows, and inner white highlight shadows. Buttons MUST lift slightly on hover and expose an equivalent visible focus state.
- **FR-007**: The GPS/geolocation section MUST display a map thumbnail image (not raw text coordinates) with coordinate and match-status badges overlaid at the bottom; unavailable map data MUST show a clearly labeled visual placeholder.
- **FR-008**: The overview page chart MUST render as a proper data visualization with labeled axes and gridlines, clearly distinguishing verified credits from estimates and showing province/area and season breakdowns, not plain colored div elements.
- **FR-009**: Evidence review MUST continue to show crop, plot, round, GPS, timestamp, water level, evidence status, reviewer, timestamp, decision, reason, and prior status wherever those existing details are available.
- **FR-010**: Reject and Request Retake actions MUST preserve reason capture and present the saved reason in a farmer-communicable form; existing audit records and role-based data visibility MUST remain unchanged.
- **FR-011**: Data tables across all admin pages (overview, applications, farmers, sponsors, reports, and settings) MUST have row hover highlighting for scannability.
- **FR-012**: Filter tabs MUST use a pill-shaped segmented control with smooth active-state transitions.
- **FR-013**: All visual treatments MUST use the project's established design tokens for colors, spacing, typography, border radius, and shadow elevation.
- **FR-014**: Image load failures MUST show a graceful placeholder that maintains the card's visual weight and displays the farm ID.
- **FR-015**: The layout MUST be responsive: photo grid reflows to 2 columns at tablet widths (768–1024px), the detail panel adapts to a full-screen overlay or slide-up sheet below desktop width, and the sidebar collapses to an accessible compact navigation.
- **FR-016**: The visual refresh MUST be regression-checked on overview, applications, evidence, farmers, sponsors, reports, and settings for existing authentication, role-based visibility, evidence decisions, Request Retake reason capture, review history, audit records, loading states, error states, and existing data behavior; checks MUST confirm these workflows and restricted data are unchanged, without adding or removing workflow steps.

### Key Entities

- **Photo Card**: Represents a single piece of submitted photo evidence. Attributes: image, farm ID, province, AI confidence status (high confidence / flagged / pass), selection state.
- **Detail Panel**: Shows the full review context for a selected photo card. Attributes: farmer profile, AI analysis results with progress bars, GPS map, action buttons.
- **KPI Tile**: A summary metric card on the overview page. Attributes: label, value, variant (elevated / flat / accent), optional trend indicator.
- **Filter Tab**: A segmented control option for filtering the review queue. Attributes: label, count, active state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a browser-use check at the 1280×800 desktop viewport using the seeded pending-review data, an admin identifies the AI confidence status of every visible photo card within 1 second of the evidence page becoming interactive, without opening a detail panel.
- **SC-002**: At the 1280×800 desktop viewport, a reviewer compares the rendered evidence page against `visual-qa-screenshots/design-admin-full.png` using an inventory of 10 visual regions (shell, header, queue heading, filter control, photo grid, selected card, detail header, analysis panel, map section, action area); at least 8 regions MUST meet the reference's composition, hierarchy, and interaction treatment. The Stitch screenshot is consulted only for evidence-review treatment details not represented in the approved baseline.
- **SC-003**: During the same browser-use check, cards, buttons, and tabs show a visible hover, focus, or active state within 100ms of the interaction; hover transitions complete within 300ms.
- **SC-004**: On a desktop test run with a throttled 10 Mbps connection and the seeded dashboard data, the overview page becomes usable and displays its KPI tiles, chart, and tables within 3 seconds of navigation.
- **SC-005**: The same visual review records no more than 3 minor discrepancies across the 10-region inventory; discrepancies are limited to spacing, color shade, or icon differences and do not include missing regions, missing states, or broken workflows.

## Assumptions

- The existing design token system in globals.css (colors, spacing, typography, shadows) is sufficient to achieve the design reference look without adding new tokens. If new tokens are needed (e.g., claymorphic shadow values), they should be added as extensions of the existing system.
- The existing component structure (DashboardShell, DashboardSidebar, DashboardHeader, ReviewCard, ReviewDetailPanel, PrecisionCard, FilterTabs) will be enhanced in place, not replaced with new components.
- The chart visualization on the overview page can use a lightweight approach (CSS + SVG) without introducing a heavy chart library, consistent with the YAGNI principle.
- Map thumbnails for GPS can use a static map image service or a pre-generated map snapshot; real-time interactive maps are out of scope.
- The admin dashboard is primarily used on desktop (1280px+), with tablet (768px+) as a secondary viewport. Mobile phone is not a target for the admin dashboard (admins use LINE chat on phones for quick actions).
