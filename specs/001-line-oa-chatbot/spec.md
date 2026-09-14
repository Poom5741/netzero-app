# Feature Specification: LINE OA Chatbot for Farmer Registration & Photo Reporting

**Feature Branch**: `001-line-oa-chatbot`

**Created**: 2026-09-14

**Status**: Draft

**Input**: User description: "LINE OA chatbot for farmer registration and photo reporting"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Farmer Registration Flow (Priority: P1)

A farmer receives an invitation to join the NetZeroCarbon program via LINE. When they follow the official account, they are greeted with a welcome message and guided through a step-by-step registration process: PDPA consent, phone number verification, identity confirmation, project conditions acceptance, LIFF registration form, document upload, and finally account activation with their farmer code.

**Why this priority**: This is the entry point for all farmers. Without registration, no other features are accessible. This flow must work flawlessly because it's the first impression and determines whether farmers continue using the system.

**Independent Test**: Can be fully tested by following a new phone number through the entire registration flow from welcome message to account activation. Delivers a registered farmer with a valid farmer code (e.g., SPB-0142) who can access the system.

**Acceptance Scenarios**:

1. **Given** a new user follows the LINE OA for the first time, **When** they receive the welcome message, **Then** they see NetZeroCarbon branding and a "ผูกบัญชีของฉัน" (Link My Account) button
2. **Given** the user clicks the welcome button, **When** the consent screen appears, **Then** they see 4 consent types (PDPA, data collection, photo sharing, carbon project) and must check all 4 before the "ยอมรับ" (Accept) button becomes enabled
3. **Given** the user accepts consent, **When** prompted for phone number, **Then** they see quick replies "แชร์เบอร์จาก LINE" (Share from LINE) and "พิมพ์เบอร์เอง" (Type manually), and the system validates 10-digit Thai phone format
4. **Given** the phone number matches an existing farmer record, **When** identity confirmation appears, **Then** they see their name, district, and province with "ใช่ ผมเอง" (Yes, it's me) and "ไม่ใช่" (No) buttons
5. **Given** the user confirms identity, **When** conditions screen appears, **Then** they see 3 project conditions (CS-02, CS-03, CS-04) and must accept all 3
6. **Given** the user accepts conditions, **When** registration link is sent, **Then** they click to open LIFF app and fill form fields R-01 to R-14, with the system automatically generating a plot code
7. **Given** the user completes the form, **When** document upload is requested, **Then** they upload required documents (โฉนด/title deed, บัตร ปชช./ID card, มอบอำนาจ/power of attorney) via LIFF camera
8. **Given** documents are uploaded, **When** the application is pending review, **Then** they see "รับใบสมัครแล้ว ✅" (Application received) and can backfill historical data while waiting
9. **Given** staff approves the application, **When** the account is activated, **Then** the farmer receives their farmer code (e.g., SPB-0142), plot info, and a "เริ่มใช้งาน" (Start Using) button

---

### User Story 2 - Season Setup & Calendar (Priority: P1)

A registered farmer sets up a new growing season by entering the sowing date. The system automatically generates a 9-step calendar spanning 120 days from sowing, with each step showing its status (pending/completed/overdue) and marking photo capture steps with a camera icon. The farmer can view the full calendar or mark individual steps as complete.

**Why this priority**: Season setup is required before photo reporting can begin. The calendar provides structure and guidance for the entire growing cycle, ensuring farmers know when to take photos and what to do next.

**Independent Test**: Can be fully tested by creating a new season with a sowing date, verifying the 9-step calendar is generated correctly, and marking steps as complete. Delivers a structured growing season with clear milestones.

**Acceptance Scenarios**:

1. **Given** a registered farmer starts season setup, **When** prompted for sowing date, **Then** they see quick replies "หว่านแล้ว เลือกวันที่" (Already sown, choose date), "ยังไม่ได้หว่าน" (Not yet sown), "ปีนี้ไม่ได้ปลูกแปลงนี้" (Not planting this plot this year)
2. **Given** the farmer enters a sowing date in DD/MM/YYYY format, **When** the system processes it, **Then** a season is created with a 9-step calendar (SG-01 to SG-09) spanning 120 days from the sowing date
3. **Given** the calendar is generated, **When** the farmer views it, **Then** each step shows its status (pending/completed/overdue) and photo capture steps are marked with a camera icon (📷)
4. **Given** the farmer is viewing the calendar, **When** they tap a step, **Then** they can either "ดูทั้งปฏิทิน" (View full calendar) or "บันทึกขั้นนี้" (Mark this step complete)

---

### User Story 3 - Photo Reporting Flow (Priority: P1)

A farmer receives reminders to take photos at specific growth stages (WET-1, DRY-1, WET-2, DRY-2). For each photo round, they receive instructions on the photo angle, input water level, review their submission, and receive confirmation. If a photo is rejected, they get feedback and can retake it within a deadline. After completing all 4 rounds, they see a crop summary.

**Why this priority**: Photo reporting is the core data collection mechanism for carbon credit verification. Without these photos, the system cannot calculate water management benefits or generate carbon offset reports. This is the primary value proposition for sponsors and the carbon market.

**Independent Test**: Can be fully tested by completing all 4 photo rounds (WET-1, DRY-1, WET-2, DRY-2) for a single plot/season, including handling a rejection and retake. Delivers verified photo evidence for carbon credit calculation.

**Acceptance Scenarios**:

1. **Given** a photo round is due, **When** the farmer receives a reminder, **Then** they see round info (e.g., WET-1), deadline, days remaining, and a "ถ่ายภาพส่งเลย" (Take photo now) button that opens LIFF camera
2. **Given** the farmer opens the camera, **When** photo instructions appear, **Then** they see text instructions for the photo angle and a note that GPS will be auto-captured
3. **Given** the farmer takes the photo, **When** prompted for water level, **Then** they see quick replies: 0cm, 5cm, 10cm, 15cm, deeper, custom, and can input a numeric value
4. **Given** the farmer inputs water level, **When** pre-submit review appears, **Then** they see photo count and water level reading with a "ส่งข้อมูล" (Submit) button
5. **Given** the farmer submits, **When** the photo is accepted, **Then** they see "รับภาพแล้ว ✅" (Photo received), remaining photos count, and next round info
6. **Given** all 4 photos are complete, **When** crop summary appears, **Then** they see 4-round status (✅/○) and a "ดูสรุปแปลง" (View plot summary) button
7. **Given** a photo is rejected, **When** rejection message appears, **Then** they see the rejection reason, a "ถ่ายใหม่" (Retake) button, and the deadline for retake

---

### User Story 4 - Results Dashboard (Priority: P2)

A farmer views their carbon offset results, including total tCO₂eq, water management scaling factor (SF_w), photo progress (X/4 rounds), and water savings percentage. They also see a todo list with pending photos, retakes needed, and historical seasons to backfill.

**Why this priority**: The dashboard provides farmers with visibility into their environmental impact and next steps. While not required for data collection, it motivates continued participation and transparency.

**Independent Test**: Can be fully tested by viewing the dashboard after completing some photo rounds. Delivers a clear summary of carbon impact and actionable next steps.

**Acceptance Scenarios**:

1. **Given** a farmer has completed some photo rounds, **When** they view the todo list, **Then** they see pending photos count, retake photos count, and backfill seasons count
2. **Given** the farmer views the dashboard summary, **When** results are displayed, **Then** they see carbon offset (tCO₂eq), SF_w value, photo progress (X/4), and water savings percentage

---

### User Story 5 - Rich Menu Navigation (Priority: P2)

A farmer uses the LINE rich menu to quickly access key features: backfill historical data, record current season work, view todos, list their plots, view summary, and contact staff. Each menu item triggers the appropriate action via postback.

**Why this priority**: The rich menu provides persistent, one-tap access to core features without requiring the farmer to remember commands or navigate through chat. It improves usability and reduces friction.

**Independent Test**: Can be fully tested by tapping each of the 6 rich menu items and verifying the correct action is triggered. Delivers quick access to all major features.

**Acceptance Scenarios**:

1. **Given** the farmer is in the LINE chat, **When** they view the rich menu, **Then** they see 6 items: กรอกข้อมูลย้อนหลัง (Backfill), บันทึกงานในแปลง (Record work), 🔔 งานที่ต้องทำ (Todos), 🌾 แปลงของฉัน (My plots), 📊 สรุปผลของฉัน (My summary), ☎️ ติดต่อเจ้าหน้าที่ (Contact staff)
2. **Given** the farmer taps a rich menu item, **When** the postback is sent, **Then** the system triggers the appropriate action (BL_HOME, SEASON_HOME, TODO, FIELD_LIST, SUMMARY, CONTACT)

---

### Edge Cases

- What happens when a farmer's phone number doesn't match any existing record? System should create a new farmer record or show an error with instructions to contact staff.
- How does the system handle a farmer who tries to register with a phone number already associated with another account? System should reject and show "Phone number already registered" with contact info.
- What happens when a photo upload fails due to network issues? System should allow retry without losing the session state.
- How does the system handle a farmer who misses a photo deadline? System should mark the round as overdue but allow late submission with a flag.
- What happens when a farmer tries to submit a photo taken from chat (not LIFF camera)? System should reject with message "Please use the camera button to ensure GPS is captured."
- How does the system handle concurrent season setup by the same farmer? System should prevent duplicate seasons for the same plot/year combination.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a welcome message with NetZeroCarbon branding when a new user follows the LINE OA
- **FR-002**: System MUST collect 4 types of consent (PDPA, data collection, photo sharing, carbon project) with individual checkboxes before proceeding
- **FR-003**: System MUST validate phone numbers as 10-digit Thai format and look up farmer records by phone
- **FR-004**: System MUST display identity confirmation with farmer name, district, and province for verification
- **FR-005**: System MUST collect acceptance of 3 project conditions (CS-02, CS-03, CS-04) before registration
- **FR-006**: System MUST provide a LIFF registration form with fields R-01 to R-14 and auto-generate plot codes
- **FR-007**: System MUST collect required documents (title deed, ID card, power of attorney) via LIFF camera upload
- **FR-008**: System MUST support a pending review state where farmers can backfill historical data
- **FR-009**: System MUST activate accounts with a farmer code (e.g., SPB-0142) after staff approval
- **FR-010**: System MUST parse sowing dates in DD/MM/YYYY format and create seasons with 9-step calendars spanning 120 days
- **FR-011**: System MUST display calendar steps (SG-01 to SG-09) with status (pending/completed/overdue) and photo markers
- **FR-012**: System MUST send photo reminders with round info (WET-1, DRY-1, WET-2, DRY-2), deadlines, and LIFF camera deep-links
- **FR-013**: System MUST collect water level input with quick replies (0cm, 5cm, 10cm, 15cm, deeper, custom)
- **FR-014**: System MUST enforce 4 photo rounds per crop (WET-1, DRY-1, WET-2, DRY-2) and track completion
- **FR-015**: System MUST reject photos submitted via chat (not LIFF camera) to ensure GPS capture
- **FR-016**: System MUST calculate SF_w = 0.55 when all 4 photos are approved, fallback to 0.71 for 1-3 photos, and 1.0 for 0 photos
- **FR-017**: System MUST display photo rejection messages with reason and retake deadline
- **FR-018**: System MUST provide a rich menu with 6 items: backfill, record work, todos, my plots, my summary, contact staff
- **FR-019**: System MUST display carbon offset (tCO₂eq), SF_w value, photo progress, and water savings percentage in the dashboard
- **FR-020**: System MUST display todo list with pending photos, retakes needed, and backfill seasons count

### Key Entities *(include if feature involves data)*

- **Farmer**: Represents a registered farmer with phone number (identity), name, address, farmer code, trust score, and consent status
- **Plot**: Represents a farm plot with plot code, location (province, district), area, and relationship to farmer
- **Season**: Represents a growing season with sowing date, plot relationship, 9-step calendar, and photo completion status
- **Photo Evidence**: Represents uploaded photos with round type (WET-1, DRY-1, WET-2, DRY-2), GPS coordinates, water level, AI verification status, and admin review status
- **Calendar Step**: Represents a milestone in the 9-step growing calendar (SG-01 to SG-09) with due date, completion status, and photo requirement flag

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Farmers can complete the full registration flow (welcome to activation) in under 10 minutes
- **SC-002**: 95% of farmers successfully complete all 4 photo rounds within the 120-day season
- **SC-003**: System correctly calculates SF_w values (0.55 for 4 photos, 0.71 for 1-3 photos, 1.0 for 0 photos) for 100% of seasons
- **SC-004**: Photo rejection and retake flow completes within 24 hours of initial submission
- **SC-005**: 90% of farmers can navigate to any feature using the rich menu without assistance
- **SC-006**: Dashboard accurately displays carbon offset, SF_w, photo progress, and water savings for all active seasons
- **SC-007**: System handles 500 concurrent farmers without degradation in message delivery time (< 3 seconds)

## Assumptions

- Farmers have LINE installed on their smartphones and are familiar with basic LINE usage (chat, camera, buttons)
- Farmers have stable mobile internet connectivity for photo uploads (minimum 3G)
- Farmers' smartphones have GPS enabled for automatic location capture
- Existing farmer records in the database can be matched by phone number for identity verification
- Staff review process for applications takes no more than 48 hours
- LIFF app is pre-configured and approved by LINE for camera access and deep-linking
- Photo storage and AI verification infrastructure (R2, OpenRouter) is operational and can handle peak load during photo submission periods
- Carbon offset calculation methodology is finalized and does not change mid-season
- Farmers speak and read Thai; all messages and UI are in Thai language
- Power of attorney documents are only required for farmers who are not the land owners
