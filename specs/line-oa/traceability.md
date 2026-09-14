# Traceability Matrix: LINE OA

| REQ-ID | Description | Spec Section | Implementation | Test | Status |
|--------|-------------|--------------|----------------|------|--------|
| LO-OB-01 | Welcome message | 1.1 | `src/line/flow.ts`, `src/line/flex-builders.ts:buildWelcomeBubble`, `src/line/welcome.ts` | Unit + e2e | ✅ |
| LO-OB-02 | PDPA consent before phone | 1.1 | `src/line/consent.ts`, `src/trust/consent-persist.ts` | Unit + e2e | ✅ |
| LO-OB-03 | Phone linking | 1.1 | `src/line/phone-match.ts`, `src/line/flow.ts` | Unit + e2e | ✅ |
| LO-OB-04 | Identity confirmation | 1.1 | `src/line/flex-builders.ts:buildIdentityConfirmBubble`, `src/line/flow.ts` | Unit + e2e | ✅ |
| LO-OB-05 | Three conditions acceptance | 1.1 | `src/line/flex-builders.ts:buildConditions3Checkbox`, `src/line/flow.ts` | Unit + e2e | ✅ |
| LO-OB-06 | Registration via LIFF | 1.1 | `src/liff/registration-api.ts`, `src/line/flow-registration.ts` | Unit + e2e | ✅ |
| LO-OB-07 | Document collection | 1.1 | `src/liff/documents-api.ts` | Unit + e2e | ✅ |
| LO-OB-08 | Pending review hold | 1.1 | `src/line/flow.ts`, `src/admin/applications.ts` | Unit + e2e | ✅ |
| LO-OB-09 | Activation confirmation | 1.1 | `src/line/flow.ts`, `src/season/approve.ts` | Unit + e2e | ✅ |
| LO-PJ-00 | Sowing date / season setup | 1.2 | `src/line/flow.ts`, `src/season/create.ts` | Unit + e2e | ✅ |
| LO-PJ-01 | Nine-step calendar | 1.2 | `src/line/flex-builders.ts:buildCalendarBubble`, `src/line/calendar-api.ts`, `src/season/calendar.ts` | Unit + e2e | ✅ |
| LO-PJ-02 | Calendar from sowing date | 1.2 | `src/season/calendar.ts` (120-day cycle, SG-01..SG-09) | Unit | ✅ |
| LO-PJ-03 | Calendar routing to photo/results | 1.2 | `src/line/flow-photo-reporting.ts`, `src/line/flow-results.ts` | Unit + e2e | ✅ |
| LO-PH-01 | Photo round reminder | 1.3 | `src/line/flow-photo-reporting.ts` | Unit | ✅ |
| LO-PH-02 | Evidence instructions | 1.3 | `src/line/flex-builders.ts`, `src/liff/camera.ts` | Unit | ✅ |
| LO-PH-03 | Water level measurement | 1.3 | `src/liff/camera-api.ts` (quick replies for 0/5/10/15/deeper) | Unit | ✅ |
| LO-PH-04 | Confirmation before submit | 1.3 | `src/liff/camera-api.ts` | Unit + e2e | ✅ |
| LO-PH-05 | Accepted evidence confirmation | 1.3 | `src/line/flow-photo-reporting.ts` | Unit | ✅ |
| LO-PH-06 | Crop evidence summary | 1.3 | `src/line/flow-results.ts` | Unit | ✅ |
| LO-PH-07 | Rejected evidence / retake | 1.3 | `src/line/retake-message.ts`, `src/vision/retake-message.ts` | Unit + e2e | ✅ |
| LO-PH-08 | Chat photo rejection (SY-03) | 1.3 | `src/line/flow.ts` (chat-uploaded photo rejection) | Unit | ✅ |
| LO-RP-01 | Outstanding work | 1.4 | `src/line/flow-results.ts` | Unit | ✅ |
| LO-RP-02 | Results dashboard | 1.4 | `src/liff/dashboard-api.ts`, `src/line/results-api.ts` | Unit + e2e | ✅ |
| LO-RP-03 | Navigation between results/calendar/plots/contact | 1.4 | `src/line/rich-menu.ts`, `src/liff/plot-selection.ts`, `src/liff/contact-page.ts` | Unit + e2e | ✅ |
| LO-MENU-01 | Rich menu: Backfill | 1.5 | `src/line/rich-menu.ts` | Unit | ✅ |
| LO-MENU-02 | Rich menu: Season home | 1.5 | `src/line/rich-menu.ts` | Unit | ✅ |
| LO-MENU-03 | Rich menu: Pending tasks | 1.5 | `src/line/rich-menu.ts` | Unit | ✅ |
| LO-MENU-04 | Rich menu: My plots → LIFF | 1.5 | `src/line/rich-menu.ts`, `src/liff/plot-selection.ts` | Unit | ✅ |
| LO-MENU-05 | Rich menu: Summary → LIFF | 1.5 | `src/line/rich-menu.ts`, `src/liff/dashboard-api.ts` | Unit | ✅ |
| LO-MENU-06 | Rich menu: Contact → LIFF | 1.5 | `src/line/rich-menu.ts`, `src/liff/contact-page.ts` | Unit | ✅ |
| LO-BR-01 | Four evidence photos per crop | 1.7 | `src/calc/sf-w.ts` (4-photo check) | Unit | ✅ |
| LO-BR-02 | SF_w = 0.55 with all four photos | 1.7 | `src/calc/sf-w.ts` | Unit | ✅ |
| LO-BR-03 | SF_w fallback to 0.71 | 1.7 | `src/calc/sf-w.ts` | Unit | ✅ |
| LO-BR-04 | Chat photos rejected as evidence | 1.7 | `src/line/flow.ts` | Unit | ✅ |
| LO-BR-05 | Nine-step calendar from sowing + 120 days | 1.7 | `src/season/calendar.ts` | Unit | ✅ |
| LO-BR-06 | Pending account cannot submit evidence | 1.7 | `src/line/flow.ts` (state guard) | Unit | ✅ |
| LO-BR-07 | Duplicate phone rejection | 1.7 | `src/line/phone-match.ts` | Unit | ✅ |
| LO-BR-08 | Consent before personal data | 1.7 | `src/line/consent.ts`, `src/trust/consent-persist.ts` | Unit | ✅ |
| LO-LIFF-01 | Registration form | 1.8 | `src/liff/registration-api.ts` | Unit + e2e | ✅ |
| LO-LIFF-02 | Document upload | 1.8 | `src/liff/documents-api.ts` | Unit + e2e | ✅ |
| LO-LIFF-03 | Camera capture | 1.8 | `src/liff/camera.ts`, `src/liff/camera-api.ts` | Unit + e2e | ✅ |
| LO-LIFF-04 | Calendar view | 1.8 | `src/liff/calendar-api.ts` | Unit | ✅ |
| LO-LIFF-05 | Summary/dashboard | 1.8 | `src/liff/dashboard-api.ts` | Unit | ✅ |
| LO-LIFF-06 | Plot list | 1.8 | `src/liff/plot-selection.ts` | Unit | ✅ |
| LO-LIFF-07 | Contact info | 1.8 | `src/liff/contact-page.ts` | Unit | ✅ |
