# Feature Specification: Hybrid Test Pyramid for LINE OA

**Feature Branch**: `007-hybrid-test-pyramid`

**Created**: 2026-09-16

**Status**: Draft

**Input**: User description: Implement a hybrid test pyramid for NetZeroCarbon LINE OA covering state-machine tests, webhook contract tests, message snapshot tests, LIFF browser tests, and real-device smoke tests. The strategy replaces expensive full end-to-end computer-use testing with a layered approach: 70% state-machine and webhook contract tests, 20% LIFF browser and visual tests, 10% real LINE mobile smoke tests.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - State-Machine and Webhook Contract Tests (Priority: P1)

The system must verify every conversation transition, business rule, and webhook signature without opening LINE. Each scenario fixture contains a LINE webhook event posted directly to the handler with a valid test signature. The test asserts current state, incoming message or postback, next state, reply JSON, database changes, required actions, deep links, and privacy/activation gates.

**Why this priority**: Covers ~70% of branches quickly, runs on every commit, catches regressions in conversation logic before they reach any UI layer.

**Independent Test**: Can be fully tested by posting fixture events to the webhook handler and asserting reply payloads and state transitions. Delivers confidence that the conversation engine works correctly without any browser or device.

**Acceptance Scenarios** (state names match `ConversationState` type in `src/line/flow.ts:44-63`):

1. **Given** a new user in `welcome` state sends "ลงทะเบียน", **When** `handleFlow()` processes the event, **Then** the state advances to `consent` and the reply contains the PDPA consent message.
2. **Given** a user in `consent` state sends "consent_accept_all", **When** `handleFlow()` processes it, **Then** the state advances to `phone` and the reply requests phone number input.
3. **Given** a user in `phone` state shares a phone that matches a registered farmer, **When** `handleFlow()` processes the event, **Then** the state advances to `identity_confirm` and the reply shows the farmer's name and location for confirmation.
4. **Given** a user in `phone` state shares a phone that does NOT match any farmer, **When** `handleFlow()` processes the event, **Then** the reply contains "ไม่พบข้อมูลเกษตรกรในระบบ" and the state remains at `phone`.
5. **Given** a user in `identity_confirm` state sends "ใช่", **When** `handleFlow()` processes it, **Then** the state advances to `conditions` and the reply shows the 3 project conditions.
6. **Given** a user in `conditions` state sends "ยอมรับ", **When** `handleFlow()` processes it, **Then** the state advances to `registration` and the reply contains the LIFF registration deep link.
7. **Given** a user in `calendar` state sends "ถ่ายรูป", **When** `handleFlow()` processes it, **Then** the state advances to `photo_report` and the reply contains the LIFF camera link.
8. **Given** a user in `photo_report` state sends "ดูผล", **When** `handleFlow()` processes it, **Then** the state advances to `results` and the reply shows the dashboard bubble.
9. **Given** a webhook event with an invalid signature, **When** the webhook handler receives it, **Then** the event is rejected with 401 and no state change occurs.
10. **Given** a user in `pending_review` state sends any message, **When** `handleFlow()` processes it, **Then** the reply shows the waiting message and the state remains at `pending_review`.
11. **Given** a user in `chat` state sends "สวัสดี", **When** `handleFlow()` processes it, **Then** the reply contains the greeting quick reply and the state remains at `chat`.
12. **Given** a user in `chat` state sends fertilizer data that triggers AI draft creation, **When** `handleFlow()` processes it, **Then** the state advances to `confirm_draft` and the reply asks for confirmation.

---

### User Story 2 - Message Validation and Snapshot Tests (Priority: P1)

Every Flex Message builder and Rich Menu configuration must produce deterministic JSON that is validated against LINE's message-validation endpoint. Snapshots capture the complete JSON including labels, action order, postback data, URLs, alt text, and Rich Menu tap-area coordinates.

**Why this priority**: Catches functional mistakes in message payloads (wrong labels, broken postbacks, invalid coordinates) without sending messages or opening any UI. Runs on every commit.

**Independent Test**: Can be fully tested by importing each message builder, calling it with fixture data, and comparing the output JSON against a stored snapshot. Delivers confidence that every message the farmer sees is structurally correct.

**Acceptance Scenarios**:

1. **Given** the welcome message builder is called with a new user's name, **When** the JSON is generated, **Then** it matches the golden snapshot and passes LINE's message-validation endpoint.
2. **Given** the consent message builder is called, **When** the JSON is generated, **Then** quick-reply actions contain correct postback data for accept and reject.
3. **Given** the calendar Flex message builder is called with season data, **When** the JSON is generated, **Then** it contains the correct season name, date range, and stage indicators.
4. **Given** the photo-reminder message builder is called with 2/4 photos uploaded, **When** the JSON is generated, **Then** it shows the correct progress and LIFF camera link.
5. **Given** the Rich Menu configuration, **When** validated against LINE's validation endpoint, **Then** all tap-area coordinates match the menu image and actions are valid.
6. **Given** a rejection message builder is called with a reason, **When** the JSON is generated, **Then** it contains the retake LIFF link and the rejection reason text.

---

### User Story 3 - LIFF Browser Tests (Priority: P2)

The LIFF pages (registration, camera UI, calendar, summary, validation) must be tested in a real browser with a fake LIFF adapter that provides deterministic profiles and tokens. Camera and geolocation are injected through test fixtures.

**Why this priority**: Covers the LIFF surface that cannot be tested through chat alone. Runs on every PR. Separates LIFF logic from LINE SDK dependency so tests are fast and deterministic.

**Independent Test**: Can be fully tested by opening each LIFF route in a browser with the fake adapter, interacting with forms and buttons, and asserting DOM state and API calls. Delivers confidence that LIFF pages render and function correctly.

**Acceptance Scenarios**:

1. **Given** the registration page is opened with a valid LIFF profile, **When** the user fills in plot details and submits, **Then** the data is posted to the backend and a success confirmation is shown.
2. **Given** the camera page is opened with plot and season context, **When** the user selects a file, **Then** the upload succeeds and a confirmation thumbnail is displayed.
3. **Given** the calendar page is opened with active seasons, **When** the page loads, **Then** each season shows the correct stage, date range, and photo count.
4. **Given** the summary page is opened with completed evidence, **When** the page loads, **Then** the carbon estimate, methodology, and outstanding work are displayed.
5. **Given** the LIFF adapter returns an authentication failure, **When** any LIFF page loads, **Then** an error state is shown with a retry option.
6. **Given** the camera page is opened without GPS permission in the fixture, **When** the user uploads a photo, **Then** the photo is accepted but GPS metadata is marked as unavailable.

---

### User Story 4 - Real-Device Smoke Tests (Priority: P3)

A physical iPhone or Android phone must verify the complete farmer experience including Rich Menu rendering, camera/GPS permissions, EXIF handling, and Thai text wrapping on small and large screens.

**Why this priority**: Rich Menus are unavailable in LINE for Mac/Windows. Camera permissions, GPS, and EXIF handling require real device hardware. This is the only layer that proves the full farmer journey works end-to-end.

**Independent Test**: Can be fully tested by following a 10-15 step checklist on a physical device before each release. Delivers confidence that the production experience matches the designed flow.

**Acceptance Scenarios**:

1. **Given** a fresh LINE account adds the NetZeroCarbon OA, **When** the welcome message arrives, **Then** it renders correctly with the farmer's name and consent quick replies.
2. **Given** the Rich Menu is displayed, **When** each region is tapped, **Then** the correct LIFF destination opens (calendar, camera, summary, contact).
3. **Given** the LIFF camera page is opened, **When** a photo is captured with GPS enabled, **Then** the photo uploads with EXIF coordinates and the confirmation shows the plot location.
4. **Given** a rejection is received, **When** the retake link is tapped, **Then** the LIFF camera opens with the correct plot and season context.
5. **Given** a small phone (e.g., iPhone SE), **When** Thai text wraps in Flex messages, **Then** no truncation or layout breakage occurs.

---

### Edge Cases

- What happens when a webhook event arrives for a user in an unexpected state (e.g., photo sent before registration)?
- How does the system handle a Rich Menu tap when the LIFF session has expired?
- What happens when the LIFF camera upload fails midway (network loss)?
- How does the system handle duplicate photo uploads for the same plot-season-stage?
- What happens when the LINE replyToken is reused (LINE allows only one use)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a test fixture framework that posts LINE webhook events directly to the handler with valid test signatures.
- **FR-002**: System MUST provide a fake LINE transport that captures outgoing reply calls for assertion without sending real messages.
- **FR-003**: System MUST provide golden JSON snapshots for every Flex Message builder and Rich Menu configuration.
- **FR-004**: System MUST validate message JSON against LINE's message-validation endpoint in tests.
- **FR-005**: System MUST provide a LIFF adapter interface with production (real SDK) and test (fake) implementations.
- **FR-006**: System MUST support resetting a test farmer to any named state (welcome, pending_review, dry_round_due, rejected_photo, results_ready) without replaying earlier steps.
- **FR-007**: System MUST provide a separate test OA and test LIFF channel with a test database, test users, and non-production webhook.
- **FR-008**: System MUST include a real-device smoke test checklist of 10-15 release verification steps.
- **FR-009**: State-machine tests MUST cover every conversation transition including consent rejected, invalid phone, identity mismatch, pending account, photo through ordinary chat, missing evidence, retake requested, four accepted photos, and results ready.
- **FR-010**: Webhook signature verification MUST be tested with both valid and invalid signatures.
- **FR-011**: Test credentials (LINE channel secret, access token, LIFF ID) MUST be loaded from environment variables via a `.env.test` file (gitignored) in test mode, and from repository secrets in CI. No credentials may be hardcoded or committed to source.
- **FR-012**: Each state-machine test MUST run against an isolated database that is created before the test and destroyed after, guaranteeing test independence and preventing state leakage between tests.

### Key Entities

- **Webhook Event Fixture**: A serialized LINE webhook event (message, postback, follow, etc.) with a valid test signature, used as input to the handler.
- **Reply Capture**: The outgoing reply payload captured by the fake transport, including message type, content, quick replies, and actions.
- **State Transition**: A tuple of (current state, event type, next state, reply payload) that defines one step in the conversation flow.
- **Message Snapshot**: A golden JSON file representing the expected output of a message builder for a given set of inputs.
- **LIFF Adapter**: An interface abstracting the LIFF SDK (getProfile, isInClient, getAccessToken, openWindow, closeWindow) with production and fake implementations.
- **Test Farmer State**: A named checkpoint (welcome, pending_review, dry_round_due, rejected_photo, results_ready) that a test farmer can be reset to.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: State-machine and webhook contract tests cover 95% of conversation branches and run in under 30 seconds on every commit, with each test using an isolated database.
- **SC-002**: Message snapshot tests catch 100% of structural changes to Flex Message JSON (labels, actions, postbacks, URLs) before they reach production.
- **SC-003**: LIFF browser tests cover all 6 LIFF pages (registration, camera, calendar, summary, contact, error) and run in under 60 seconds on every PR.
- **SC-004**: Real-device smoke test checklist is completed in under 15 minutes before each release.
- **SC-005**: A test farmer can be reset to any named state in under 5 seconds, eliminating the need to replay 20+ earlier steps.
- **SC-006**: Test suite achieves 70% state-machine/webhook, 20% LIFF browser/visual, 10% real-device smoke test coverage split.
- **SC-007**: Zero test interference failures — no test fails due to state leakage from another test, verified by running the full suite in random order.

## Clarifications

### Session 2026-09-16

- Q: What is the complete set of conversation states and transitions that the state-machine tests must cover? → A: Enumerate all states and transitions in the spec appendix
- Q: How should test credentials (LINE channel secret, access token, LIFF ID) be managed for the test OA environment? → A: Environment variables with `.env.test` file (gitignored), loaded only in test mode. CI uses repository secrets.
- Q: Should state-machine tests run against a shared test database or an isolated database per test? → A: Isolated database per test — guarantees independence, prevents flaky tests from state leakage.

### Post-Critique Fixes (2026-09-16)

- **State name alignment**: All acceptance scenarios now use exact `ConversationState` values from `src/line/flow.ts:44-63` (e.g., `consent` not `consent-pending`, `identity_confirm` not skipped)
- **Removed non-existent states**: Deleted scenarios referencing `results-ready` and admin retake (not in chat state machine)
- **Test infrastructure alignment**: Plan now uses existing MockDB (`tests/helpers/integration.ts`) and bun test runner, not Vitest + wrangler d1 (YAGNI compliance)
- **Webhook dispatch**: Tests call `handleFlow()` directly, not through HTTP webhook handler (webhook.ts only verifies signatures)

## Assumptions

- LINE's message-validation and Rich Menu validation endpoints are available and free to call in test environments.
- The test OA and test LIFF channel can be created in the LINE Developers Console with separate credentials from production.
- Browser tests run in a headless or in-app browser environment (not requiring a physical device).
- The fake LIFF adapter can simulate all LIFF SDK behaviors including profile retrieval, token management, and window operations.
- Real-device testing uses a single physical phone (iPhone or Android) shared among the team for release smoke tests.
- The conversation state machine is already implemented and exposes a testable interface for posting events and reading state.
- Golden snapshots are stored in the repository and updated through an explicit `--update-snapshots` flag, not automatically.
- Each test can create and destroy its own isolated D1 database (or equivalent) within the test runtime budget (30 seconds total for all state-machine tests).

## Appendix A: Complete State Machine

### States (15 active + 3 legacy)

**Registration Flow (OB-01 to OB-11):**
1. `welcome` — Show welcome message on first follow
2. `consent` — PDPA 4-type consent acceptance
3. `phone` — Phone number input and validation
4. `identity_confirm` — Confirm identity match with farmer record
5. `conditions` — Project conditions acceptance
6. `registration` — LIFF registration form link
7. `documents` — Document upload (ID card, land title)
8. `pending_review` — Waiting for staff review
9. `activation` — Account activated, request sow date
10. `season_setup` — Set sow date and create season
11. `calendar` — Show 9-step season calendar

**Operational Flows:**
12. `chat` — Normal AI conversation
13. `confirm_draft` — Confirm/reject a draft entry
14. `photo_report` — PJ-00 to PJ-13: Photo reporting
15. `results` — RP-01 to RP-04: View results and dashboard

**Legacy States (backward-compat):**
16. `select_plot` — Farmer chooses which plot to work on
17. `identified` — Legacy identified state
18. `pending` — Legacy pending state

### State Transitions

```
welcome ─[start_registration]──> consent
consent ──[consent_accept_all]──> phone
consent ──[consent_reject]──────> consent (stay)
phone ─[valid phone, farmer found]──> identity_confirm
phone ──[invalid phone]──────────────> phone (stay)
phone ──[no farmer match]────────────> phone (stay)
identity_confirm ──[identity_confirm]──> conditions
identity_confirm ──[identity_reject]───> phone
conditions ──[conditions_accept]──> registration
registration ──[registration_complete]──> documents
documents ──[documents_complete]──> pending_review
pending_review ──[admin activates]──> activation
activation ──[sow date provided]──> season_setup
activation ──[skip]───────────────> calendar
season_setup ──[valid date]───────> calendar
calendar ──[ถ่ายรูป]──────────────> photo_report
calendar ──[ดูผล]─────────────────> results
calendar ──[field_list]───────────> select_plot
photo_report ──[ดูปฏิทิน]─────────> calendar
photo_report ──[ดูผล]─────────────> results
results ──[ดูปฏิทิน]──────────────> calendar
results ─[ถ่ายรูป]──────────────> photo_report
chat ──[ลงทะเบียน]───────────────> consent
chat ──[ถ่ายรูป]─────────────────> photo_report
chat ──[ดูผล]────────────────────> results
chat ─[AI draft created]────────> confirm_draft
confirm_draft ──[ยืนยัน]─────────> chat
confirm_draft ──[ยกเลิก]─────────> chat
select_plot ──[plot selected]────> chat
```

### Test Fixture Coverage

Each state transition above must have at least one fixture covering:
- Happy path (valid input, expected transition)
- Invalid input (stay in current state with error message)
- Edge case (duplicate, missing data, permission denied)

Total minimum fixtures: 18 states × 2-3 scenarios = 36-54 fixtures.
