# LINE OA Specification
**Source:** Claude Design Artifact `19c446b9-e2f5-4e09-a118-fca56ec0c0c8`
**Extracted:** 2026-09-14

## States & Nodes

### Registration Flow (OB-01 to OB-11)

| Node | State | Description | Acceptance Criteria |
|------|-------|-------------|---------------------|
| OB-01 | `welcome` | Welcome message on first follow | - Shows NetZeroCarbon branding<br>- Has "ผูกบัญชีของฉัน" button<br>- Transitions to OB-15 on button click |
| OB-15 | `consent` | PDPA 4-type consent | - Shows 4 consent types (PDPA, data collection, photo sharing, carbon project)<br>- Each consent is individually checkable<br>- "ยอมรับ" button enabled only when all 4 checked |
| OB-02 | `phone` | Phone number input | - Quick replies: "แชร์เบอร์จาก LINE", "พิมพ์เบอร์เอง"<br>- Validates 10-digit Thai phone format<br>- Looks up farmer in DB by phone |
| OB-03 | `identity_confirm` | Confirm identity match | - Shows farmer name, district, province<br>- "ใช่ ผมเอง" / "ไม่ใช่" buttons<br>- Transitions to OB-05 on confirm |
| OB-05 | `conditions` | Project conditions (3 items) | - Shows CS-02, CS-03, CS-04<br>- Each condition individually checkable<br>- "ยอมรับทั้ง 3 ข้อ" button |
| OB-12 | `registration` | LIFF registration form link | - Opens LIFF app for form<br>- Form fields: R-01 to R-14<br>- System generates plot code automatically |
| OB-13 | `documents` | Document upload | - Required docs: DOC-01 (โฉนด), DOC-03 (บัตร ปชช.), DOC-06 (มอบอำนาจ)<br>- Upload via LIFF camera |
| OB-10 | `pending_review` | Waiting for staff review | - Shows "รับใบสมัครแล้ว ✅"<br>- Status: pending_review<br>- Can backfill historical data while waiting |
| OB-11 | `activation` | Account activated | - Shows farmer code (e.g., SPB-0142)<br>- Shows plot info<br>- "เริ่มใช้งาน" button |

### Season Flow (PJ-00 to PJ-13)

| Node | State | Description | Acceptance Criteria |
|------|-------|-------------|---------------------|
| PJ-00 | `season_setup` | Set sow date | - Quick replies: "หว่านแล้ว เลือกวันที่", "ยังไม่ได้หว่าน", "ปีนี้ไม่ได้ปลูกแปลงนี้"<br>- Parses DD/MM/YYYY format<br>- Creates season with 9-step calendar |
| PJ-13 | `calendar` | 9-step calendar display | - Shows SG-01 to SG-09<br>- Each step has status (pending/completed/overdue)<br>- Photo steps marked with 📷<br>- "ดูทั้งปฏิทิน" and "บันทึกขั้นนี้" buttons |

### Photo Reporting Flow (PJ-02 to PJ-09)

| Node | State | Description | Acceptance Criteria |
|------|-------|-------------|---------------------|
| PJ-02 | `photo_report` | Photo reminder | - Shows round info (WET-1, DRY-1, etc.)<br>- Shows deadline and days left<br>- "ถ่ายภาพส่งเลย" button opens LIFF camera |
| PJ-03 | `photo_report` | Photo instructions | - Text instructions for photo angle<br>- Mentions GPS auto-capture |
| PJ-04 | `photo_report` | Water level input | - Quick replies: 0cm, 5cm, 10cm, 15cm, deeper, custom<br>- Validates numeric input |
| PJ-06 | `photo_report` | Pre-submit review | - Shows photo count<br>- Shows water level reading<br>- "ส่งข้อมูล" button |
| PJ-07 | `photo_report` | Photo accepted | - Shows "รับภาพแล้ว ✅"<br>- Shows remaining photos count<br>- Next round info |
| PJ-08 | `photo_report` | Crop summary | - Shows 4-round status (✅/○)<br>- "ดูสรุปแปลง" button |
| PJ-09 | `photo_report` | Photo rejected | - Shows rejection reason<br>- "ถ่ายใหม่" button<br>- Deadline for retake |

### Results Flow (RP-01 to RP-04)

| Node | State | Description | Acceptance Criteria |
|------|-------|-------------|---------------------|
| RP-01 | `results` | Todo list | - Shows pending photos count<br>- Shows retake photos count<br>- Shows backfill seasons count |
| RP-03 | `results` | Dashboard summary | - Shows carbon offset (tCO₂eq)<br>- Shows SF_w value<br>- Shows photo progress (X/4)<br>- Shows water savings % |

## Rich Menu

| # | Label | Action | Postback Data |
|---|-------|--------|---------------|
| 1 |  กรอกข้อมูลย้อนหลัง | BL_HOME | `action=BL_HOME` |
| 2 |  บันทึกงานในแปลง | SEASON_HOME | `action=SEASON_HOME` |
| 3 | 🔔 งานที่ต้องทำ | TODO | `action=TODO` |
| 4 | 🌾 แปลงของฉัน | FIELD_LIST | `action=FIELD_LIST` |
| 5 | 📊 สรุปผลของฉัน | SUMMARY | `action=SUMMARY` |
| 6 | ☎️ ติดต่อเจ้าหน้าที่ | CONTACT | `action=CONTACT` |

## Business Rules

| Rule ID | Description | Implementation Check |
|---------|-------------|---------------------|
| BR-01 | SF_w = 0.55 only when 4 photos complete | Check `flow.ts` for SF_w calculation |
| BR-02 | SF_w fallback to 0.71 if photos incomplete | Check fallback logic in calculation |
| BR-03 | Photos from chat rejected (SY-03) | Check `flow.ts` for SY-03 handling |
| BR-04 | 4 photos per crop: WET-1, DRY-1, WET-2, DRY-2 | Check photo round definitions |
| BR-05 | 9-step calendar based on sowing date + 120 days | Check calendar step calculation |
| BR-06 | LIFF camera required (not chat photos) | Check camera URL uses LIFF deep-link |

## Flex Message Structure

All flex messages must have:
- `heroTone`: teal | navy | amber | grey
- `heroBadge`: status badge text
- `title`: main heading
- `subtitle`: optional subheading
- `rows`: array of [label, value, tone?] tuples
- `actions`: array of { label, primary?, liff? }

## LIFF Pages

| Page | Action | URL Pattern |
|------|--------|-------------|
| LF-01 | Register | `https://liff.line.me/{LIFF_ID}` |
| LF-04 | Camera | `https://liff.line.me/{LIFF_ID}/camera` |
| Calendar | View calendar | `https://liff.line.me/{LIFF_ID}/calendar` |
| Docs | Upload documents | `https://liff.line.me/{LIFF_ID}/docs` |
| Summary | Dashboard | `https://liff.line.me/{LIFF_ID}/summary` |
| Fields | Plot list | `https://liff.line.me/{LIFF_ID}/fields` |
| Contact | Contact info | `https://liff.line.me/{LIFF_ID}/contact` |
