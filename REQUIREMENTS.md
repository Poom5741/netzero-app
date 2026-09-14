# NetZeroCarbon — Complete Product Requirements

**Visual reference baselines:** [`visual-qa-screenshots/DESIGN-REFERENCES.md`](visual-qa-screenshots/DESIGN-REFERENCES.md)

- LINE OA: [`design-line-oa-full.png`](visual-qa-screenshots/design-line-oa-full.png)
- Admin: [`design-admin-full.png`](visual-qa-screenshots/design-admin-full.png)
- Sponsor: [`design-sponsor-full.png`](visual-qa-screenshots/design-sponsor-full.png)

**Source:** Claude Design artifacts captured from the client-provided links

> For LINE OA, compare against the real LINE OA surface (webhook/Flex/Rich Menu/LIFF), not the web `/chat` demo.
**Captured:** 2026-09-14
**Purpose:** Single source of truth for requirements across LINE OA, Admin Console, and Sponsor Dashboard.

> This file records requirements, not implementation assumptions. Every change should map to one or more requirement IDs and include verification evidence.

---

# 1. LINE OA for Farmers

**Artifact:** `19c446b9-e2f5-4e09-a118-fca56ec0c0c8`
**Primary interface:** LINE Official Account + LIFF
**Audience:** Farmers and authorized coordinators

## 1.1 Registration and Account Linking

| ID | State / Node | Requirement | Acceptance criteria |
|---|---|---|---|
| LO-OB-01 | `welcome` | Welcome the farmer after adding NetZeroCarbon as a friend. | Shows project name, purpose, expected signup effort, and action to link an account. |
| LO-OB-02 | `consent` / OB-15 | Obtain personal-data consent before requesting a phone number. | Shows consent for PDPA, data collection, photo/location sharing, and carbon project participation. Records consent and version/time. |
| LO-OB-03 | `phone` / OB-02 | Link LINE identity to the registered farmer by phone number. | Supports LINE phone sharing and manual entry. Validates Thai phone format: 10 digits starting with `0`. |
| LO-OB-04 | `identity_confirm` / OB-03 | Confirm that the matched farmer record belongs to the user. | Shows farmer name, district, and province. Provides confirm and reject actions. Reject returns to phone entry. |
| LO-OB-05 | `conditions` / OB-05 | Obtain acceptance of the three project conditions. | Shows CS-02 confidentiality, CS-03 carbon-credit rights, and CS-04 photo/location requirements. User must accept all three to continue. |
| LO-OB-06 | `registration` / OB-12, LF-01 | Collect person and plot registration information through LIFF. | Opens the registration form. Covers R-01–R-06 person data and R-07–R-14 plot/deed data. Generates plot code automatically. |
| LO-OB-07 | `documents` / OB-13 | Collect required land-rights documents. | Supports DOC-01 land deed, DOC-03 ID copy, and DOC-06 power of attorney when applicable. |
| LO-OB-08 | `pending_review` / OB-10 | Hold the account while staff reviews the application. | Shows `pending_review` status, confirms receipt, explains 1–3 business-day review, and blocks activity-photo submission until activation. Historical backfill remains available. |
| LO-OB-09 | `activation` / OB-11 | Confirm activation after staff approval. | Shows farmer code, plot code/name, area, coordinator confirmation, and next action to provide sowing date. |

## 1.2 Season and Calendar

| ID | State / Node | Requirement | Acceptance criteria |
|---|---|---|---|
| LO-PJ-00 | `season_setup` / PJ-00 | Start a planting season from the sowing date. | Supports date selection and typed `DD/MM/YYYY`; accepts Buddhist or CE year; supports skip. |
| LO-PJ-01 | `calendar` / PJ-13 | Show the nine-step season calendar. | Shows SG-01 through SG-09, due day/date, status, and photo-required markers. Steps not yet due cannot be submitted. |
| LO-PJ-02 | `calendar` | Calculate the calendar from sowing date and crop duration. | Uses sowing date as day 0 and the configured 120-day crop cycle. |
| LO-PJ-03 | `calendar` | Route the farmer to photo reporting or results. | Calendar exposes actions to record the current step, open the camera, view results, and view the complete calendar. |

## 1.3 Photo Evidence

| ID | State / Node | Requirement | Acceptance criteria |
|---|---|---|---|
| LO-PH-01 | `photo_report` / PJ-02 | Remind the farmer when a photo round is due. | Shows plot, round, step code, deadline, days remaining, required evidence, and photo progress. |
| LO-PH-02 | PJ-03 | Explain how to take acceptable evidence. | Instructions explain the PVC tube, water level, camera distance/angle, GPS, and timestamp requirements. |
| LO-PH-03 | PJ-04 | Collect measured water level for dry rounds. | Provides quick replies for 0, 5, 10, 15 cm, deeper than 15 cm, and manual entry. |
| LO-PH-04 | PJ-06 | Provide a confirmation screen before submission. | Shows photo count, GPS/time presence, water-level reading, round, and crop progress. Supports retake or submit. |
| LO-PH-05 | PJ-07 | Confirm accepted evidence. | Shows accepted round, remaining evidence count, and next round. |
| LO-PH-06 | PJ-08 | Show crop evidence summary. | Shows WET-1, DRY-1, WET-2, and DRY-2 status and links to the farmer dashboard. |
| LO-PH-07 | PJ-09 | Explain rejected evidence and support retake. | Shows rejection reason, required correction, deadline, coordinator contact, and retake-camera action. |
| LO-PH-08 | SY-03 | Reject photos sent directly through ordinary chat as project evidence. | Explains that chat images may lose GPS/EXIF and routes the user to the LIFF camera. |

## 1.4 Results and Pending Work

| ID | State / Node | Requirement | Acceptance criteria |
|---|---|---|---|
| LO-RP-01 | `results` / RP-01 | Show outstanding work. | Shows retakes, missing photos in the current crop, and incomplete historical seasons. |
| LO-RP-02 | `results` / RP-03 | Show the farmer's results dashboard. | Shows plot/area, photo progress, historical-data progress, estimated carbon reduction, water savings, and current SF_w treatment. |
| LO-RP-03 | `results` | Support navigation between results, calendar, plot list, and contact. | Rich-menu and in-chat actions route to the correct destination without losing farmer/plot context. |

## 1.5 LINE Rich Menu

The rich menu contains six items in a 3-column × 2-row layout:

| ID | Label | Action |
|---|---|---|
| LO-MENU-01 | กรอกข้อมูลย้อนหลัง | `BL_HOME` |
| LO-MENU-02 | บันทึกงานในแปลง | `SEASON_HOME` |
| LO-MENU-03 | งานที่ต้องทำ | `TODO` |
| LO-MENU-04 | แปลงของฉัน | `FIELD_LIST` → LIFF |
| LO-MENU-05 | สรุปผลของฉัน | `SUMMARY` → LIFF |
| LO-MENU-06 | ติดต่อเจ้าหน้าที่ | `CONTACT` → LIFF/contact flow |

## 1.6 LINE Message Requirements

All rich cards must support:

- Hero tone: teal, navy, amber, or grey.
- Status badge such as `ยินดีต้อนรับ`, `pending_review`, `active`, `WET-1`, or `DRY-1`.
- Title and optional subtitle.
- Key/value rows with optional good/warning tone.
- Primary and secondary actions.
- LIFF deep-links where the action requires forms, documents, camera, calendar, summary, plots, or contact.
- Thai copy that is understandable to farmers and uses large, easy-to-tap controls.

## 1.7 LINE Business Rules

| ID | Rule |
|---|---|
| LO-BR-01 | A crop requires four evidence photos: WET-1, DRY-1, WET-2, and DRY-2. |
| LO-BR-02 | AWD treatment factor SF_w is 0.55 only when all four required photos are accepted. |
| LO-BR-03 | If required photos are incomplete, fall back to the conservative SF_w value 0.71. |
| LO-BR-04 | Chat-uploaded photos cannot be used as evidence; LIFF camera capture is required. |
| LO-BR-05 | The nine-step calendar is based on sowing date and the configured 120-day crop cycle. |
| LO-BR-06 | A pending account cannot submit activity evidence until staff activation. |
| LO-BR-07 | A phone number already linked to another LINE account must be rejected and escalated to staff. |
| LO-BR-08 | Consent must be recorded before collecting personal data or requesting the registered phone number. |

## 1.8 LIFF Destinations

| ID | Destination | Purpose |
|---|---|---|
| LO-LIFF-01 | LF-01 / registration | Person, plot, and deed registration form |
| LO-LIFF-02 | documents | Land-rights document upload |
| LO-LIFF-03 | LF-04 / camera | GPS/time-aware evidence capture |
| LO-LIFF-04 | calendar | Nine-step season calendar |
| LO-LIFF-05 | summary | Farmer dashboard and results |
| LO-LIFF-06 | fields | Farmer plot list and plot selection |
| LO-LIFF-07 | contact | Coordinator contact information |

---

# 2. Admin Console

**Artifact:** `161f2305-35de-42f8-83ed-7c90ab4da5a6`
**Audience:** NZC administrators, verifiers, field staff, and auditors

## 2.1 Authentication

| ID | Requirement | Acceptance criteria |
|---|---|---|
| AD-AUTH-01 | Provide a branded Admin Console login. | Split layout with deep gradient/imagery panel, NetZeroCarbon logo, Thai project title, project purpose, methodology reference, and login form. |
| AD-AUTH-02 | Authenticate privileged users. | Form includes email, password, OTP field, remember-device option, forgot-password action, and submit action. |
| AD-AUTH-03 | Record privileged access. | Explain and enforce audit logging for views and changes, including user, time, before value, and after value. |

## 2.2 Overview Dashboard

| ID | Requirement | Acceptance criteria |
|---|---|---|
| AD-OV-01 | Show project overview title and scope. | Identifies all supported areas and T-VER-P-METH-13-08 methodology. |
| AD-OV-02 | Show four primary metrics. | Metrics include participating households, active subplots, total area in rai/hectares, and net 2569 credits in tCO₂eq. |
| AD-OV-03 | Show today's work queue. | Queue includes pending applications, pending photo evidence, items requiring follow-up, and other actionable work. Each tile shows count, age/urgency, and action. |
| AD-OV-04 | Show credit summary visualizations. | Includes verified/estimate gauge, province or area breakdown, and credit-by-season chart. |
| AD-OV-05 | Support filtering. | Filter by province/area, season, and relevant project dimensions. |
| AD-OV-06 | Support operational actions. | Buttons exist for credit charts, report export, and opening the photo-review queue. |

## 2.3 Farmer Registry

| ID | Requirement | Acceptance criteria |
|---|---|---|
| AD-FAR-01 | List farmers with role-appropriate information. | Table includes CPA code, farmer name for authorized admin users, area, sponsor, subplot count, rai, photo progress, BE, PE, and ER. |
| AD-FAR-02 | Protect personal data. | Names and identity details are restricted to authorized admin contexts; exports and customer-facing views use CPA codes. |
| AD-FAR-03 | Filter and export farmer data. | Supports filters and export by CPA code. |
| AD-FAR-04 | Open farmer detail. | Selecting a row opens a detail panel with tabs for plots/documents, behaviors, and photo history. |
| AD-FAR-05 | Show plot and deed information. | Detail view identifies plot codes, area, rice variety, deed references, evidence status, and calculation inputs. |

## 2.4 Application Review

| ID | Requirement | Acceptance criteria |
|---|---|---|
| AD-APP-01 | List applications awaiting review. | Queue shows application ID, CPA code, farmer, location, subplot count, area, holding type, document count, age, and status. |
| AD-APP-02 | Support holding-specific document requirements. | Handles owner, co-owner, tenant, and authorized-representative cases. |
| AD-APP-03 | Show document checklist. | Clearly marks required, received, missing, and invalid documents. |
| AD-APP-04 | Support review actions. | Admin can request missing documents, approve when complete, or hold with a reason. |
| AD-APP-05 | Identify placeholders honestly. | Any sample data or unavailable OCR/automation is clearly marked as placeholder. |

## 2.5 Evidence Review

| ID | Requirement | Acceptance criteria |
|---|---|---|
| AD-REV-01 | Review submitted evidence images. | Shows crop, plot, round, GPS, timestamp, water level, and evidence status. |
| AD-REV-02 | Approve, reject, or request retake. | Rejection requires a reason that can be communicated back to the farmer. |
| AD-REV-03 | Preserve review history. | Records reviewer, timestamp, decision, reason, and prior status. |

## 2.6 Charts and Calculation

| ID | Requirement | Acceptance criteria |
|---|---|---|
| AD-CHART-01 | Show verified versus estimated credits. | Uses gauge or equivalent visualization and clearly distinguishes estimates from certified credits. |
| AD-CHART-02 | Show credit distribution. | Provides province/area and season breakdowns. |
| AD-CALC-01 | Calculate according to T-VER-P-METH-13-08. | Uses documented fixed parameters, behavior factors, baseline/project emissions, uncertainty deduction, and evidence-driven SF_w. |
| AD-CALC-02 | Make calculation inputs traceable. | Shows source/input values and calculation outputs without silently changing farmer fertilizer quantities. |

## 2.7 Roles and Permissions

The system defines five roles:

| Role | Description |
|---|---|
| `admin` | Central NZC administrators |
| `verifier` | Photo/document verification staff |
| `field` | Area coordinators and field staff |
| `sponsor` | Supporting-company accounts |
| `auditor` | External VVB/อบก. read-only users |

Required permission categories include:

1. View all-area dashboard.
2. View assigned areas only.
3. View names, phone numbers, identity numbers, and deed numbers.
4. Review and approve evidence photos.
5. Review and approve applications.
6. Enter data on behalf of farmers.
7. Reply as the bot.
8. Import data in batches.
9. Re-run credit calculation.
10. Edit fixed parameters and lookup tables.
11. Export farmer reports.
12. Export Premium T-VER submission packages.
13. View/export own reports.
14. View system audit log.
15. Configure other account permissions.

## 2.8 Admin Navigation

Required primary navigation:

- ภาพรวม
- ตรวจสอบใบสมัคร
- ตรวจสอบภาพ
- เกษตรกร
- ผู้สนับสนุน
- รายงาน
- ตั้งค่า

---

# 3. Sponsor Dashboard

**Artifact:** `0de23b7a-9fb3-433e-8930-7eff56a39e45`
**Audience:** Companies sponsoring supported areas

## 3.1 Authentication

| ID | Requirement | Acceptance criteria |
|---|---|---|
| SP-AUTH-01 | Provide Sponsor Portal login. | Branded split layout with Sponsor Portal eyebrow, NetZeroCarbon logo, supported-area title, scoped-access explanation, methodology reference, email, password, OTP, remember-device, and audit notice. |
| SP-AUTH-02 | Restrict sponsor scope. | Login and dashboard only expose areas configured for the sponsor account. |

## 3.2 Sponsor Overview

| ID | Requirement | Acceptance criteria |
|---|---|---|
| SP-OV-01 | Show supported-area title and scope. | Identifies supported province/area and methodology. |
| SP-OV-02 | Show PDPA/data boundary notice. | Explains that sponsor views use CPA codes and do not expose names, phone numbers, identity numbers, or deed numbers. |
| SP-OV-03 | Show certified credits prominently. | Deep-gradient card shows verified credits in tCO₂eq, certification period, and estimate caveat. |
| SP-OV-04 | Show supported area. | Shows rai, hectares, subplot count, and crop-cycle information. |
| SP-OV-05 | Show households benefited. | Shows count of supported households and explanatory methodology note. |
| SP-OV-06 | Show credits by season. | Chart distinguishes verified credits from estimates. |
| SP-OV-07 | Explain estimate uncertainty. | Notes that estimates can change when required evidence is incomplete and a conservative water-management factor is used. |
| SP-OV-08 | Show source of credit difference. | Table explains baseline/project difference, especially methane contribution, while noting fertilizer parity where applicable. |
| SP-OV-09 | Filter sponsor data. | Supports province/area and season filters within the sponsor's authorized scope. |
| SP-OV-10 | Export sponsor summary. | Provides a download-summary action containing only authorized CPA-coded data. |

## 3.3 Sponsor Privacy Rules

| ID | Rule |
|---|---|
| SP-BR-01 | Sponsor users see only their configured supported areas. |
| SP-BR-02 | Sponsor users cannot browse other sponsors' areas. |
| SP-BR-03 | Sponsor users cannot drill into personally identifiable farmer records. |
| SP-BR-04 | Customer-facing and exported records use CPA code and subplot code instead of names and identity data. |
| SP-BR-05 | Verified credits and estimates must be visibly distinguished. |

## 3.4 Sponsor Navigation

Required primary navigation:

- ภาพรวม
- พื้นที่
- รายงานและใบรับรอง

---

# 4. Shared Design and Quality Requirements

## 4.1 Visual Language

- NetZeroCarbon branding with green leaf mark.
- Green accent for primary/active actions.
- Deep navy for privileged/login surfaces and navigation.
- Light neutral page surfaces for content areas.
- Teal accent for project/positive states.
- Amber/warning state for due, incomplete, or rejected work.
- Clear status badges and consistent card/table spacing.
- Thai-language UI with readable typography and appropriately large touch targets.

## 4.2 Security and Privacy

- Consent before collecting personal data.
- Role-based access for admin, verifier, field, sponsor, and auditor users.
- CPA-code masking in customer-facing/export contexts.
- Audit log for privileged reads and writes.
- No silent exposure of names, phone numbers, identity numbers, or deed numbers to sponsors.
- Invalid LINE webhook signatures must be rejected.
- LINE reply tokens must be used only once per event.

## 4.3 Evidence and Verification

A feature is not complete until:

1. Every requirement ID maps to implementation files.
2. Every acceptance criterion maps to at least one test or observed verification step.
3. The actual runtime surface is tested, not only a local unit or mock.
4. UI changes receive visual QA against the approved design artifact.
5. Integration flows are tested across the real boundary: LINE webhook → state machine → LINE message, LIFF → API, Admin/Sponsor UI → API.
6. Known gaps are recorded explicitly rather than marked complete.

## 4.4 Out of Scope Unless Explicitly Approved

- Changing the T-VER methodology or calculation constants.
- Exposing sponsor access to personally identifiable farmer data.
- Treating ordinary chat photos as valid project evidence.
- Automatically changing requirements based only on the current implementation.
- Marking a feature complete solely because unit tests or compilation pass.
