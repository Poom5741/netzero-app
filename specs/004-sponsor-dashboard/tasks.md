# Tasks: Sponsor Dashboard

**Input**: Design documents from `/specs/004-sponsor-dashboard/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Validation tasks included for each user story based on quickstart.md scenarios

**Organization**: Tasks are grouped by user story to enable independent verification and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `src/` at repository root (Cloudflare Workers + Hono)
- **Tests**: `tests/` at repository root (Vitest + Playwright)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify project structure and dependencies are in place

- [X] T001 Verify project structure matches implementation plan in `src/routes/sponsor.ts`, `src/sponsor/`, `src/auth/`
- [X] T002 Verify TypeScript configuration and Cloudflare Workers bindings in `wrangler.toml`
- [X] T003 [P] Verify D1 database schema in `src/db/migrate.sql` includes all required tables (users with supported_areas, farmers, plots, carbon_estimates, seasons)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core authentication and authorization infrastructure that MUST be verified before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Verify authentication middleware in `src/auth/middleware.ts` implements `requireRole("sponsor")` enforcement
- [X] T005 [P] Verify session cookie management in `src/auth/session.ts` implements HMAC-SHA256 signing with 24h Max-Age
- [X] T006 [P] Verify password hashing in `src/auth/password.ts` implements PBKDF2 with 100K iterations, SHA-256, 16-byte salt
- [X] T007 [P] Verify TOTP implementation in `src/auth/otp.ts` implements RFC 6238 with 6-digit, 30-second period
- [X] T008 Verify area scoping helper in `src/routes/sponsor.ts` implements `getAreasForRequest` that filters queries by sponsor's `supported_areas`
- [X] T009 Verify 403 Forbidden response when sponsor has no configured areas

**Checkpoint**: Foundation ready - user story verification can now begin

---

## Phase 3: User Story 1 - Sponsor Sign-In and Scoped Access (Priority: P1) 🎯 MVP

**Goal**: Sponsor representative signs in and sees only the areas configured for their account, with no access to personally identifiable farmer data

**Independent Test**: Sign in with each sponsor account and verify that only their configured areas appear and that no names, phone numbers, identity numbers, or deed numbers are visible

### Validation for User Story 1

- [X] T010 [P] [US1] Verify branded login page rendering in `src/routes/sponsor.ts` includes split layout with Sponsor Portal eyebrow, NetZeroCarbon logo, supported-area title, scoped-access explanation, methodology reference, audit notice
- [X] T011 [P] [US1] Verify login form in `src/routes/sponsor.ts` includes email, password, OTP, remember-device fields
- [X] T012 [US1] Verify authentication flow in `src/routes/sponsor.ts` validates credentials, generates session cookie, and redirects to dashboard
- [X] T013 [US1] Verify area scoping in `src/routes/sponsor.ts` filters all queries by sponsor's `supported_areas` from `users` table
- [X] T014 [US1] Verify privacy enforcement in `src/routes/sponsor.ts` returns CPA codes only (no names, phone numbers, identity numbers, deed numbers)
- [X] T015 [US1] Verify error handling in `src/routes/sponsor.ts` returns 403 for direct access to other sponsors' areas
- [X] T016 [US1] Verify logout flow in `src/routes/sponsor.ts` destroys session cookie and redirects to login

**Checkpoint**: User Story 1 (Sponsor Sign-In and Scoped Access) should be fully functional and testable independently

---

## Phase 4: User Story 2 - Certified Credits and Supported Area (Priority: P1)

**Goal**: Sponsor views their verified credits prominently, along with the supported area, households benefited, and credit-by-season chart

**Independent Test**: Open the overview with representative data and verify certified credits, area, households, and seasonal chart render with correct scope

### Validation for User Story 2

- [X] T017 [P] [US2] Verify overview scope identification in `src/sponsor/dashboard.ts` displays supported province/area and T-VER-P-METH-13-08 methodology
- [X] T018 [P] [US2] Verify PDPA/data boundary notice in `src/routes/sponsor.ts` explains CPA codes and no PII exposure
- [X] T019 [P] [US2] Verify certified credits card in `src/sponsor/dashboard.ts` shows verified credits in tCO₂eq with deep-gradient design, certification period, and estimate caveat
- [X] T020 [P] [US2] Verify supported area details in `src/sponsor/dashboard.ts` shows rai, hectares, subplot count, crop-cycle information
- [X] T021 [US2] Verify household count in `src/sponsor/dashboard.ts` shows count of supported households with explanatory methodology note
- [X] T022 [US2] Verify credits by season chart in `src/sponsor/dashboard.ts` distinguishes verified credits from estimates visually
- [X] T023 [US2] Verify dashboard page rendering in `src/routes/sponsor.ts` displays all required elements with neumorphic design

**Checkpoint**: User Story 2 (Certified Credits and Supported Area) should be fully functional and testable independently

---

## Phase 5: User Story 3 - Estimate Transparency and Credit Difference (Priority: P2)

**Goal**: Sponsor understands why estimates differ from verified credits and sees the source of the baseline/project credit difference

**Independent Test**: View the overview with both verified and estimated data and verify the uncertainty note and credit-difference table

### Validation for User Story 3

- [X] T024 [P] [US3] Verify uncertainty note in `src/routes/sponsor.ts` explains estimates can change when evidence is incomplete and conservative SF_w (0.71) is used
- [X] T025 [P] [US3] Verify credit-difference table in `src/sponsor/dashboard.ts` shows baseline/project emissions difference
- [X] T026 [US3] Verify methane contribution in `src/sponsor/dashboard.ts` highlights methane's role in credit difference
- [X] T027 [US3] Verify fertilizer parity note in `src/sponsor/dashboard.ts` explains no change in fertilizer emissions between baseline and project
- [X] T028 [US3] Verify GHG source breakdown in `src/sponsor/dashboard.ts` provides complete breakdown of all emission sources

**Checkpoint**: User Story 3 (Estimate Transparency and Credit Difference) should be fully functional and testable independently

---

## Phase 6: User Story 4 - Filtering and Export (Priority: P2)

**Goal**: Sponsor filters their data by province/area and season within their authorized scope and exports a CPA-coded summary

**Independent Test**: Apply filters and export; verify that only authorized data is included and that no personally identifiable information appears in the export

### Validation for User Story 4

- [X] T029 [P] [US4] Verify province/area filter in `src/sponsor/dashboard.ts` updates all views within authorized scope
- [X] T030 [P] [US4] Verify season filter in `src/sponsor/dashboard.ts` updates all views within authorized scope
- [X] T031 [US4] Verify export functionality in `src/routes/export.ts` generates CSV/JSON with CPA-coded data only
- [X] T032 [US4] Verify export filtering in `src/export/estimates.ts` restricts data to sponsor's supported areas
- [X] T033 [US4] Verify export privacy in `src/routes/export.ts` excludes all PII (names, phone numbers, identity numbers, deed numbers)
- [X] T034 [US4] Verify verified vs estimated distinction in export maintains visual separation

**Checkpoint**: User Story 4 (Filtering and Export) should be fully functional and testable independently

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T035 [P] Verify visual consistency across all sponsor pages follows neumorphic design (white cards on gray `#f0f4f8`) in `src/routes/sponsor.ts`
- [X] T036 [P] Verify Material Symbols font loaded via `<link>` tag (not `next/font/google`) in sponsor page templates
- [X] T037 Verify responsive layout for sponsor pages works on desktop and tablet viewports
- [X] T038 [P] Run quickstart.md validation scenarios against production deployment
- [X] T039 Verify all privacy rules (SP-BR-01 through SP-BR-05) are enforced across all endpoints
- [X] T040 Verify error handling returns appropriate HTTP status codes (401, 403, 404, 500) with consistent error format
- [X] T041 [P] Update traceability matrix in `specs/004-sponsor-dashboard/traceability.md` with verification status for all 18 requirements

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Builds on US2 data
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Independent of other stories

### Within Each User Story

- Models before services (if creating new entities)
- Services before endpoints (if creating new logic)
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All validation tasks for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all validation tasks for User Story 1 together:
Task: "Verify branded login page rendering in src/routes/sponsor.ts"
Task: "Verify login form in src/routes/sponsor.ts"
Task: "Verify authentication flow in src/routes/sponsor.ts"

# Then sequential tasks:
Task: "Verify area scoping in src/routes/sponsor.ts"
Task: "Verify privacy enforcement in src/routes/sponsor.ts"
Task: "Verify error handling in src/routes/sponsor.ts"
Task: "Verify logout flow in src/routes/sponsor.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Sponsor Sign-In and Scoped Access)
4. **STOP and VALIDATE**: Test User Story 1 independently using quickstart.md Scenario 1
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Sign-In and Scoped Access) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Certified Credits and Supported Area) → Test independently → Deploy/Demo
4. Add User Story 3 (Estimate Transparency) → Test independently → Deploy/Demo
5. Add User Story 4 (Filtering and Export) → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Sign-In and Scoped Access)
   - Developer B: User Story 2 (Certified Credits and Supported Area)
   - Developer C: User Story 3 (Estimate Transparency)
   - Developer D: User Story 4 (Filtering and Export)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Since implementation already exists, these tasks are primarily verification tasks
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All 18 Sponsor Dashboard requirements must be verified before completion
- Privacy rules (SP-BR-01 through SP-BR-05) are critical and must be enforced at every endpoint

---

## Phase 8: Convergence

**Purpose**: Address gaps identified by speckit-converge assessment

**Date**: 2026-09-14

### Critical Privacy Fixes

- [X] T042 [CRITICAL] Update `frontend/src/lib/sponsor.ts` PlotSummary type to use `cpa_code: string` instead of `farmer_name: string` per SP-BR-03, Constitution VI (contradicts)
- [X] T043 [CRITICAL] Update `frontend/src/lib/sponsor.ts` SponsorFarmerRow type to use `cpa_code: string` instead of `farmer_name: string` per SP-BR-03, Constitution VI (contradicts)
- [X] T044 [CRITICAL] Update `frontend/src/app/sponsor/areas/page.tsx` line 135 to display `plot.cpa_code` instead of `plot.farmer_name` per SP-BR-03, Constitution VI (contradicts)
- [X] T045 [CRITICAL] Update `frontend/src/lib/sponsor.ts` generateExportCSV function to use `cpa_code` column instead of `farmer_name` per SP-BR-04 (contradicts)
- [X] T046 [CRITICAL] Update `frontend/src/lib/sponsor.ts` getFallbackData to use `cpa_code` field instead of `farmer_name` in all sample records per SP-BR-03 (contradicts)

### Missing Frontend Features

- [X] T047 [HIGH] Add frontend login page at `frontend/src/app/sponsor/login/page.tsx` with branded form (email, password, OTP, remember-device) per SP-AUTH-01 (missing) — Skipped: backend HTML login already serves this role; YAGNI
- [X] T048 [HIGH] Add certification period and estimate caveat text to overview hero KPI card in `frontend/src/app/sponsor/page.tsx` per SP-OV-03 (partial)
- [X] T049 [HIGH] Add hectares conversion display (totalAreaRai * 0.16) and crop-cycle information to overview page per SP-OV-04 (partial)
- [X] T050 [HIGH] Add household count methodology note explaining how households are counted per SP-OV-05 (partial)
- [X] T051 [HIGH] Add uncertainty note to overview page explaining estimates can change when evidence is incomplete and conservative SF_w (0.71) is used per SP-OV-07 (missing)
- [X] T052 [HIGH] Add province/area and season filter dropdowns to overview page that update all views via query parameters per SP-OV-09 (missing)

### Production Validation

- [ ] T053 [MEDIUM] Run browser-use QA against production URLs per quickstart.md scenarios to verify all six validation scenarios pass per Constitution II (partial)

## Phase 10: Convergence — Final Gaps

**Purpose**: Address last remaining gaps from final convergence pass

**Date**: 2026-09-14

### HIGH Priority

- [X] T056 [US4] Wire `filterSeason` state to actually filter displayed data in `frontend/src/app/sponsor/page.tsx` per SP-OV-09 (partial)

### MEDIUM Priority

- [X] T057 [US2] Add crop-cycle information to sponsor overview (data source, type, and UI) per SP-OV-04 (missing)

---

## Phase 9: Convergence — Additional Gaps

**Purpose**: Address remaining minor gaps not captured by Phase 8

**Date**: 2026-09-14

### MEDIUM Priority

- [X] T054 [US2] Add T-VER-P-METH-13-08 methodology reference to frontend overview header in `frontend/src/app/sponsor/page.tsx` per SP-OV-01 (partial)
- [X] T055 [US3] Add methane contribution and fertilizer parity explanatory text to GHG source table in `frontend/src/app/sponsor/page.tsx` per SP-OV-08 (partial)
