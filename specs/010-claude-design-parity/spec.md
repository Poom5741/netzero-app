# Feature Specification: Claude Multi-Page Design Parity

**Feature Branch**: `010-claude-design-parity`
**Created**: 2026-09-17
**Status**: Draft
**Input**: User description: "Apply the Claude multi-page design artifacts to the existing codebase, after settling the scope and artifact mapping."

## User Scenarios & Testing

### User Story 1 - Review the approved design reference (Priority: P1)

As a product or engineering reviewer, I want every implemented Admin and Sponsor page tied to the correct extracted Claude artifact source so that visual comparisons use the right page, state, and viewport rather than an ambiguous screenshot.

**Why this priority**: A trustworthy reference is the foundation for every visual change. Without it, visual parity claims are not verifiable.

**Independent Test**: Select any in-scope route, open its labeled reference entry, and verify that the source artifact, page name, route, state, viewport, and capture provenance are present and consistent.

**Acceptance Scenarios**:

1. **Given** an in-scope Admin or Sponsor route, **When** a reviewer looks it up in the design reference map, **Then** exactly one labeled artifact page and source module are identified.
2. **Given** a reference capture, **When** the reviewer inspects its metadata, **Then** the source, surface, page, state, viewport, capture date, and readiness status are recorded.
3. **Given** a missing route or a route without a source reference, **When** a reviewer checks the map, **Then** it is marked deferred or reference-only rather than reported as complete.

---

### User Story 2 - Use a consistent visual foundation (Priority: P1)

As an Admin or Sponsor user, I want the shared login, navigation, header, typography, colors, spacing, and surface treatments to feel like one coherent product across pages.

**Why this priority**: Shared visual primitives affect every page and provide the highest parity improvement with the least duplicated work.

**Independent Test**: Visit Admin login, Sponsor login, an Admin dashboard route, and a Sponsor dashboard route at desktop and mobile widths; verify that shared shell and login elements use the same approved visual language and remain usable.

**Acceptance Scenarios**:

1. **Given** an Admin or Sponsor login page, **When** the page loads on desktop, **Then** it presents the approved split branding/form composition with the Claude source palette and readable bilingual copy.
2. **Given** an Admin or Sponsor dashboard route on a desktop viewport, **When** the page loads, **Then** the sidebar, header, content offset, typography, and surface treatments follow the approved shared foundation.
3. **Given** the same dashboard route on a mobile or tablet viewport, **When** the page loads, **Then** navigation and primary actions remain accessible without horizontal clipping or unusable controls.
4. **Given** a Thai-language text block, **When** it is rendered, **Then** its line height and font fallback preserve readability and do not overlap or clip combining marks.

---

### User Story 3 - Compare implemented pages without changing behavior (Priority: P1)

As a product owner, I want existing Admin and Sponsor workflows to visually approach the Claude references without losing current data, permissions, auditability, or error behavior.

**Why this priority**: Visual parity is only valuable if the working product remains safe and functional.

**Independent Test**: Exercise each in-scope route using existing fixtures and role restrictions, then compare the resulting page against its labeled Claude reference at the supported viewports.

**Acceptance Scenarios**:

1. **Given** an existing Admin route for overview, review/evidence, farmers, reports, sponsors, or settings, **When** the visual foundation and page polish are applied, **Then** the existing route remains reachable and its current data and actions remain available.
2. **Given** an existing Sponsor route for overview, areas, or reports, **When** the visual foundation and page polish are applied, **Then** sponsor scope remains limited to assigned areas and CPA-code presentation remains intact.
3. **Given** an approval, rejection, hold, or other privileged decision, **When** the page is used after visual changes, **Then** the existing reason, audit, and unresolved-evidence behavior remains unchanged.
4. **Given** a failed data load or empty result, **When** the route is opened, **Then** an understandable loading, error, or empty state remains visible and usable.

---

### User Story 4 - Verify parity with evidence (Priority: P2)

As a reviewer, I want repeatable source and implementation captures for the implemented routes so that visual regressions can be identified before release.

**Why this priority**: Evidence turns subjective design review into a repeatable quality gate.

**Independent Test**: Capture each selected source reference and implementation route at the agreed desktop and mobile viewports, then run the existing comparison and provenance checks.

**Acceptance Scenarios**:

1. **Given** an in-scope route and state, **When** a capture is generated, **Then** it has a deterministic filename and provenance record tied to the route and source reference.
2. **Given** two captures made with the same inputs, **When** they are compared, **Then** differences caused only by known capture noise are excluded and unexplained differences are reported.
3. **Given** a visual mismatch, **When** the reviewer opens the report, **Then** the report identifies the affected surface, route, viewport, and comparison artifact.

### Edge Cases

- If a Claude bundle contains multiple screens in one module, the reference map must label the screen separately while retaining the shared source module.
- If an extracted bundle depends on artifact-only globals, fixtures, or relative assets, it must remain a reference render and must not be imported into production application code.
- If a source font or image cannot be loaded during capture, the capture must record the missing asset and must not be presented as a clean parity pass.
- If a route is implemented but no corresponding Claude screen exists, it remains outside visual parity scope and is labeled as such.
- If a route is present in the artifact but missing from the application, it is deferred rather than introduced as an unrequested new feature.
- If a visual change would alter sponsor data scope, farmer privacy, audit records, or LINE evidence rules, the behavioral change is rejected as out of scope.
- If a viewport is too narrow for the source layout, the page must preserve readable content and accessible controls rather than forcing desktop geometry.

## Requirements

### Functional Requirements

- **FR-001**: The project MUST maintain one authoritative map linking each in-scope surface, route, page/state label, artifact source, and source module.
- **FR-002**: The project MUST distinguish source-reference captures from implementation captures and MUST record provenance for both.
- **FR-003**: The project MUST provide source-reference captures for Admin login, Admin overview, Admin review/evidence, Admin farmers, Admin reports, Admin sponsors, Admin settings, Sponsor login, Sponsor overview, Sponsor areas, and Sponsor reports, subject to documented asset-readiness status.
- **FR-004**: The shared Admin and Sponsor visual foundation MUST use the Claude source authority for visual tokens: 232px desktop sidebar, navy `#061E5C`, teal primary `#028E91`, Fira Sans/Noto Sans Thai/Fira Mono family, and source shadow treatments, unless an explicit product or accessibility constraint requires an approved exception.
- **FR-005**: The shared login experience MUST provide the source-aligned split branding/form composition for both Admin and Sponsor roles while retaining the existing authentication submission, error, loading, and redirect behavior.
- **FR-006**: The shared dashboard shell MUST provide source-aligned sidebar, header, content spacing, active navigation, responsive behavior, and accessible labels for both Admin and Sponsor roles.
- **FR-007**: Existing in-scope Admin pages MUST receive source-aligned visual treatment for overview, review/evidence, farmers, reports, sponsors, and settings without introducing new business workflows.
- **FR-008**: Existing in-scope Sponsor pages MUST receive source-aligned visual treatment for overview, areas, and reports without exposing data outside the sponsor's assigned scope.
- **FR-009**: The visual work MUST preserve current API behavior, data states, audit records, decision reasons, privacy boundaries, and evidence-verification rules.
- **FR-010**: The visual work MUST preserve Thai readability, keyboard access, semantic labels, and minimum usable touch targets on supported viewports.
- **FR-011**: The project MUST record loading, empty, error, missing-asset, and font-readiness status for reference captures where those conditions affect visual trustworthiness.
- **FR-012**: The project MUST verify visual changes using repeatable captures and comparison reports for the selected in-scope routes at desktop and supported mobile/tablet viewports.
- **FR-013**: Extracted Claude runtime bundles, artifact fixtures, browser globals, and UUID-named binary resources MUST remain reference-only and MUST NOT become production dependencies.
- **FR-014**: The project MUST label Admin Import, Map, ChatMode, and Charts screens; LIFF Fields, Contact, and Baseline pages; and native LINE Flex/rich-menu rendering as deferred or reference-only unless a separate approved scope is created.
- **FR-015**: Backend OTP implementation, unrelated R2/Workers AI/webhook/CI work, and other QA remediation not required for the visual gate MUST remain outside this feature.

### Key Entities

- **Design Artifact**: A Claude-provided HTML bundle and its extracted source/resource graph.
- **Reference Page**: A human-labeled surface/page/state entry linked to one artifact source module and route or deferred status.
- **Reference Capture**: A deterministic image plus provenance describing source, viewport, state, and asset readiness.
- **Implementation Capture**: A deterministic image of the current application route used for comparison against a reference capture.
- **Visual Token Set**: The approved colors, typography, spacing, geometry, radii, and shadow rules used by shared surfaces.
- **Scope Record**: The route status indicating implemented, partial, deferred, or reference-only coverage.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of the 11 in-scope Admin and Sponsor page groups have a unique labeled artifact/source mapping before visual implementation begins.
- **SC-002**: 100% of in-scope reference captures include source, route/page label, state, viewport, capture date, and asset-readiness metadata.
- **SC-003**: Admin and Sponsor users can reach every currently supported in-scope route at desktop and mobile/tablet viewports without horizontal clipping or inaccessible primary actions.
- **SC-004**: Existing automated route, privacy, decision, and error-state checks remain green after the visual changes, with no new behavioral regression introduced by this feature.
- **SC-005**: Every in-scope route has a repeatable comparison result at the agreed desktop viewport and at least one supported narrow viewport; unexplained mismatches are documented rather than silently accepted.
- **SC-006**: No deferred or reference-only page is reported as implemented Claude parity, and no extracted artifact runtime or fixture is required to build or run the production application.
- **SC-007**: Reviewers can identify the source of any reported visual mismatch in under five minutes using the artifact map, capture filename, and provenance record.

## Assumptions

- Existing route behavior, authentication endpoints, data fixtures, and role restrictions are reused rather than redesigned.
- The Claude artifact bundles in `visual-qa-screenshots/` are available locally and are the visual source authority for this feature.
- Historical full-page PNGs remain supplementary documentation and are not treated as pixel-accurate ground truth.
- The first release targets already implemented Admin and Sponsor routes; missing screens require a separate feature specification.
- Desktop parity uses the existing supported desktop capture widths, and narrow parity uses the existing supported mobile/tablet widths where the route can be rendered reliably.
- Visual comparison may identify differences that require follow-up work; a documented mismatch is preferable to a false pass.
- Existing QA and security checks from prior specs are prerequisites or gates when relevant, but unrelated QA/integration scope is not absorbed into this feature.
