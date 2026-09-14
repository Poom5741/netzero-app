# Quickstart Validation Guide: LINE OA Chatbot

**Feature**: 001-line-oa-chatbot
**Date**: 2026-09-14
**Status**: Feature already implemented and deployed

## Prerequisites

- Node.js 18+ and npm
- Cloudflare Wrangler CLI (`npm install -g wrangler`)
- LINE Developer account with Messaging API channel
- bun (for testing)

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Initialize local D1 database**:
   ```bash
   npm run db:init
   ```

3. **Seed test data** (optional):
   ```bash
   npm run seed
   ```

4. **Start development servers**:
   ```bash
   npm run dev:all
   ```
   - Backend: http://localhost:8787
   - Frontend: http://localhost:3000

## Validation Scenarios

### Scenario 1: Farmer Registration Flow

**Goal**: Verify complete registration from welcome to activation.

**Steps**:
1. Follow the LINE OA (or simulate with `POST /webhook/line` follow event)
2. Verify welcome message appears with "ผูกบัญชีของฉัน" button
3. Click button → consent screen appears with 4 checkboxes
4. Check all 4 → "ยอมรับ" button enabled
5. Accept → phone input screen
6. Enter phone: `0812345678` (must match seeded farmer)
7. Identity confirm screen appears with name/district/province
8. Confirm → conditions screen (3 items)
9. Accept all 3 → registration link
10. Click link → LIFF form opens
11. Fill form → submit
12. Document upload screen → upload via LIFF camera
13. "รับใบสมัครแล้ว ✅" appears (pending_review)
14. Staff approves → activation message with farmer code (e.g., SPB-0142)

**Expected Outcome**: Farmer registered with farmer code, can access season setup.

**Validation Command**:
```bash
curl -X POST http://localhost:8787/webhook/line \
  -H "Content-Type: application/json" \
  -H "X-Line-Signature: <signature>" \
  -d '{"events":[{"type":"follow","replyToken":"TOKEN","source":{"userId":"USER_ID"}}]}'
```

---

### Scenario 2: Season Setup & Calendar

**Goal**: Verify season creation and 9-step calendar generation.

**Prerequisites**: Registered farmer with at least one plot.

**Steps**:
1. Send message: "เริ่มฤดูปลูกใหม่" (Start new season)
2. Season setup screen appears with quick replies
3. Select "หว่านแล้ว เลือกวันที่" (Already sown, choose date)
4. Enter sowing date: `01/06/2568` (DD/MM/YYYY format)
5. Calendar screen appears with 9 steps (SG-01 to SG-09)
6. Verify photo steps marked with 📷 (SG-03, SG-05, SG-07, SG-09)
7. Tap a step → "ดูทั้งปฏิทิน" or "บันทึกขั้นนี้" options

**Expected Outcome**: Calendar generated with correct due dates (sow_date + 120 days / 9 steps).

**Validation Command**:
```bash
curl -X POST http://localhost:8787/api/season/create \
  -H "Authorization: Bearer <session_token>" \
  -H "Content-Type: application/json" \
  -d '{"plot_id":"plot-001","sow_date":"2026-06-01","rice_variety":"ปทุมธานี 1"}'
```

---

### Scenario 3: Photo Reporting Flow

**Goal**: Verify 4-round photo submission and SF_w calculation.

**Prerequisites**: Active season with calendar generated.

**Steps**:
1. Receive photo reminder (WET-1 round)
2. Click "ถ่ายภาพส่งเลย" → LIFF camera opens
3. Take photo (GPS auto-captured)
4. Photo instructions appear with angle guidance
5. Enter water level: `10cm` (quick reply)
6. Pre-submit review → click "ส่งข้อมูล"
7. "รับภาพแล้ว ✅" appears with remaining count
8. Repeat for DRY-1, WET-2, DRY-2
9. After 4th photo → crop summary appears
10. View dashboard → verify SF_w = 0.55 (all 4 photos complete)

**Expected Outcome**: 4 photos uploaded, SF_w = 0.55, carbon offset calculated.

**Validation Command**:
```bash
curl -X POST http://localhost:8787/api/photo/upload \
  -H "Authorization: Bearer <session_token>" \
  -F "photo=@test.jpg" \
  -F "plot_id=plot-001" \
  -F "season_id=2568-napi" \
  -F "gps_lat=14.4736" \
  -F "gps_lng=100.1984" \
  -F "round=WET-1"
```

---

### Scenario 4: Photo Rejection & Retake

**Goal**: Verify rejection flow and retake within deadline.

**Prerequisites**: Photo submitted and rejected by admin.

**Steps**:
1. Admin rejects photo via `/api/admin/photo/:id/review`
2. Farmer receives rejection message with reason
3. Click "ถ่ายใหม่" → LIFF camera opens
4. Retake photo → submit
5. Verify new photo replaces rejected one
6. Dashboard updates with new photo status

**Expected Outcome**: Rejected photo replaced, SF_w recalculated if needed.

**Validation Command**:
```bash
curl -X POST http://localhost:8787/api/admin/photo/photo-001/review \
  -H "Authorization: Bearer <staff_token>" \
  -H "Content-Type: application/json" \
  -d '{"status":"rejected","reason":"ภาพไม่ชัดเจน"}'
```

---

### Scenario 5: Rich Menu Navigation

**Goal**: Verify all 6 rich menu items trigger correct actions.

**Steps**:
1. View rich menu in LINE chat
2. Tap "กรอกข้อมูลย้อนหลัง" → backfill screen appears
3. Tap "บันทึกงานในแปลง" → season work screen appears
4. Tap "🔔 งานที่ต้องทำ" → todo list appears
5. Tap "🌾 แปลงของฉัน" → plot list appears
6. Tap "📊 สรุปผลของฉัน" → dashboard appears
7. Tap "☎️ ติดต่อเจ้าหน้าที่" → contact info appears

**Expected Outcome**: All 6 actions trigger correct screens.

**Validation Command**:
```bash
curl -X POST http://localhost:8787/webhook/line \
  -H "Content-Type: application/json" \
  -H "X-Line-Signature: <signature>" \
  -d '{"events":[{"type":"postback","replyToken":"TOKEN","source":{"userId":"USER_ID"},"postback":{"data":"action=TODO"}}]}'
```

---

### Scenario 6: Dashboard Accuracy

**Goal**: Verify carbon offset, SF_w, photo progress, and water savings.

**Prerequisites**: Season with 4 photos uploaded and verified.

**Steps**:
1. View dashboard via rich menu or "ดูสรุปแปลง"
2. Verify carbon offset (tCO₂eq) displayed
3. Verify SF_w value (0.55 for 4 photos, 0.71 for 1-3, 1.0 for 0)
4. Verify photo progress (X/4)
5. Verify water savings percentage

**Expected Outcome**: All metrics accurate and consistent with photo evidence.

**Validation Command**:
```bash
curl http://localhost:8787/api/carbon/plot-001/2568-napi \
  -H "Authorization: Bearer <session_token>"
```

---

## Testing Commands

### Unit Tests
```bash
npm run check:test
```

### Integration Tests
```bash
npm run check:integration
```

### E2E Tests (Playwright)
```bash
npm run test:e2e
```

### Spec Compliance Check
```bash
./scripts/check-spec-compliance.sh
```

### Speckit Convergence
```bash
/speckit-converge
```

---

## Production URLs

- **Backend**: https://netzero-carbon-poc.chirayu87.workers.dev
- **Frontend**: https://netzero-carbon-frontend.pages.dev
- **LINE OA**: Search "NetZeroCarbon" in LINE app

---

## Troubleshooting

### Issue: Webhook not receiving events
**Solution**: Verify webhook URL in LINE Developer Console is `https://netzero-carbon-poc.chirayu87.workers.dev/webhook/line` and webhook is enabled.

### Issue: Photo upload fails with "GPS required"
**Solution**: Ensure photo was taken via LIFF camera (not chat attachment). Chat photos don't include GPS metadata.

### Issue: SF_w always 1.0
**Solution**: Check that photos are verified (admin_status = 'verified'). Pending or rejected photos don't count.

### Issue: Calendar steps have wrong due dates
**Solution**: Verify sow_date format is DD/MM/YYYY. Check `src/season/calendar.ts` for step calculation logic.

### Issue: LINE signature validation fails
**Solution**: Verify LINE_CHANNEL_SECRET in wrangler.toml matches LINE Developer Console. Signature is Base64 HMAC-SHA256 (not hex).
