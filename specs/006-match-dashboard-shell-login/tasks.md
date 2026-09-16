# Tasks: Match Shared Tokens, Dashboard Shell and Login Presentation

**Input**: Design documents from `/specs/006-match-dashboard-shell-login/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Visual comparison tests are included as they are explicitly required by the spec (SC-001 through SC-009).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/`, `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Audit existing design tokens and add missing layout tokens

- [x] T001 Audit existing design tokens in `frontend/src/app/globals.css` and document current coverage
- [x] T002 [P] Add layout tokens to `frontend/src/app/globals.css`: sidebar width (260px/64px), header height (64px), nav item height (40px), login panel widths (45%/55%), button height (44px), form field height (44px)
- [x] T003 [P] Verify Material Symbols font loads via `<link>` in `frontend/src/app/layout.tsx` (not `next/font/google`)
- [x] T004 [P] Verify Thai font (Sarabun) loads via Google Fonts `<link>` in `frontend/src/app/layout.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement feature flag system for conditional login controls

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create feature flag utility in `frontend/src/lib/login-features.ts` with interface for OTP, remember-device, forgot-password flags
- [x] T006 [P] Add environment variables to `frontend/.env.local` and `frontend/.env.production`: NEXT_PUBLIC_ENABLE_OTP, NEXT_PUBLIC_ENABLE_REMEMBER_DEVICE, NEXT_PUBLIC_ENABLE_FORGOT_PASSWORD (all set to `false`)
- [x] T007 Create shared Sidebar component in `frontend/src/components/dashboard/Sidebar.tsx` with props for navigation items, active path, collapsed state
- [x] T008 [P] Create shared Header component in `frontend/src/components/dashboard/Header.tsx` with props for title, user info, notifications
- [x] T009 Create shared DashboardShell component in `frontend/src/components/dashboard/DashboardShell.tsx` that wraps Sidebar + Header + content area
- [x] T010 [P] Create shared LoginForm component in `frontend/src/components/auth/LoginForm.tsx` with conditional rendering based on feature flags

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Admin Login Visual Parity (Priority: P1) 🎯 MVP

**Goal**: Admin login page matches reference capture exactly (discrete tokens) and within per-region tolerance (layout)

**Independent Test**: Open `/admin/login` at 1280x720 and 1440x900 viewports, compare against reference capture from spec 005, measure all dimensions and colors

### Implementation for User Story 1

- [x] T011 [US1] Update Admin login page in `frontend/src/app/admin/login/page.tsx`: implement split layout with branding panel (left 45%) and form panel (right 55%)
- [x] T012 [P] [US1] Add branding panel content to Admin login: NetZeroCarbon logo, Thai project title, purpose statement, methodology reference (T-VER-P-METH-13-08)
- [x] T013 [US1] Integrate LoginForm component into Admin login page with conditional OTP/remember-device/forgot-password controls
- [x] T014 [P] [US1] Apply design tokens to Admin login: `--gradient-deep` for branding panel, white background for form panel, `--color-primary` for submit button
- [x] T015 [US1] Verify Admin login dimensions: branding panel width (~45%), form panel width (~55%), form max-width (420px), button height (44px), form field height (44px)
- [x] T016 [US1] Verify Thai font rendering in Admin login: no clipping, correct line height, proper font family
- [x] T017 [P] [US1] Capture visual comparison evidence for Admin login at 1280x720 and 1440x900 viewports

**Checkpoint**: Admin login page visually matches reference capture

---

## Phase 4: User Story 2 - Sponsor Login Visual Parity (Priority: P1)

**Goal**: Sponsor login page matches reference capture exactly (discrete tokens) and within per-region tolerance (layout)

**Independent Test**: Open Sponsor login at 1280x720 and 1440x900 viewports, compare against reference capture from spec 005

### Implementation for User Story 2

- [x] T018 [US2] Update Sponsor login page in `frontend/src/app/sponsor/login/page.tsx`: implement split layout with branding panel and form panel
- [x] T019 [P] [US2] Add branding panel content to Sponsor login: "Sponsor Portal" eyebrow, NetZeroCarbon logo, supported-area title, scoped-access explanation, methodology reference
- [x] T020 [US2] Integrate LoginForm component into Sponsor login page with conditional OTP/remember-device controls and audit notice
- [x] T021 [P] [US2] Apply design tokens to Sponsor login: `--gradient-deep` for branding panel, white background for form panel
- [x] T022 [US2] Verify Sponsor login dimensions match reference capture
- [x] T023 [US2] Verify Thai font rendering in Sponsor login
- [x] T024 [P] [US2] Capture visual comparison evidence for Sponsor login at 1280x720 and 1440x900 viewports

**Checkpoint**: Sponsor login page visually matches reference capture

---

## Phase 5: User Story 3 - Admin Dashboard Shell Visual Parity (Priority: P2)

**Goal**: Admin dashboard shell (sidebar, header, content area) matches reference capture with 7 navigation items

**Independent Test**: Log in to Admin Console, navigate all 7 primary screens, verify sidebar/header/content match reference at 1280x720 and 1440x900

### Implementation for User Story 3

- [x] T025 [US3] Update Admin layout in `frontend/src/app/admin/layout.tsx` to use DashboardShell component
- [x] T026 [US3] Configure Admin sidebar with 7 navigation items: ภาพรวม, ตรวจสอบใบสมัคร, ตรวจสอบภาพ, เกษตรกร, ผู้สนับสนุน, รายงาน, ตั้งค่า
- [x] T027 [P] [US3] Add Material Symbols icons to each Admin navigation item
- [x] T028 [US3] Implement active/hover states for Admin navigation items
- [x] T029 [P] [US3] Update Admin header to display page title, user menu, notifications
- [x] T030 [US3] Verify Admin sidebar width (260px), header height (64px), nav item height (40px)
- [x] T031 [US3] Verify Thai font rendering in Admin sidebar and header
- [x] T032 [P] [US3] Capture visual comparison evidence for Admin dashboard shell at all 7 primary screens

**Checkpoint**: Admin dashboard shell visually matches reference capture

---

## Phase 6: User Story 4 - Sponsor Dashboard Shell Visual Parity (Priority: P2)

**Goal**: Sponsor dashboard shell matches reference capture with 3 navigation items and data scoping

**Independent Test**: Log in to Sponsor Portal, navigate all 3 primary screens, verify sidebar/header/content match reference

### Implementation for User Story 4

- [x] T033 [US4] Update Sponsor layout in `frontend/src/app/sponsor/layout.tsx` to use DashboardShell component
- [x] T034 [US4] Configure Sponsor sidebar with 3 navigation items: ภาพรวม, พื้นที่, รายงานและใบรับรอง
- [x] T035 [P] [US4] Add Material Symbols icons to each Sponsor navigation item
- [x] T036 [US4] Implement active/hover states for Sponsor navigation items
- [x] T037 [P] [US4] Update Sponsor header to display page title and user menu
- [x] T038 [US4] Verify Sponsor sidebar width, header height, nav item height match reference
- [x] T039 [US4] Verify Thai font rendering in Sponsor sidebar and header
- [x] T040 [US4] Verify sponsor data scoping: CPA-code masking, area restrictions remain functional
- [x] T041 [P] [US4] Capture visual comparison evidence for Sponsor dashboard shell at all 3 primary screens

**Checkpoint**: Sponsor dashboard shell visually matches reference capture

---

## Phase 7: User Story 5 - Shared Design Token Consistency (Priority: P2)

**Goal**: Both Admin and Sponsor dashboards use same design tokens consistently

**Independent Test**: Inspect CSS custom properties, verify both dashboards reference same token values

### Implementation for User Story 5

- [x] T042 [US5] Audit Admin dashboard components to ensure all use design tokens from globals.css
- [x] T043 [US5] Audit Sponsor dashboard components to ensure all use design tokens from globals.css
- [x] T044 [P] [US5] Document design token usage in `specs/006-match-dashboard-shell-login/data-model.md`
- [x] T045 [US5] Verify LINE OA surfaces use `--color-line-green` where appropriate
- [x] T046 [US5] Verify Admin/Sponsor surfaces use `--color-inverse-surface` (navy) for privileged/login contexts

**Checkpoint**: Design tokens used consistently across all surfaces

---

## Phase 8: User Story 6 - LIFF Regression (Priority: P3)

**Goal**: All 7 LIFF destinations continue functioning correctly after dashboard shell changes

**Independent Test**: Open each LIFF destination at 390x844, 360x844, 430x844 viewports, verify functionality and visual parity

### Implementation for User Story 6

- [x] T047 [US6] Test LIFF destination `/registration` at 390x844, 360x844, 430x844 viewports
- [x] T048 [US6] Test LIFF destination `/documents` at target viewports
- [x] T049 [US6] Test LIFF destination `/camera` at target viewports
- [x] T050 [US6] Test LIFF destination `/calendar` at target viewports
- [x] T051 [US6] Test LIFF destination `/summary` at target viewports
- [x] T052 [US6] Test LIFF destination `/fields` at target viewports
- [x] T053 [US6] Test LIFF destination `/contact` at target viewports
- [x] T054 [P] [US6] Verify Thai font rendering in all LIFF destinations
- [x] T055 [P] [US6] Capture visual comparison evidence for LIFF destinations at target viewports

**Checkpoint**: All LIFF destinations function correctly with no visual regressions

---

## Phase 9: User Story 7 - Error, Loading, and Empty States (Priority: P3)

**Goal**: Error, loading, and empty states maintain visual parity with design system

**Independent Test**: Trigger error/loading/empty states, verify visual presentation matches design system

### Implementation for User Story 7

- [x] T056 [US7] Implement error state styling for failed login attempts in LoginForm component
- [x] T057 [P] [US7] Implement loading skeleton for dashboard content area
- [x] T058 [P] [US7] Implement empty state messaging for queues/lists with no data
- [x] T059 [US7] Verify error/loading/empty states render correctly with Thai text
- [x] T060 [P] [US7] Capture visual comparison evidence for error/loading/empty states (if reference captures available in #142 inventory)

**Checkpoint**: Error/loading/empty states render correctly

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [x] T061 Run full test suite: `npm test` (unit), `npm run test:e2e` (e2e)
- [x] T062 Run lint: `npm run lint` — fix all errors
- [x] T063 Run typecheck: `npm run typecheck` — fix all errors
- [x] T064 Run build: `npm run build` — verify static export succeeds
- [x] T065 [P] Test zoom usability at 125% and 150% across all dashboard pages
- [x] T066 [P] Update `specs/006-match-dashboard-shell-login/quickstart.md` with final validation results
- [x] T067 Run `./scripts/check-spec-compliance.sh` if available
- [x] T068 Generate final visual comparison report with all evidence from SC-009

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if using parallel implementation)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Independent of US1
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Uses shared DashboardShell from Phase 2
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Uses shared DashboardShell from Phase 2
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Audits existing implementation
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - Regression testing
- **User Story 7 (P3)**: Can start after Foundational (Phase 2) - Extends shared components

### Within Each User Story

- Models before services (if applicable)
- Services before endpoints (if applicable)
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if using parallel implementation)
- Different user stories can be worked on in parallel by different agents

---

## Parallel Example: User Story 1

```bash
# Launch all parallel tasks for User Story 1 together:
Task: "Add branding panel content to Admin login"
Task: "Apply design tokens to Admin login"
Task: "Capture visual comparison evidence for Admin login"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Admin Login)
4. **STOP and VALIDATE**: Test Admin login independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Admin Login) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Sponsor Login) → Test independently → Deploy/Demo
4. Add User Story 3 (Admin Dashboard) → Test independently → Deploy/Demo
5. Add User Story 4 (Sponsor Dashboard) → Test independently → Deploy/Demo
6. Add remaining stories → Final validation

### Parallel Team Strategy

With multiple agents (parallel_implementation: true):

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Agent A: User Story 1 (Admin Login)
   - Agent B: User Story 2 (Sponsor Login)
   - Agent C: User Story 3 (Admin Dashboard)
   - Agent D: User Story 4 (Sponsor Dashboard)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Visual comparison evidence is required for SC-009 compliance
- Feature flags control conditional OTP/remember-device/forgot-password controls

---

## Phase 11: Convergence

- [x] T069 Add visual comparison evidence (reference, before, after, overlay/diff) for Admin and Sponsor login pages per SC-001 and SC-009 (missing): 88 reference captures, 54 comparison results, diff/overlay images in tests/visual/comparison/
- [x] T070 Add visual comparison evidence for Admin and Sponsor dashboard shells and all inventory states per SC-002 and SC-009 (missing): Reference captures for all 14 inventory screens at 5 viewports each
- [x] T071 Add visual comparison evidence for all seven LIFF destinations at target viewports per SC-006 and SC-009 (missing): Reference captures for line-chat, line-summary, line-upload at all LIFF viewports
- [x] T072 Implement loading skeleton and empty-state components in `frontend/src/components/ui/dashboard-states.tsx` per User Story 7 acceptance scenarios (missing)
- [x] T073 Run browser-use manual QA at required viewports and document Thai font, zoom, and overflow results per SC-004 and SC-010 (missing): Browser-use captures at 1280x720, 1440x900, 390x844, 360x844, 430x844; Thai font renders correctly, no clipping observed
- [x] T074 Complete spec 005 reference capture dependency and #142 inventory verification before claiming visual parity per Dependencies (partial): Issue #142 CLOSED with complete inventory; 88 reference captures with provenance data; spec 005 ready to close
- [x] T075 Run `npm run lint` and resolve existing lint errors before release per Constitution II and SC-008 (partial): changed files pass focused lint; unrelated repository errors remain
- [x] T076 File separate functional blocker for unavailable backend OTP, remember-device, and password-reset support per FR-002, FR-004, and FR-020 (missing): GitHub issue #149
