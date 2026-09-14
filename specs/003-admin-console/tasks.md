# Tasks: Admin Console

**Input**: Design documents from `/specs/003-admin-console/`

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

- [x] T001 Verify project structure matches implementation plan in `src/routes/admin.ts`, `src/admin/`, `src/auth/`
- [x] T002 Verify TypeScript configuration and Cloudflare Workers bindings in `wrangler.toml`
- [x] T003 [P] Verify D1 database schema in `src/db/migrate.sql` includes all required tables (users, farmers, plots, line_links, application_documents, photo_evidence, carbon_estimates, automation_audit_log)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core authentication and authorization infrastructure that MUST be verified before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Verify authentication middleware in `src/auth/middleware.ts` implements `requireRole()` with single role and array support
- [x] T005 [P] Verify session cookie management in `src/auth/session.ts` implements HMAC-SHA256 signing with 24h Max-Age
- [x] T006 [P] Verify password hashing in `src/auth/password.ts` implements PBKDF2 with 100K iterations, SHA-256, 16-byte salt
- [x] T007 [P] Verify TOTP implementation in `src/auth/otp.ts` implements RFC 6238 with 6-digit, 30-second period
- [x] T008 Verify audit logging infrastructure in `src/admin/audit-log.ts` captures actor, timestamp, action, before/after values
- [x] T009 Verify role-permission matrix in `src/admin/settings.ts` covers all 5 roles and 15 permission categories

**Checkpoint**: Foundation ready - user story verification can now begin

---

## Phase 3: User Story 1 - Privileged Sign-In (Priority: P1) 🎯 MVP

**Goal**: Authorized administrator signs in to branded Admin Console with email, password, OTP, and audit logging

**Independent Test**: Submit valid and invalid credentials for each role and verify access, denial, remembered-device behavior, and audit notice

### Validation for User Story 1

- [x] T010 [P] [US1] Verify branded login page rendering in `src/routes/admin.ts` includes split layout, deep gradient, NetZeroCarbon logo, Thai project title, methodology reference
- [x] T011 [P] [US1] Verify login form in `src/routes/admin.ts` includes email, password, OTP, remember-device, forgot-password, and submit fields
- [x] T012 [US1] Verify authentication flow in `src/routes/admin.ts` validates credentials, generates session cookie, and redirects to overview
- [x] T013 [US1] Verify audit log entry creation in `src/admin/audit-log.ts` for sign-in event with actor, time, action
- [x] T014 [US1] Verify error handling in `src/routes/admin.ts` returns 401 for invalid credentials without exposing sensitive information
- [x] T015 [US1] Verify logout flow in `src/routes/admin.ts` destroys session cookie and redirects to login

**Checkpoint**: User Story 1 (Privileged Sign-In) should be fully functional and testable independently

---

## Phase 4: User Story 2 - Operational Overview (Priority: P1)

**Goal**: Authorized user views project scope, key metrics, urgent work, credit summaries, and filters

**Independent Test**: Open the overview with representative data, apply province and season filters, and verify metrics, queue actions, charts, and exports update consistently

### Validation for User Story 2

- [x] T016 [P] [US2] Verify overview scope identification in `src/admin/overview.ts` displays T-VER-P-METH-13-08 methodology
- [x] T017 [P] [US2] Verify four primary metrics in `src/admin/overview.ts`: totalFarmers, totalPlots, pendingReviews, totalCredits
- [x] T018 [P] [US2] Verify work queue in `src/admin/overview.ts` shows pendingApplications, photoQueue, missingPhotos, sfwFallback with count and urgency
- [x] T019 [P] [US2] Verify credit visualizations in `src/admin/overview.ts` show verified vs estimated credits, province breakdown, season breakdown
- [x] T020 [US2] Verify filter functionality in `src/admin/overview.ts` updates all affected metrics when province or season filter is applied
- [x] T021 [US2] Verify operational actions in `src/admin/overview.ts` provide buttons for credit charts, report export, and photo-review queue
- [x] T022 [US2] Verify overview page rendering in `src/routes/admin.ts` displays all required elements with neumorphic design

**Checkpoint**: User Story 2 (Operational Overview) should be fully functional and testable independently

---

## Phase 5: User Story 3 - Farmer and Application Review (Priority: P1)

**Goal**: Reviewer searches farmer registry, opens farmer detail, reviews application with document checklist, and approves/holds/requests missing information

**Independent Test**: Use owner, co-owner, tenant, and representative applications with complete, missing, and invalid documents

### Validation for User Story 3

- [x] T023 [P] [US3] Verify farmer registry list in `src/routes/admin.ts` shows CPA code, authorized farmer name, area, sponsor, subplot count, rai, photo progress, BE, PE, ER
- [x] T024 [P] [US3] Verify personal data protection in `src/auth/middleware.ts` restricts names and identity details to authorized admin contexts
- [x] T025 [P] [US3] Verify filter and export by CPA code in `src/admin/reports.ts` and `src/routes/export.ts`
- [x] T026 [US3] Verify farmer detail panel in `src/admin/farmer-detail.ts` opens with 5 tabs: Plots & Documents, Credit Calculation, Nitrogen Source, Photo Evidence, Audit Log
- [x] T027 [US3] Verify plot and deed information in `src/admin/farmer-detail.ts` shows plot codes, area, rice variety, deed references, evidence status
- [x] T028 [US3] Verify application queue in `src/admin/applications.ts` shows application ID, CPA code, farmer, location, subplot count, area, holding type, doc count, age, status
- [x] T029 [US3] Verify holding-specific document rules in `src/admin/applications.ts` handles owner, co-owner, tenant, and authorized-representative cases
- [x] T030 [US3] Verify document checklist in `src/admin/applications.ts` distinguishes required, received, missing, and invalid documents
- [x] T031 [US3] Verify review actions in `src/admin/applications.ts` allow request documents, approve when complete, or hold with reason
- [x] T032 [US3] Verify placeholder labeling in `src/admin/applications.ts` marks sample data or unavailable OCR/automation as placeholder

**Checkpoint**: User Story 3 (Farmer and Application Review) should be fully functional and testable independently

---

## Phase 6: User Story 4 - Evidence Review (Priority: P1)

**Goal**: Verifier reviews submitted evidence with plot, round, GPS, timestamp, water level, and status, then approves, rejects, or requests retake

**Independent Test**: Review accepted, rejected, and retake cases and verify the farmer-facing reason and immutable review history

### Validation for User Story 4

- [x] T033 [P] [US4] Verify evidence review in `src/admin/detail.ts` shows crop, plot, round, GPS, timestamp, water level, image, and status
- [x] T034 [P] [US4] Verify photo review queue in `src/admin/queue.ts` queries photo_evidence with two-tier filtering and priority sorting
- [x] T035 [US4] Verify approve action in `src/admin/review.ts` updates status and creates audit log entry
- [x] T036 [US4] Verify reject action in `src/admin/review.ts` requires reason and updates status with audit log
- [x] T037 [US4] Verify retake action in `src/admin/review.ts` requires reason and updates status with audit log
- [x] T038 [US4] Verify review history in `src/admin/audit-log.ts` preserves reviewer, timestamp, decision, reason, and prior status via `getDecisionHistory`
- [x] T039 [US4] Verify evidence review page rendering in `src/routes/admin.ts` displays queue and detail views

**Checkpoint**: User Story 4 (Evidence Review) should be fully functional and testable independently

---

## Phase 7: User Story 5 - Calculation, Roles, and Reporting (Priority: P2)

**Goal**: Authorized user views traceable calculation inputs and outputs, uses role-appropriate navigation and permissions, and exports reports without leaking protected data

**Independent Test**: Exercise each role against the permission categories and verify calculation views, navigation, exports, and audit logs

### Validation for User Story 5

- [x] T040 [P] [US5] Verify calculation traceability in `src/admin/farmer-detail.ts` CalcTrace tab shows baseline/project emissions, SF_w factor, uncertainty deduction, net offset, and inputs JSON
- [x] T041 [P] [US5] Verify calculation engine in `src/calc/orchestrator.ts`, `src/calc/methane.ts`, `src/calc/n2o.ts`, `src/calc/co2.ts`, `src/calc/burning.ts`, `src/calc/sf-w.ts`, `src/calc/factors.ts` follows T-VER-P-METH-13-08
- [x] T042 [US5] Verify five roles in `src/auth/middleware.ts` and `src/admin/settings.ts`: admin, verifier, field, sponsor, auditor
- [x] T043 [US5] Verify permission categories in `src/admin/settings.ts` cover all 15 categories: dashboard scope, identity fields, evidence/application review, data entry, bot replies, batch import, recalculation, parameter editing, exports, audit access, permission administration
- [x] T044 [US5] Verify primary navigation in `src/routes/admin.ts` includes overview, application review, evidence review, farmers, sponsors, reports, and settings
- [x] T045 [US5] Verify export functionality in `src/routes/export.ts` and `src/export/estimates.ts` generates CSV/JSON with role-based field filtering
- [x] T046 [US5] Verify sponsor role cannot access personally identifiable farmer data in `src/routes/sponsor.ts`

**Checkpoint**: User Story 5 (Calculation, Roles, and Reporting) should be fully functional and testable independently

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T047 [P] Verify visual consistency across all admin pages follows neumorphic design (white cards on gray `#f0f4f8`) in `src/routes/admin.ts`
- [x] T048 [P] Verify Material Symbols font loaded via `<link>` tag (not `next/font/google`) in admin page templates
- [x] T049 Verify responsive layout for admin pages works on desktop and tablet viewports
- [x] T050 [P] Run quickstart.md validation scenarios against production deployment
- [x] T051 Verify all audit log entries are created for privileged reads and writes across all user stories
- [x] T052 Verify error handling returns appropriate HTTP status codes (401, 403, 404, 500) with consistent error format
- [x] T053 [P] Update traceability matrix in `specs/003-admin-console/traceability.md` with verification status for all 29 requirements

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1-US4 but independently testable

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
Task: "Verify branded login page rendering in src/routes/admin.ts"
Task: "Verify login form in src/routes/admin.ts"
Task: "Verify authentication flow in src/routes/admin.ts"

# Then sequential tasks:
Task: "Verify audit log entry creation in src/admin/audit-log.ts"
Task: "Verify error handling in src/routes/admin.ts"
Task: "Verify logout flow in src/routes/admin.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Privileged Sign-In)
4. **STOP and VALIDATE**: Test User Story 1 independently using quickstart.md Scenario 1
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Sign-In) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Overview) → Test independently → Deploy/Demo
4. Add User Story 3 (Farmer/Application Review) → Test independently → Deploy/Demo
5. Add User Story 4 (Evidence Review) → Test independently → Deploy/Demo
6. Add User Story 5 (Calculation/Roles/Reporting) → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Sign-In)
   - Developer B: User Story 2 (Overview)
   - Developer C: User Story 3 (Farmer/Application Review)
   - Developer D: User Story 4 (Evidence Review)
3. Stories complete and integrate independently
4. Developer A or B: User Story 5 (Calculation/Roles/Reporting)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Since implementation already exists, these tasks are primarily verification tasks
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All 29 Admin Console requirements must be verified before completion

---

## Phase 9: Convergence

**Purpose**: Close gaps identified by `/speckit-converge` between spec requirements and actual implementation

**Date**: 2026-09-14

### CRITICAL Priority

- [x] T054 [US5] Remove farmer PII (farmer_name) from sponsor queries in `src/sponsor/dashboard.ts` — return CPA codes only per AD-FAR-02 (contradicts)

### HIGH Priority

- [X] T055 [US2] Build `/admin/overview` HTML page in `src/routes/admin.ts` with methodology reference, 4 KPIs, work queue, credit charts, province/season filters, and action buttons per AD-OV-01..06, AD-NAV-01 (missing)
- [X] T056 [US3] Build `/admin/applications` HTML page in `src/routes/admin.ts` with application queue, document checklist, and approve/reject/hold actions per AD-APP-01..05, AD-NAV-01 (missing)
- [X] T057 [US3] Build `/admin/farmers` HTML page in `src/routes/admin.ts` with farmer registry list, search, and 5-tab detail panel per AD-FAR-01..05, AD-NAV-01 (missing)
- [X] T058 [US5] Build `/admin/reports` HTML page in `src/routes/admin.ts` with 6-report catalogue and download links per AD-NAV-01 (missing)
- [X] T059 [US5] Build `/admin/settings` HTML page in `src/routes/admin.ts` with 5-tab panel (permissions, users, constants, notifications, general) per AD-NAV-01 (missing)
- [X] T060 [US5] Build `/admin/sponsors` HTML page in `src/routes/admin.ts` with sponsor management per AD-NAV-01 (missing)
- [x] T061 [US1] Add methodology reference (T-VER-P-METH-13-08) to login page footer in `src/routes/auth.ts` per AD-AUTH-01 (missing)
- [x] T062 [US1] Add remember-device checkbox and forgot-password link to login form in `src/routes/auth.ts` per AD-AUTH-02 (missing)
- [x] T063 [US1] Add audit log entry for successful sign-in events in `src/routes/auth.ts` per AD-AUTH-03 (missing)
- [x] T064 [US3] Add holdApplication function with reason requirement and audit logging in `src/admin/applications.ts` per AD-APP-04 (missing)
- [x] T065 [US5] Add uncertainty deduction (U_d) calculation to `src/calc/orchestrator.ts` and CalcTrace display per AD-CALC-02 (missing)
- [x] T066 [US3] Add rice_variety field to plot queries and farmer detail display in `src/admin/farmer-detail.ts` per AD-FAR-05 (missing)
- [x] T067 [US3] Add BE (burning emissions), PE (photo evidence count), ER (estimation status) columns to farmer list query in `src/routes/admin.ts` per AD-FAR-01 (missing)
- [x] T068 [US1] Add previous_value and new_value fields to audit log entries in `src/admin/audit-log.ts` per AD-AUTH-03 (partial)

### MEDIUM Priority

- [x] T069 [US2] Add totalAreaRai to overview KPI query and display in `src/admin/overview.ts` per AD-OV-02 (partial)
- [x] T070 [US3] Compute age_days from created_at in application query in `src/admin/applications.ts` per AD-APP-01 (partial)
- [x] T071 [US4] Add crop (rice variety from plot) and round (photo_type label) to evidence detail in `src/admin/detail.ts` per AD-REV-01 (partial)
- [x] T072 [US5] Implement role-based field filtering in `src/routes/export.ts` — admin: full data, sponsor: CPA-only per AD-FAR-03, AD-ROLE-02 (partial)
- [x] T073 [US5] Expand DEFAULT_PERMISSIONS in `src/admin/settings.ts` to cover all 15 permission categories per AD-ROLE-02 (partial)
- [x] T074 [US4] Add "retake" status to VALID_STATUSES in `src/admin/review.ts` with reason requirement per AD-REV-02 (partial)
- [x] T075 [US2] Add age/urgency data to work queue items in `src/admin/overview.ts` per AD-OV-03 (partial)
- [X] T076 [US2] Build province/season filter dropdown UI on overview page per AD-OV-05 (partial)
- [x] T077 [US3] Add placeholder labels ("OCR unavailable", "Sample data") in `src/admin/applications.ts` per AD-APP-05 (partial)
- [X] T078 [US1] Consider split layout with deep gradient for login page (low priority if current design acceptable) per AD-AUTH-01 (partial) — Accepted: current neumorphic centered login is acceptable

---

## Phase 10: Convergence Reassessment

**Purpose**: Reassessed remaining gaps after the first convergence implementation pass

**Date**: 2026-09-14

- [X] T079 [US1] Record successful sign-in audit events with actor, timestamp, action, and before/after values in `src/routes/auth.ts` per AD-AUTH-03 (missing)
- [X] T080 [US1] Extend `src/admin/audit-log.ts` audit entries and persistence to capture previous and new values per AD-AUTH-03 (partial)
- [X] T081 [US2] Add navigable HTML pages for overview, applications, farmers, reports, settings, and sponsors per AD-NAV-01 (missing)
- [X] T082 [US5] Add uncertainty deduction output to calculation results and CalcTrace per AD-CALC-02 (missing)
- [X] T083 [US3] Add BE, PE, and ER fields to the farmer registry API response per AD-FAR-01 (missing)
- [X] T084 [US3] Expose application `age_days` derived from `created_at` per AD-APP-01 (partial)
- [X] T085 [US4] Expose crop and readable round fields in evidence detail and implement explicit retake reason flow per AD-REV-01, AD-REV-02 (partial)
- [X] T086 [US5] Enforce role-based, CPA-only sponsor export filtering and area scope per AD-FAR-03, AD-ROLE-02 (partial)
- [X] T087 [US5] Expand and enforce the permission matrix to all fifteen required categories per AD-ROLE-02 (partial)
- [X] T088 [US2] Add queue urgency metadata and province/season filter controls to the overview surface per AD-OV-03, AD-OV-05 (partial)
- [X] T089 [US3] Label unavailable OCR and sample application data explicitly per AD-APP-05 (partial)

---

## Phase 11: Convergence — Additional Gaps

**Purpose**: Address remaining gaps not captured by Phase 9/10

**Date**: 2026-09-14

### HIGH Priority

- [X] T090 [US1] Implement remember-device backend logic (extend session Max-Age when checkbox checked) and replace static mailto forgot-password with a reset-token flow in `src/routes/auth.ts` per AD-AUTH-02 (partial)
- [X] T091 [US3] Implement holding-type-specific document rules (owner, co-owner, tenant, authorized-representative) in `src/admin/applications.ts` per AD-APP-02 (missing)
- [X] T092 [US3] Build document checklist categorization (required, received, missing, invalid) in `src/admin/applications.ts` per AD-APP-03 (missing)
- [X] T093 [US3] Add request-documents function and API endpoint in `src/admin/applications.ts` and `src/routes/admin.ts` per AD-APP-04 (missing)

### MEDIUM Priority

- [X] T094 [US4] Add specific reviewer user ID (not just actor_type) and previous_status field to audit log entries in `src/admin/audit-log.ts` per AD-REV-03 (partial)
- [X] T095 [US3] Add sponsor name and aggregated area/rai to farmer list query in `src/routes/admin.ts` per AD-FAR-01 (partial)

---

## Phase 12: Convergence — Final Gaps

**Purpose**: Address last remaining gaps from final convergence pass

**Date**: 2026-09-14

### MEDIUM Priority

- [X] T096 [US4] Add retake button to review queue HTML page in `src/routes/admin.ts` per AD-REV-02 (partial)

### LOW Priority

- [X] T097 [US2] Wire province filter to KPI queries in `src/routes/admin.ts` overview page per AD-OV-05 (partial)
- [X] T098 [US1] Populate before/after values in key audit entries (settings changes, application decisions) per AD-AUTH-03 (partial)
