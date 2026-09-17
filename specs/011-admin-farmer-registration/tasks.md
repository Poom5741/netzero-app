---
description: "Task list for admin farmer registration feature implementation"
---

# Tasks: Admin Farmer Registration

**Input**: Design documents from `/specs/011-admin-farmer-registration/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Paths shown below follow the web application structure from plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create feature branch 011-admin-farmer-registration
- [ ] T002 Verify existing project structure matches plan.md requirements
- [ ] T003 [P] Set up any additional development dependencies if needed

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Verify existing admin authentication middleware works for farmer creation endpoint
- [ ] T005 [P] Review existing farmers table schema in src/db/migrate.sql for compatibility
- [ ] T006 [P] Review existing farmer creation patterns in src/farmer/create.ts for reference
- [ ] T007 Create farmer creation service utility in src/farmer/create.ts based on existing patterns
- [ ] T008 Verify LINE flow integration compatibility with admin-created farmers
- [ ] T009 Set up audit logging utility for farmer creation tracking

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Admin Adds New Farmer (Priority: P1) 🎯 MVP

**Goal**: Enable admin users to create new farmers through the admin dashboard UI with proper validation and database persistence

**Independent Test**: Admin can successfully create a new farmer through the dashboard UI, and that farmer can immediately register via LINE using their phone number.

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Contract test for POST /api/admin/farmers endpoint in tests/contract/test_farmer_creation.py
- [ ] T011 [P] [US1] Integration test for farmer creation flow in tests/integration/test_farmer_creation.py

### Implementation for User Story 1

- [ ] T012 [P] [US1] Create POST /api/admin/farmers endpoint in src/routes/admin.ts with admin auth middleware
- [ ] T013 [P] [US1] Implement phone number validation logic in src/lib/validation.ts (regex /^0\d{9}$/)
- [ ] T014 [US1] Implement farmer creation service in src/farmer/create.ts with phone uniqueness check
- [ ] T015 [US1] Add farmer creation audit logging in src/lib/audit.ts
- [ ] T016 [US1] Create farmer creation form component in frontend/src/components/admin/add-farmer-form.tsx
- [ ] T017 [US1] Add "Add Farmer" button to frontend/src/app/admin/farmers/page.tsx
- [ ] T018 [US1] Implement farmer creation API client in frontend/src/lib/api.ts
- [ ] T019 [US1] Add success/error handling and Thai language messages in frontend components
- [ ] T020 [US1] Implement rate limiting for farmer creation endpoint

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Farmer Registers via LINE After Admin Creation (Priority: P1)

**Goal**: Ensure that farmers created by admin can immediately register via LINE chat using their phone number and proceed through existing flow

**Independent Test**: A farmer created by an admin can immediately register via LINE using their phone number and proceed through the existing flow.

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T021 [P] [US2] Integration test for LINE registration with admin-created farmer in tests/integration/test_line_registration.py
- [ ] T022 [P] [US2] Unit test for handlePhone function with admin-created farmer in tests/unit/line/calendar-photo-action.test.ts

### Implementation for User Story 2

- [ ] T023 [P] [US2] Verify handlePhone function in src/line/flow.ts works with admin-created farmers
- [ ] T024 [US2] Update any necessary validation in LINE flow to accommodate admin-created farmers
- [ ] T025 [US2] Add integration test to verify LINE registration works with admin-created farmers
- [ ] T026 [US2] Test that admin-created farmers can complete full LINE registration flow

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Admin Views Farmer Details (Priority: P2)

**Goal**: Ensure that farmers created via admin interface appear in the farmer list and can be viewed with all their details

**Independent Test**: Farmers created via admin interface appear in the farmer list and can be viewed with all their details.

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T027 [P] [US3] Integration test for viewing admin-created farmers in tests/integration/test_farmer_view.py
- [ ] T028 [P] [US3] E2E test for admin farmer creation and viewing in tests/e2e/test_admin_flow.py

### Implementation for User Story 3

- [ ] T029 [P] [US3] Verify admin farmers list page displays admin-created farmers correctly
- [ ] T030 [US3] Update farmer detail view to show all fields for admin-created farmers
- [ ] T031 [US3] Add refresh mechanism to update farmer list after successful creation
- [ ] T032 [US3] Test that newly created farmers appear immediately in the list

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T033 [P] Update documentation in docs/ for admin farmer registration feature
- [ ] T034 Add input sanitization to prevent injection attacks in farmer creation
- [ ] T035 [P] Run quickstart.md validation scenarios to verify complete functionality
- [ ] T036 [P] Add additional unit tests for edge cases in src/farmer/create.ts
- [ ] T037 Security review of admin authentication and authorization for farmer creation
- [ ] T038 Run end-to-end tests for the complete admin farmer registration flow

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
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

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
# Launch all tests for User Story 1 together (if tests requested):
Task: "Contract test for POST /api/admin/farmers endpoint in tests/contract/test_farmer_creation.py"
Task: "Integration test for farmer creation flow in tests/integration/test_farmer_creation.py"

# Launch all implementation tasks for User Story 1 together:
Task: "Create POST /api/admin/farmers endpoint in src/routes/admin.ts with admin auth middleware"
Task: "Implement phone number validation logic in src/lib/validation.ts (regex /^0\d{9}$/)"
Task: "Create farmer creation form component in frontend/src/components/admin/add-farmer-form.tsx"
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
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence