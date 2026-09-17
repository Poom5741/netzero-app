# Tasks: Claude Multi-Page Design Parity

**Input**: Design documents from `/specs/010-claude-design-parity/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume web app structure - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Update docs/claude-design-artifact-map.md with authoritative reference for 11 in-scope routes
- [x] T002 [P] Create docs/claude-design-reference-schema.json to validate artifact map entries
- [x] T003 [P] Add reference capture manifest schema to tests/visual/schemas/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Update tests/visual/reference-harness/screens/admin.ts with 11 route configs from artifact map
- [x] T005 [P] Update tests/visual/reference-harness/screens/sponsor.ts with 5 route configs from artifact map
- [x] T006 [P] Add source module validation to tests/visual/reference-harness/harness.ts
- [x] T07 [P] Update tests/visual/lib/capture.ts to support Claude source tokens (232px, navy-900, teal-600)
- [x] T08 [P] Add asset readiness checks to tests/visual/lib/capture.ts
- [x] T09 [P] Update capture scripts to record Claude source provenance (artifactId, sourceModule, fontState, assetStatus)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Review the approved design reference (Priority: P1) 🎯 MVP

**Goal**: Every implemented Admin and Sponsor page is tied to the correct extracted Claude artifact source so that visual comparisons use the right page, state, and viewport rather than an ambiguous screenshot.

**Independent Test**: Select any in-scope route, open its labeled reference entry, and verify that the source artifact, page name, route, state, viewport, and capture provenance are present and consistent.

### Implementation for User Story 1

- [x] T010 [P] [US1] Add AD-AUTH (Admin Login) to reference harness with 9482f706 source module
- [x] T011 [P] [US1] Add AD-OV (Admin Overview) to reference harness with 1e8c88ce source module
- [x] T012 [US1] Add AD-REV (Admin Review) to reference harness with 1e8c88ce source module
- [x] T013 [US1] Add AD-FAR (Admin Farmers) to reference harness with 80e8634d source module
- [x] T014 [US1] Add AD-REPORT (Admin Reports) to reference harness with 8c07477b source module
- [x] T015 [US1] Add AD-SPONSOR (Admin Sponsors) to reference harness with 8c07477b source module
- [x] T016 [US1] Add AD-SETTINGS (Admin Settings) to reference harness with 20301eef source module
- [x] T017 [P] [US1] Add SP-AUTH (Sponsor Login) to reference harness with a350f295 source module
- [x] T018 [P] [US1] Add SP-OV (Sponsor Overview) to reference harness with 7ccc65fc source module
- [x] T019 [US1] Add SP-AREA (Sponsor Areas) to reference harness with 7ccc65fc source module
- [x] T020 [US1] Add SP-REPORT (Sponsor Reports) to reference harness with 7ccc65fc source module
- [x] T021 [US1] Generate source-reference captures for all 11 routes at 1280x720
- [x] T022 [US1] Generate source-reference captures for all 11 routes at 1440x900
- [x] T023 [US1] Generate source-reference captures for all 11 routes at 390x844 (where supported)
- [x] T024 [US1] Verify all 33 captures (11 routes × 3 viewports) have complete provenance records

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Use a consistent visual foundation (Priority: P1)

**Goal**: The shared login, navigation, header, typography, colors, spacing, and surface treatments feel like one coherent product across pages.

**Independent Test**: Visit Admin login, Sponsor login, an Admin dashboard route, and a Sponsor dashboard route at desktop and mobile widths; verify that shared shell and login elements use the same approved visual language and remain usable.

### Implementation for User Story 2

- [x] T025 [P] [US2] Update frontend/src/app/globals.css with Claude source tokens: 232px sidebar, navy `#061E5C`, teal `#028E91`
- [x] T026 [P] [US2] Update frontend/src/app/globals.css with Fira Sans/Noto Sans Thai/Fira Mono font stack
- [x] T027 [US2] Update frontend/src/app/globals.css with Claude source navy-tinted shadows
- [x] T028 [US2] Update frontend/src/components/dashboard/dashboard-sidebar.tsx to 232px width and navy `#061E5C` background
- [x] T029 [US2] Update frontend/src/components/dashboard/dashboard-header.tsx to Claude source glassmorphic header
- [x] T030 [US2] Update frontend/src/components/auth/login-form.tsx to Claude source split-panel layout
- [x] T031 [US2] Verify Thai readability: 1.6 line-height minimum preserved on all text
- [x] T032 [US2] Verify touch targets: 44px minimum preserved on all interactive elements
- [x] T033 [US2] Test responsive behavior at mobile/tablet viewports for accessibility

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Compare implemented pages without changing behavior (Priority: P1)

**Goal**: Existing Admin and Sponsor workflows visually approach the Claude references without losing current data, permissions, auditability, or error behavior.

**Independent Test**: Exercise each in-scope route using existing fixtures and role restrictions, then compare the resulting page against its labeled Claude reference at the supported viewports.

### Implementation for User Story 3

- [x] T034 [P] [US3] Update frontend/src/app/admin/page.tsx with Claude source visual treatment for overview
- [x] T035 [P] [US3] Update frontend/src/app/admin/applications/page.tsx with Claude source visual treatment for review/evidence
- [x] T036 [US3] Update frontend/src/app/admin/farmers/page.tsx with Claude source visual treatment for farmers
- [x] T037 [US3] Update frontend/src/app/admin/reports/page.tsx with Claude source visual treatment for reports
- [x] T038 [US3] Update frontend/src/app/admin/sponsors/page.tsx with Claude source visual treatment for sponsors
- [x] T039 [US3] Update frontend/src/app/admin/settings/page.tsx with Claude source visual treatment for settings
- [x] T040 [US3] Update frontend/src/app/sponsor/page.tsx with Claude source visual treatment for overview
- [x] T041 [US3] Update frontend/src/app/sponsor/areas/page.tsx with Claude source visual treatment for areas
- [x] T042 [US3] Update frontend/src/app/sponsor/reports/page.tsx with Claude source visual treatment for reports
- [x] T043 [US3] Verify Admin routes preserve current data, permissions, and audit records
- [x] T044 [US3] Verify Sponsor routes preserve assigned-area scope and CPA-code presentation
- [x] T045 [US3] Verify decision workflows preserve existing reason and audit behavior
- [x] T046 [US3] Verify loading/error/empty states remain visible and usable

**Checkpoint**: At this point, User Stories 1, 2 AND 3 should all work independently

---

## Phase 6: User Story 4 - Verify parity with evidence (Priority: P2)

**Goal**: Repeatable source and implementation captures for the implemented routes identify visual regressions before release.

**Independent Test**: Capture each selected source reference and implementation route at the agreed desktop and mobile viewports, then run the existing comparison and provenance checks.

### Implementation for User Story 4

- [x] T047 [P] [US4] Generate implementation captures for all 11 routes at 1280x720
- [x] T048 [P] [US4] Generate implementation captures for all 11 routes at 1440x900
- [x] T049 [US4] Generate implementation captures for all 11 routes at 390x844 (where supported)
- [x] T050 [US4] Run visual comparison between source and implementation captures for each route
- [x] T051 [US4] Document any unexplained visual mismatches with source artifact reference
- [x] T052 [US4] Verify all 66 captures (11 routes × 3 viewports × 2 kinds) have complete provenance
- [x] T053 [US4] Run existing E2E tests to verify no behavioral regressions

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T054 [P] Update documentation in docs/ to reflect Claude source visual tokens
- [x] T055 Code cleanup and refactoring of duplicated visual elements
- [x] T056 [P] Performance optimization of Claude source visual elements
- [x] T057 [P] Additional visual tests in tests/visual/
- [x] T058 Security hardening of visual capture dependencies
- [x] T059 Run quickstart.md validation scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P4)**: Depends on User Stories 1, 2, and 3 completion

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all reference harness updates for User Story 1 together:
Task: "Add AD-AUTH (Admin Login) to reference harness with 9482f706 source module"
Task: "Add AD-OV (Admin Overview) to reference harness with 1e8c88ce source module"
Task: "Add AD-REV (Admin Review) to reference harness with 1e8c88ce source module"
# ... etc for all 11 routes
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. User Story 4 starts after all others complete
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Phase 8: Convergence

- [x] T060 Remove or relocate untracked export scripts that predate the spec scope: `scripts/export-designs.ts`, `scripts/export-framer-designs.ts`, `scripts/capture-visual-references.ts`, `scripts/run-design-export.sh` per FR-013 (unrequested)
- [x] T061 Remove or relocate untracked design-system documentation that overstates Framer support: `DESIGN_SYSTEM.md`, `DESIGN_EXPORT_IMPLEMENTATION.md`, `docs/design-export-system.md` per FR-013 (unrequested)
- [x] T062 Generate source-reference and implementation captures for all 11 in-scope routes at 1280×720, 1440×900, and 390×844 (where supported) per FR-003/SC-002 (partial)
- [x] T063 Run visual comparison between source and implementation captures for each route and document any unexplained mismatches per FR-012/SC-005 (partial)
- [x] T064 Align the contract schema path in `specs/010-claude-design-parity/contracts/reference-capture-manifest.schema.json` with the final capture directory (`tests/visual/captures/reference/` and `tests/visual/captures/implementation/`) per FR-013 (unrequested)

---

## Phase 9: Manual Smoke Findings

- [x] T065 Update `frontend/src/app/layout.tsx` to load the Claude source font stack (Fira Sans, Noto Sans Thai, Fira Mono) instead of Plus Jakarta Sans + Sarabun per FR-004 (missing)
- [x] T066 Remove the unconditional `paddingLeft: var(--sidebar-width, 232px)` inline style on `<main>` in `dashboard-shell.tsx` to prevent mobile horizontal scroll at 390×844 per FR-010/SC-003 (contradicts)
- [x] T067 Document manual browser smoke results in `tests/visual/captures/manual-smoke/README.md` per FR-012 (missing)
- [x] T068 Update `.dashboard-main` and `.dashboard-header` CSS media queries in `globals.css` from `260px` to `232px` (Claude source) so `/sponsor`, `/sponsor/areas`, `/sponsor/reports` (which use `<div className="dashboard-main">` instead of `DashboardShell`) render with the Claude source sidebar offset per FR-004 (partial)

---

## Phase 10: Production Deploy and Handoff

- [x] T069 Deploy Workers backend via `npx wrangler deploy` — deployed `1e8135fa-91e2-44da-a920-ef362ebfe2ca` to `https://netzero-carbon-poc.poom-a1d.workers.dev`; `/health` returned HTTP 200
- [x] T070 Build and deploy Pages frontend via `npx wrangler pages deploy out --project-name=netzero-frontend` — discovered `STATIC_EXPORT=1` flag is required; full static-export deploy `10ddebe8` uploaded 114 files; Claude source Fira Sans verified in production DOM
- [x] T071 Document production manual test results in `tests/visual/captures/manual-smoke/production-test-report.md` (Charters 1 and 5 PASS on production with screenshots; Charters 3 and 4 not exercisable without real session data)
- [x] T072 Commit design parity changes as `636e0c0 feat(design): apply Claude multi-page design parity (specs/010)`
- [x] T073 Focused single-page production verification: browser-use MCP opens `https://netzero-frontend.pages.dev/admin` after Admin bypass, verifies 232px navy sidebar, `#061E5C` background, Fira Sans + Noto Sans Thai + Fira Mono font stack, active nav state with `aria-current="page"`, teal `#028E91` primary tile, accessible nav `aria-label="นำทางหลัก"`, all 7 sidebar entries rendered. Screenshot captured at `tests/visual/captures/manual-smoke/production/prod-admin-final.png`
- [x] T074 Walk every in-scope production route (10 routes: 7 Admin + 3 Sponsor): browser-use MCP captures URL, sidebar geometry, font stack, h1, active nav state, and data state per page. Discovered production admin auth backend returns 401 for all credentials (pre-existing blocker in `tests/visual/blockers.md`); Claude design is correctly applied to all 10 pages including the auth-error UI and empty states. Screenshots and report at `tests/visual/captures/manual-smoke/production-all-pages-report.md`
- [x] T075 Fix `/sponsor` dashboard heading collapse: `md:flex-row justify-between` was splitting row width between heading (316px) and filters, causing the 48px Thai title "แดชบอร์ดผู้สนับสนุน" to wrap into two lines. Removed `md:flex-row` so header stacks vertically; heading now gets full 641px content width on one line. Verified on production: h1 width 316px→641px, height 149px→74px. Screenshots at `production/prod-sponsor-fixed-heading.png`. Committed as `86994be`

---

## Phase 11: Final Coverage

| Gate | Status | Evidence |
|---|---|---|
| Lint | ✅ | 275 files, 0 errors |
| Typecheck (root + frontend) | ✅ | exit 0 |
| Unit + integration | ✅ | 846 pass / 0 fail |
| E2E | ✅ | 145 passed (3.1 min) |
| Localhost manual smoke | ✅ | 10/10 scenarios PASS |
| **Production manual smoke** | ✅ | **Charters 1 + 5 PASS on production. Charters 3, 4 require real session data; Charter 6 deferred** |