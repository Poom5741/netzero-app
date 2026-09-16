# Tasks: Hybrid Test Pyramid

**Input**: Design documents from `/specs/007-hybrid-test-pyramid/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: YES - This feature IS about testing infrastructure

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Existing test infrastructure: `tests/helpers/integration.ts` (MockDB + seed helpers)
- Test runner: bun test

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and test infrastructure setup

- [X] T001 Create test fixture directories: `tests/fixtures/line-events/`, `tests/fixtures/message-snapshots/`
- [X] T002 [P] Create `.env.test` file with placeholder test credentials (gitignored)
- [X] T003 [P] Add `.env.test` to `.gitignore` (already covered by `.env.*` pattern)
- [X] T004 [P] Create test signature generator in `tests/helpers/signature.ts`
- [X] T005 Create fake LINE transport in `tests/helpers/line-transport.ts` (captures pushMessage calls)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core test infrastructure that MUST be complete before ANY user story can be implemented

**️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Extend MockDB in `tests/helpers/integration.ts` with `seedLineLink()` helper for creating test LINE linkage records
- [X] T007 [P] Create LIFF adapter interface in `src/line/liff-adapter.ts` (LiffAdapter interface + FakeLiffAdapter implementation)
- [X] T008 [P] Create webhook fixture loader in `tests/helpers/fixtures.ts` (loads JSON fixtures from `tests/fixtures/line-events/`)
- [X] T009 Create test harness in `tests/helpers/test-harness.ts` (combines MockDB + fake transport + fixture loader for handleFlow() testing)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - State-Machine and Webhook Contract Tests (Priority: P1) 🎯 MVP

**Goal**: Verify every conversation transition, business rule, and webhook signature without opening LINE. Each test posts a fixture event directly to `handleFlow()` with a valid test signature and asserts state transitions, reply payloads, and database changes.

**Independent Test**: Can be fully tested by running `bun test tests/unit/state-machine.test.ts` and verifying all 36-54 fixtures pass with isolated MockDB instances.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T010 [P] [US1] Create state-machine test file `tests/unit/state-machine.test.ts` with MockDB isolation per test
- [X] T011 [P] [US1] Create webhook contract test file `tests/unit/webhook-contract.test.ts` for signature validation
- [X] T012 [US1] Create welcome state fixtures: `tests/fixtures/line-events/welcome-001.json` (new user sends "ลงทะเบียน" → consent)
- [X] T013 [US1] Create consent state fixtures: `tests/fixtures/line-events/consent-001.json` (accept all → phone)
- [X] T014 [US1] Create phone state fixtures: `tests/fixtures/line-events/phone-001.json` (valid phone → identity_confirm)
- [X] T015 [US1] Create identity_confirm state fixtures: `tests/fixtures/line-events/identity-001.json` (yes → conditions)
- [X] T016 [US1] Create conditions state fixtures: `tests/fixtures/line-events/conditions-001.json` (accept → registration)
- [ ] T017 [US1] Create registration state fixtures: `tests/fixtures/line-events/registration-001.json` (complete → documents)
- [ ] T018 [US1] Create documents state fixtures: `tests/fixtures/line-events/documents-001.json` (complete → pending_review)
- [ ] T019 [US1] Create pending_review state fixtures: `tests/fixtures/line-events/pending-review-001.json` (any message → stay)
- [X] T020 [US1] Create calendar state fixtures: `tests/fixtures/line-events/calendar-001.json` (ถ่ายรูป → photo_report)
- [ ] T021 [US1] Create photo_report state fixtures: `tests/fixtures/line-events/photo-report-001.json` (ดูผล → results)
- [ ] T022 [US1] Create results state fixtures: `tests/fixtures/line-events/results-001.json` (ดูปฏิทิน → calendar)
- [X] T023 [US1] Create chat state fixtures: `tests/fixtures/line-events/chat-001.json` (สวัสดี → stay with greeting)
- [ ] T024 [US1] Create confirm_draft state fixtures: `tests/fixtures/line-events/confirm-draft-001.json` (ยืนยัน → chat)
- [X] T025 [US1] Create webhook signature test fixtures: `tests/fixtures/line-events/invalid-signature-001.json`

### Implementation for User Story 1

- [ ] T026 [US1] Implement state-machine test runner in `tests/unit/state-machine.test.ts` (loads fixtures, calls handleFlow(), asserts state + reply + DB changes)
- [X] T027 [US1] Implement webhook signature validation tests in `tests/unit/webhook-contract.test.ts` (valid signature → 200, invalid → 401)
- [ ] T028 [US1] Add test credential loading from `.env.test` in `tests/helpers/config.ts`
- [ ] T029 [US1] Add `npm run test:state-machine` script to `package.json`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Run `bun test tests/unit/state-machine.test.ts` to verify all fixtures pass.

---

## Phase 4: User Story 2 - Message Validation and Snapshot Tests (Priority: P1)

**Goal**: Every Flex Message builder and Rich Menu configuration must produce deterministic JSON that is validated against LINE's message-validation endpoint. Snapshots capture the complete JSON including labels, action order, postback data, URLs, alt text, and Rich Menu tap-area coordinates.

**Independent Test**: Can be fully tested by running `bun test tests/unit/message-snapshot.test.ts` and verifying all snapshots match golden JSON.

### Tests for User Story 2 ⚠️

- [X] T030 [P] [US2] Create message snapshot test file `tests/unit/message-snapshot.test.ts`
- [X] T031 [P] [US2] Create welcome bubble snapshot: `tests/fixtures/message-snapshots/welcome-bubble.json`
- [X] T032 [P] [US2] Create consent bubble snapshot: `tests/fixtures/message-snapshots/consent-bubble.json`
- [X] T033 [P] [US2] Create identity confirm bubble snapshot: `tests/fixtures/message-snapshots/identity-confirm-bubble.json`
- [X] T034 [P] [US2] Create conditions bubble snapshot: `tests/fixtures/message-snapshots/conditions-bubble.json`
- [X] T035 [P] [US2] Create registration link bubble snapshot: `tests/fixtures/message-snapshots/registration-link-bubble.json`
- [X] T036 [P] [US2] Create calendar bubble snapshot: `tests/fixtures/message-snapshots/calendar-bubble.json`
- [X] T037 [P] [US2] Create consent 4-checkbox snapshot: `tests/fixtures/message-snapshots/consent-4-checkbox.json`
- [X] T038 [P] [US2] Create conditions 3-checkbox snapshot: `tests/fixtures/message-snapshots/conditions-3-checkbox.json`
- [X] T039 [P] [US2] Create dashboard bubble snapshot: `tests/fixtures/message-snapshots/dashboard-bubble.json`

### Implementation for User Story 2

- [X] T040 [US2] Implement message snapshot test runner in `tests/unit/message-snapshot.test.ts` (calls builders, compares to golden JSON, optionally validates against LINE endpoint)
- [ ] T041 [US2] Add LINE message validation endpoint integration in `tests/helpers/line-validation.ts` (POST to `https://api.line.me/v2/bot/message/validate`)
- [X] T042 [US2] Add `npm run test:snapshots` script to `package.json`
- [X] T043 [US2] Add `npm run test:snapshots -- --update` flag support for regenerating golden snapshots

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Run `bun test tests/unit/` to verify all state-machine and snapshot tests pass.

---

## Phase 5: User Story 3 - LIFF Browser Tests (Priority: P2)

**Goal**: The LIFF pages (registration, camera, calendar, summary, validation) must be tested in a real browser with a fake LIFF adapter that provides deterministic profiles and tokens. Camera and geolocation are injected through test fixtures.

**Independent Test**: Can be fully tested by running `bun test tests/integration/liff-browser.test.ts` and verifying all 6 LIFF pages render and function correctly with the fake adapter.

### Tests for User Story 3 ⚠️

- [X] T044 [P] [US3] Create LIFF browser test file `tests/integration/liff-browser.test.ts`
- [ ] T045 [P] [US3] Create registration page test: verify form submission posts to backend and shows success
- [ ] T046 [P] [US3] Create camera page test: verify file selection triggers upload and shows confirmation thumbnail
- [ ] T047 [P] [US3] Create calendar page test: verify seasons display with correct stage, date range, and photo count
- [ ] T048 [P] [US3] Create summary page test: verify carbon estimate, methodology, and outstanding work display
- [ ] T049 [P] [US3] Create auth failure test: verify error state with retry option when LIFF adapter returns failure
- [ ] T050 [P] [US3] Create GPS permission test: verify photo uploads without GPS metadata when permission denied

### Implementation for User Story 3

- [X] T051 [US3] Create fake LIFF adapter factory in `src/line/liff-adapter.ts` (FakeLiffAdapter with configurable profile/token)
- [X] T052 [US3] Create LIFF test harness in `tests/helpers/liff-harness.ts` (sets up fake adapter, navigates to LIFF pages, asserts DOM state)
- [X] T053 [US3] Add browser test dependencies (Playwright or Puppeteer) to `package.json` if not already present
- [X] T054 [US3] Add `npm run test:liff` script to `package.json`
- [X] T055 [US3] Configure browser test environment in `tests/helpers/browser-config.ts` (headless mode, viewport, timeouts)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently. Run `bun test tests/` to verify all unit and integration tests pass.

---

## Phase 6: User Story 4 - Real-Device Smoke Tests (Priority: P3)

**Goal**: A physical iPhone or Android phone must verify the complete farmer experience including Rich Menu rendering, camera/GPS permissions, EXIF handling, and Thai text wrapping on small and large screens.

**Independent Test**: Can be fully tested by following the 10-15 step checklist on a physical device before each release.

### Tests for User Story 4

- [X] T056 [US4] Create smoke test checklist in `tests/e2e/smoke-test-checklist.md` with 10-15 verification steps
- [X] T057 [US4] Add welcome message rendering verification step
- [X] T058 [US4] Add Rich Menu region tap verification steps (calendar, camera, summary, contact)
- [X] T059 [US4] Add LIFF camera GPS photo upload verification step
- [X] T060 [US4] Add rejection retake link verification step
- [X] T061 [US4] Add Thai text wrapping verification on small phone (iPhone SE)
- [X] T062 [US4] Add Thai text wrapping verification on large phone (iPhone Pro Max)
- [X] T063 [US4] Add blocked/pending-account behavior verification step

### Implementation for User Story 4

- [ ] T064 [US4] Create test OA and test LIFF channel in LINE Developers Console (separate from production)
- [ ] T065 [US4] Configure test OA webhook to point to test environment
- [ ] T066 [US4] Seed test database with test farmer accounts and plots
- [ ] T067 [US4] Document test OA credentials in team wiki or password manager (NOT in source code)

**Checkpoint**: All user stories should now be independently functional. Real-device testing is manual but documented.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T068 [P] Update `AGENTS.md` with test pyramid documentation (70/20/10 split, when to use each layer)
- [ ] T069 [P] Add test coverage reporting to CI pipeline
- [ ] T070 [P] Add test execution time monitoring (alert if state-machine tests exceed 10 seconds)
- [ ] T071 Code cleanup: remove any duplicate test helpers or unused fixtures
- [ ] T072 [P] Add visual regression tests for UI changes (if not already present)
- [ ] T073 Run quickstart.md validation: execute all test commands and verify expected outcomes
- [ ] T074 [P] Update README.md with test pyramid overview and quickstart commands

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P3)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on US1
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies on US1/US2
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories, but requires test OA setup

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Fixtures before test runners
- Test harness before test files
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002-T005)
- All Foundational tasks marked [P] can run in parallel (T007-T008)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All fixtures for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all fixture creation for User Story 1 together:
Task: "Create welcome state fixtures: tests/fixtures/line-events/welcome-001.json"
Task: "Create consent state fixtures: tests/fixtures/line-events/consent-001.json, consent-002.json"
Task: "Create phone state fixtures: tests/fixtures/line-events/phone-001.json, phone-002.json, phone-003.json"
# ... etc

# Launch all test files for User Story 1 together:
Task: "Create state-machine test file tests/unit/state-machine.test.ts"
Task: "Create webhook contract test file tests/unit/webhook-contract.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T009) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T010-T029)
4. **STOP and VALIDATE**: Run `bun test tests/unit/state-machine.test.ts` - verify all fixtures pass
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Manual testing documented
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (state-machine tests)
   - Developer B: User Story 2 (message snapshots)
   - Developer C: User Story 3 (LIFF browser tests)
   - Developer D: User Story 4 (real-device smoke tests)
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
- **Existing infrastructure**: Use MockDB from `tests/helpers/integration.ts`, bun test runner, existing seed helpers
- **Constitution compliance**: YAGNI (no new test frameworks), Production-First (tests run against deployed workers.dev where possible)
