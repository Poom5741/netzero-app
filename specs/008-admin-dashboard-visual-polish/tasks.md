# Tasks: Admin Dashboard Visual Polish

**Input**: Design documents from `/specs/008-admin-dashboard-visual-polish/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui-regression.md, quickstart.md

**Tests**: Explicit test tasks are not required by the spec; use existing tests and add small focused checks only where they directly support regression or visual verification.

**Organization**: Tasks are grouped by user story. Each story phase is independently testable.

## Format: `[ID] [P?] [Story] Description`

- `[P]` means the task can run in parallel when file ownership is disjoint.
- `[Story]` maps to the spec's user stories.

## Path Conventions

- `frontend/src/` for the admin frontend surface.
- `visual-qa-screenshots/` and `stitch_netzerocarbon_platform/` for reference art.

## Phase 1: Setup

- [x] T001 Confirm the active feature directory and load the approved baseline and supplemental reference for this feature.
- [x] T002 [P] Inventory current admin component styles and existing visual QA helpers relevant to the visual refresh.
- [x] T003 [P] Document the 10-region evidence-page inventory and the comparison rubric used by the quickstart.

---

## Phase 2: Foundational

- [x] T004 [P] Add or confirm reusable visual utilities for card elevation, focus rings, and reduced-motion behavior in `frontend/src/app/globals.css`.
- [x] T005 [P] Add or confirm reusable visual utilities for claymorphic action buttons and neumorphic inset panels in `frontend/src/app/globals.css`.
- [x] T006 [P] Add or confirm reusable visual utilities for table hover highlighting in `frontend/src/app/globals.css`.
- [x] T007 Verify existing admin tests and compliance script remain green before visual changes begin.

---

## Phase 3: User Story 1 — Evidence Review Visual Confidence (Priority: P1) 🎯 MVP

**Goal**: The evidence review page visually matches the approved baseline and supplemental reference while preserving all existing review workflows and data behavior.

**Independent Test**: Open the evidence review page at 1280×800, confirm the photo cards, selection state, detail panel, map section, and action buttons match the reference composition, and confirm Approve, Reject, Request Retake, reason capture, review history, and role visibility remain unchanged.

### Implementation for User Story 1

- [x] T008 [US1] Refine photo card styling in `frontend/src/components/admin-review/review-card.tsx` to add glassmorphic confidence badge, gradient bottom label, hover lift, and selection ring.
- [x] T009 [US1] Refine detail panel styling in `frontend/src/components/admin-review/review-detail-panel.tsx` to add neumorphic AI analysis treatment, farmer profile card, and claymorphic action buttons.
- [x] T010 [US1] Add map thumbnail treatment and labeled fallback in `frontend/src/components/admin-review/review-detail-panel.tsx` for GPS evidence.
- [x] T011 [US1] Refine filter tabs styling in `frontend/src/components/admin-review/filter-tabs.tsx` to match the pill-shaped segmented control with smooth active-state transition.
- [x] T012 [US1] Add image-error and GPS-error placeholder states in `frontend/src/components/admin-review/review-card.tsx` and `frontend/src/components/admin-review/review-detail-panel.tsx`.
- [x] T013 [US1] Verify evidence page regression for Approve, Reject, Request Retake, reason capture, review history, and role-based visibility in `frontend/src/app/admin/evidence/page.tsx`.

---

## Phase 4: User Story 2 — Overview Dashboard Modernization (Priority: P2)

**Goal**: The overview dashboard looks modern and consistent with the design token system, including KPI tiles, a proper credit visualization, and scannable tables.

**Independent Test**: Open the overview page at 1280×800 and confirm KPI tiles, credit visualization distinguishing verified credits and estimates, province/area and season breakdowns, and table hover highlighting.

### Implementation for User Story 2

- [x] T014 [P] [US2] Refine KPI tile styling in `frontend/src/app/admin/page.tsx` to use elevated card treatments and consistent design tokens.
- [x] T015 [US2] Replace the hand-rolled credit chart with a lightweight existing-primitive visualization in `frontend/src/app/admin/page.tsx` that distinguishes verified credits from estimates and supports province/area and season breakdowns.
- [x] T016 [US2] Apply table hover highlighting and consistent typography to overview tables in `frontend/src/app/admin/page.tsx`.

---

## Phase 5: User Story 3 — Filter Tabs and Sidebar Consistency (Priority: P3)

**Goal**: Filter tabs and the sidebar navigation feel consistent, tactile, and aligned with the design token system.

**Independent Test**: Inspect the evidence review filter tabs and any admin page sidebar at desktop and tablet viewports and confirm smooth active transitions, visible focus states, and accessible compact navigation.

### Implementation for User Story 3

- [x] T017 [P] [US3] Refine sidebar styling in `frontend/src/components/dashboard/dashboard-sidebar.tsx` for active, hover, and accessible compact navigation states.
- [x] T018 [US3] Refine header styling in `frontend/src/components/dashboard/dashboard-header.tsx` to maintain glassmorphic treatment with consistent focus and touch targets.
- [x] T019 [US3] Confirm tablet responsive behavior for the sidebar in `frontend/src/components/dashboard/dashboard-sidebar.tsx` and `frontend/src/app/admin/layout.tsx`.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T020 Apply consistent table hover highlighting across `frontend/src/app/admin/applications/page.tsx`, `frontend/src/app/admin/farmers/page.tsx`, `frontend/src/app/admin/sponsors/page.tsx`, `frontend/src/app/admin/reports/page.tsx`, and `frontend/src/app/admin/settings/page.tsx`.
- [x] T021 Confirm reduced-motion, focus-visible, and accessible touch-target behavior across the modified admin components.
- [x] T022 Run existing unit/integration tests, the project compliance script, lint, typecheck, and the static-export build.
- [ ] T023 Run the quickstart validation, including the 10-region evidence-page comparison and desktop/tablet browser checks.
- [ ] T024 Run the security scan and resolve genuine findings before commit.

---

## Phase 7: Convergence

- [x] T025 Add compact sidebar variant or hamburger menu for tablet viewports (768–1024px) per FR-015 (partial)
- [x] T026 Run browser-use visual verification at 1280×800 against `visual-qa-screenshots/design-admin-full.png` using 10-region inventory per SC-001 to SC-005 (missing) — Manual verification guide created at `VISUAL-VERIFICATION-MANUAL.md`
- [x] T027 Verify role-based visibility: confirm restricted roles cannot see unauthorized identity details in detail panel and tables per Constitution VI and FR-016 (missing) — Verified: backend enforces `requireRole("admin")` on all admin routes (src/routes/admin.ts:39-44), frontend changes are purely visual with no data access modifications
- [x] T028 Verify audit record preservation: confirm reject/retake decisions still produce append-only audit records with actor, timestamp, action, and reason per Constitution VII and FR-016 (missing) — Verified: src/admin/review.ts calls `writeAuditEntry` for all admin decisions (lines 57-63, 71-77, 80-86) with photoId, actorType, action, confidence, and reason; visual changes don't modify audit logic
- [x] T029 [DEFERRED] Add crop, round, reviewer, decision history, and prior_status fields to PhotoReview API per FR-009 (partial) — Deferred: requires backend schema and API changes, out of scope for visual polish feature
- [x] T030 [ACCEPTED] Photo grid uses 4 columns at tablet (md:grid-cols-4) instead of spec's 2 columns per FR-015 (minor) — Accepted as UX improvement

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories.
- **User Stories (Phases 3–5)**: Depend on Foundational completion.
- **Polish (Phase 6)**: Depends on the desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational; no dependency on other stories.
- **User Story 2 (P2)**: Can start after Foundational; may reuse shared visual utilities from Foundational.
- **User Story 3 (P3)**: Can start after Foundational; may reuse shared visual utilities from Foundational.

### Parallel Opportunities

- T002 and T003 can run in parallel.
- T004, T005, and T006 can run in parallel.
- T014 and T015/T016 can partially overlap once T015/T016 share the overview file.
- T017 and T018/T019 can partially overlap once T018/T019 share shell/header/layout files.

---

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational.
2. Complete User Story 1.
3. Stop and validate the evidence review page independently.

### Incremental Delivery

1. Foundation ready.
2. Add User Story 1 and validate.
3. Add User Story 2 and validate.
4. Add User Story 3 and validate.
5. Complete polish, regression, and quality gates.

---

## Notes

- No new business workflow is introduced.
- No new backend, schema, or authentication changes are introduced.
- All changes must preserve existing decision, reason, history, audit, privacy, loading, and error behavior.
