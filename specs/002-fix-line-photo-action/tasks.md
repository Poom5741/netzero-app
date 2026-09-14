# Tasks: Fix Native LINE WET-1 Photo Action

**Input**: Design documents from `specs/002-fix-line-photo-action/`

**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Tests are included — TDD approach for this bug fix.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `src/` at repository root (Cloudflare Workers + Hono)
- **Tests**: `tests/unit/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Inspect current `buildCalendarBubble()` implementation in `src/line/flex-builders.ts`
- [x] T002 [P] Identify current photo button action type and URL format

**Checkpoint**: Setup complete — understand current implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Verify LIFF_ID environment variable is available in `src/line/flow.ts`
- [x] T004 [P] Confirm Flex Message schema supports `type: "uri"` action

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Native LINE Calendar Photo Button Opens LIFF Camera (Priority: P1)  MVP

**Goal**: Fix the photo button to use URI action with correct LIFF camera URL

**Independent Test**: Tap WET-1 "ถ่ายรูป" button in real LINE app and verify LIFF camera opens with correct step parameter

### Tests for User Story 1 ⚠️

- [x] T005 [P] [US1] Unit test: verify photo button uses `type: "uri"` action in `tests/unit/line/calendar-photo-action.test.ts`
- [x] T006 [P] [US1] Unit test: verify LIFF camera URL includes step parameter in `tests/unit/line/calendar-photo-action.test.ts`
- [x] T007 [P] [US1] Unit test: verify LIFF camera URL includes plot_id and season_id in `tests/unit/line/calendar-photo-action.test.ts`

### Implementation for User Story 1

- [x] T008 [US1] Change photo button action from `postback` to `uri` in `src/line/flex-builders.ts:buildCalendarBubble()`
- [x] T009 [US1] Construct LIFF camera URL: `https://liff.line.me/${liffId}/camera?step=${step.stepCode}&plot_id=${plotId}&season_id=${seasonId}` in `src/line/flex-builders.ts:buildCalendarBubble()`
- [x] T010 [US1] Add error handling for missing LIFF_ID: return Thai error message in `src/line/flex-builders.ts:buildCalendarBubble()`

**Checkpoint**: User Story 1 complete — WET-1 button opens LIFF camera with correct parameters

---

## Phase 4: User Story 2 - All Photo Rounds Work Consistently (Priority: P1)

**Goal**: Ensure all 4 photo rounds (WET-1, DRY-1, WET-2, DRY-2) work identically

**Independent Test**: Tap each of the 4 photo round buttons and verify each opens LIFF camera with correct step parameter

### Tests for User Story 2 ⚠️

- [x] T011 [P] [US2] Unit test: verify DRY-1 (SG-05) button opens LIFF camera with correct step in `tests/unit/line/calendar-photo-action.test.ts`
- [x] T012 [P] [US2] Unit test: verify WET-2 (SG-07) button opens LIFF camera with correct step in `tests/unit/line/calendar-photo-action.test.ts`
- [x] T013 [P] [US2] Unit test: verify DRY-2 (SG-08) button opens LIFF camera with correct step in `tests/unit/line/calendar-photo-action.test.ts`

### Implementation for User Story 2

- [x] T014 [US2] Verify all 4 photo steps (SG-04, SG-05, SG-07, SG-08) render photo buttons in `src/line/flex-builders.ts:buildCalendarBubble()`
- [x] T015 [US2] Verify each button uses correct step code in URL in `src/line/flex-builders.ts:buildCalendarBubble()`

**Checkpoint**: User Story 2 complete — all 4 photo rounds work consistently

---

## Phase 5: User Story 3 - Error Handling for Missing LIFF ID (Priority: P2)

**Goal**: Provide clear error message when LIFF_ID is missing or invalid

**Independent Test**: Remove LIFF_ID environment variable and verify button shows Thai error message

### Tests for User Story 3 ⚠️

- [x] T016 [P] [US3] Unit test: verify error message when LIFF_ID is missing in `tests/unit/line/calendar-photo-action.test.ts`
- [x] T017 [P] [US3] Unit test: verify error message when LIFF_ID is empty string in `tests/unit/line/calendar-photo-action.test.ts`

### Implementation for User Story 3

- [x] T018 [US3] Add LIFF_ID validation check in `src/line/flex-builders.ts:buildCalendarBubble()`
- [x] T019 [US3] Return Thai error message: "กล้องถ่ายรูปยังไม่พร้อมใช้งาน กรุณาติดต่อเจ้าหน้าที่" in `src/line/flex-builders.ts:buildCalendarBubble()`

**Checkpoint**: User Story 3 complete — graceful error handling for missing LIFF_ID

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T020 [P] Run unit tests: `npm run check:test` (all tests pass)
- [x] T021 [P] Run typecheck: `npm run check:type` (no errors)
- [ ] T022 [P] Manual QA: test in real LINE desktop app (requires triggering new calendar message after deployment)
- [ ] T023 [P] Manual QA: test in real LINE mobile app
- [x] T024 [P] Deploy to production: `script -q /dev/null wrangler deploy`
- [x] T025 [P] Verify in real LINE app after deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) — Depends on US1 implementation (same function)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) — Depends on US1 implementation (same function)

### Within Each User Story

- Tests written and FAIL before implementation (TDD)
- Implementation before tests pass
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task T005: "Unit test: verify photo button uses type: uri action"
Task T006: "Unit test: verify LIFF camera URL includes step parameter"
Task T007: "Unit test: verify LIFF camera URL includes plot_id and season_id"

# Then implement:
Task T008: "Change photo button action from postback to uri"
Task T009: "Construct LIFF camera URL with step, plot_id, season_id"
Task T010: "Add error handling for missing LIFF_ID"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (WET-1 button fix)
4. **STOP and VALIDATE**: Test WET-1 button in real LINE app
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (WET-1 fix) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (all 4 rounds) → Test independently → Deploy/Demo
4. Add User Story 3 (error handling) → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (WET-1 fix)
   - Developer B: User Story 2 (all rounds) — after US1 complete
   - Developer C: User Story 3 (error handling) — after US1 complete
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- TDD: tests written first, fail, then implement
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- This is a bug fix — minimal changes to existing code
- Manual QA in real LINE app is critical (not just web mock)

---

## Phase 7: Convergence

- [ ] T026 Add redacted LIFF URL-generation logging per FR-007 in `src/line/flex-builders.ts` (missing)
- [ ] T027 Trigger a fresh post-deployment calendar message and verify WET-1 opens LIFF with `step=SG-04`, `plot_id`, and `season_id` per US1/AC1, US1/AC2, and SC-001 (partial)
- [ ] T028 Implement and test rapid-tap debounce behavior per FR-009 in the LIFF camera client, or document and verify the platform-level URI-action limitation (missing)
