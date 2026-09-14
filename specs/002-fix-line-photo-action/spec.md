# Feature Specification: Fix Native LINE WET-1 Photo Action

**Feature Branch**: `002-fix-line-photo-action`

**Created**: 2026-09-14

**Status**: Draft

**Input**: User description: "Fix native LINE WET-1 photo action so tapping the real LINE calendar button opens the LIFF camera flow and preserves the selected plot, season, and photo round."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Native LINE Calendar Photo Button Opens LIFF Camera (Priority: P1)

A farmer views their 9-step calendar in the real LINE chat. When they tap the "ถ่ายรูป" button on a pending photo step (e.g., WET-1), the LIFF camera page opens within LINE, preserving the current plot, season, and photo round context. The farmer can then take the photo and submit it.

**Why this priority**: This is the core photo collection flow. Without it, farmers cannot submit photo evidence for carbon credit verification. The dashboard and calendar render correctly, but the action button does not trigger the expected LIFF camera flow in the native LINE app.

**Independent Test**: Can be fully tested by tapping the WET-1 "ถ่ายรูป" button in the real LINE desktop or mobile app and verifying the LIFF camera page opens with the correct step parameter.

**Acceptance Scenarios**:

1. **Given** a farmer is viewing their 9-step calendar in the real LINE chat, **When** they tap the "ถ่ายรูป" button on a pending WET-1 step, **Then** the LIFF camera page opens within LINE with `?step=SG-04` parameter
2. **Given** the LIFF camera page opens, **When** the farmer takes a photo and submits, **Then** the photo is associated with the correct plot, season, and WET-1 round
3. **Given** the farmer completes the photo submission, **When** they return to the LINE chat, **Then** they see confirmation that the WET-1 photo was received

---

### User Story 2 - All Photo Rounds Work Consistently (Priority: P1)

The photo button works identically for all four photo rounds: WET-1 (SG-04), DRY-1 (SG-05), WET-2 (SG-07), and DRY-2 (SG-08). Each button opens the LIFF camera with the correct step parameter.

**Why this priority**: Farmers must complete all 4 rounds to receive full SF_w = 0.55 benefit. If only WET-1 works, the system cannot calculate accurate carbon credits.

**Independent Test**: Can be fully tested by tapping each of the 4 photo round buttons in sequence and verifying each opens LIFF camera with the correct step parameter.

**Acceptance Scenarios**:

1. **Given** a farmer is viewing their calendar, **When** they tap "ถ่ายรูป" on DRY-1 (SG-05), **Then** LIFF camera opens with `?step=SG-05`
2. **Given** a farmer is viewing their calendar, **When** they tap "ถ่ายรูป" on WET-2 (SG-07), **Then** LIFF camera opens with `?step=SG-07`
3. **Given** a farmer is viewing their calendar, **When** they tap "ถ่ายรูป" on DRY-2 (SG-08), **Then** LIFF camera opens with `?step=SG-08`

---

### User Story 3 - Error Handling for Missing LIFF ID (Priority: P2)

If the LIFF ID is not configured or invalid, the system provides a clear error message instead of silently failing or opening a broken page.

**Why this priority**: Prevents farmer confusion and support tickets when LIFF configuration is missing.

**Independent Test**: Can be tested by temporarily removing the LIFF_ID environment variable and verifying the button shows an error message.

**Acceptance Scenarios**:

1. **Given** the LIFF_ID environment variable is missing, **When** a farmer taps "ถ่ายรูป", **Then** they see a message: "กล้องถ่ายรูปยังไม่พร้อมใช้งาน กรุณาติดต่อเจ้าหน้าที่"
2. **Given** the LIFF_ID is invalid, **When** a farmer taps "ถ่ายรูป", **Then** they see the same error message

---

### Edge Cases

- What happens when the farmer taps the button but has no active season? System should show "ยังไม่มีฤดูปลูกปัจจุบัน" message.
- What happens when the farmer taps the button but has no selected plot? System should prompt to select a plot first.
- How does the system handle rapid repeated taps on the button? Should debounce or ignore duplicate clicks within 2 seconds.
- What happens when LIFF camera page fails to load due to network issues? LIFF should show offline error; chat bot cannot detect this.
- How does the system handle the case where the farmer closes LIFF without taking a photo? No state change; button remains available.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render "ถ่ายรูป" buttons on pending photo-requiring calendar steps (SG-04, SG-05, SG-07, SG-08) in the real LINE chat
- **FR-002**: System MUST use `type: "uri"` action with LIFF camera URL for photo buttons, not `type: "postback"`
- **FR-003**: System MUST construct LIFF camera URL as `https://liff.line.me/{LIFF_ID}/camera?step={stepCode}` where LIFF_ID comes from environment variable
- **FR-004**: System MUST preserve the current plot_id and season_id in the LIFF camera URL query parameters
- **FR-005**: System MUST handle missing LIFF_ID gracefully by showing an error message in Thai
- **FR-006**: System MUST send exactly one reply per webhook event (LINE replyToken constraint)
- **FR-007**: System MUST log LIFF URL generation for debugging (without exposing LIFF_ID in logs)
- **FR-008**: Users MUST be able to tap the photo button in both LINE desktop and LINE mobile apps
- **FR-009**: System MUST debounce rapid button taps (ignore duplicates within 2 seconds)

### Key Entities *(include if feature involves data)*

- **LIFF Camera URL**: `https://liff.line.me/{LIFF_ID}/camera?step={stepCode}&plot_id={plotId}&season_id={seasonId}`
- **Calendar Step**: Requires `stepCode`, `stepName`, `dueDay`, `status`, `requiresPhoto` fields
- **Flex Message Action**: Must use `type: "uri"` with `label` and `uri` properties

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of farmers can open LIFF camera by tapping "ถ่ายรูป" button in real LINE app (desktop and mobile)
- **SC-002**: LIFF camera page loads within 3 seconds after button tap
- **SC-003**: Photo submission correctly associates with plot, season, and round in 100% of cases
- **SC-004**: Error message displays within 1 second when LIFF_ID is missing
- **SC-005**: Zero duplicate webhook events from rapid button taps (debounce effective)

## Assumptions

- LIFF app is already created and approved by LINE for camera access
- LIFF camera page (`/camera` route) exists in the LIFF app and handles `step`, `plot_id`, `season_id` query parameters
- Farmer has granted camera permissions to LINE app
- Farmer has stable mobile internet connectivity for LIFF page load
- LIFF_ID environment variable is set in Cloudflare Workers deployment
- The existing Flex message builder (`buildCalendarBubble`) is the source of the calendar UI
- The issue is in the button action type or URL construction, not in the LIFF app itself
