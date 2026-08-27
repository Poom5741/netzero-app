# CLAW Manual Test Handoff — Admin Automation System

**Date**: 2026-08-28  
**Commit**: a072a9c  
**Deployed URL**: https://netzero-carbon-poc.poom-a1d.workers.dev

## What Was Built

Admin automation system implementing 17 tickets (#113-#129). Automates photo verification, temporal validation, farmer trust scoring, and admin notifications.

## Manual Test Scenarios

Test each flow manually via curl or browser. All endpoints are live at `https://netzero-carbon-poc.poom-a1d.workers.dev`.

---

### 1. Photo Upload — Temporal Validation

**Setup**: First, seed a season with sow_date via D1 console or use existing data.

**Test 1a: Valid photo within phase window**
```bash
curl -X POST https://netzero-carbon-poc.poom-a1d.workers.dev/photo/upload \
  -F "photo=@/path/to/test.jpg" \
  -F "plot_id=plot-1" \
  -F "season_id=2026-01" \
  -F "gps_lat=13.75" \
  -F "gps_lng=100.50" \
  -F "gps_accuracy=10" \
  -F "taken_at=2026-05-10T12:00:00Z" \
  -F "photo_type=prepare" \
  -F "__exif_timestamp=2026-05-10T12:00:00Z"
```
**Expect**: 201 response, photo processed normally.

**Test 1b: Photo outside phase window (should be rejected)**
```bash
curl -X POST https://netzero-carbon-poc.poom-a1d.workers.dev/photo/upload \
  -F "photo=@/path/to/test.jpg" \
  -F "plot_id=plot-1" \
  -F "season_id=2026-01" \
  -F "gps_lat=13.75" \
  -F "gps_lng=100.50" \
  -F "gps_accuracy=10" \
  -F "taken_at=2026-07-01T12:00:00Z" \
  -F "photo_type=prepare" \
  -F "__exif_timestamp=2026-07-01T12:00:00Z"
```
**Expect**: 400 response with `{"error": "Photo taken at wrong time"}`.

**Test 1c: Missing EXIF (should flag for admin)**
```bash
curl -X POST https://netzero-carbon-poc.poom-a1d.workers.dev/photo/upload \
  -F "photo=@/path/to/test.jpg" \
  -F "plot_id=plot-1" \
  -F "season_id=2026-01" \
  -F "gps_lat=13.75" \
  -F "gps_lng=100.50" \
  -F "gps_accuracy=10" \
  -F "taken_at=2026-01-15T10:00:00Z" \
  -F "photo_type=prepare"
```
**Expect**: 201 response with `{"verdict": "flagged", "reason": "EXIF missing"}`.

---

### 2. Photo Upload — CLIP Classification (wetdry)

**Test 2a: High confidence pass (auto-verify)**
```bash
curl -X POST https://netzero-carbon-poc.poom-a1d.workers.dev/photo/upload \
  -F "photo=@/path/to/test.jpg" \
  -F "plot_id=plot-1" \
  -F "season_id=2026-01" \
  -F "gps_lat=13.75" \
  -F "gps_lng=100.50" \
  -F "gps_accuracy=10" \
  -F "taken_at=2026-01-15T10:00:00Z" \
  -F "photo_type=wetdry" \
  -F "__test_classification={\"valid\":true,\"water_state\":\"flooded\",\"confidence\":0.95,\"reason\":\"clear\"}"
```
**Expect**: 201 with `{"verdict": "pre_verified"}` (if farmer trust > 0.7).

**Test 2b: Invalid photo (refused, nothing persisted)**
```bash
curl -X POST https://netzero-carbon-poc.poom-a1d.workers.dev/photo/upload \
  -F "photo=@/path/to/test.jpg" \
  -F "plot_id=plot-1" \
  -F "season_id=2026-01" \
  -F "gps_lat=13.75" \
  -F "gps_lng=100.50" \
  -F "gps_accuracy=10" \
  -F "taken_at=2026-01-15T10:00:00Z" \
  -F "photo_type=wetdry" \
  -F "__test_classification={\"valid\":false,\"water_state\":\"not-applicable\",\"confidence\":0.1,\"reason\":\"no pipe\"}"
```
**Expect**: 200 with `{"verdict": "refused"}`. No DB row created.

**Test 2c: Low confidence (flagged for admin)**
```bash
curl -X POST https://netzero-carbon-poc.poom-a1d.workers.dev/photo/upload \
  -F "photo=@/path/to/test.jpg" \
  -F "plot_id=plot-1" \
  -F "season_id=2026-01" \
  -F "gps_lat=13.75" \
  -F "gps_lng=100.50" \
  -F "gps_accuracy=10" \
  -F "taken_at=2026-01-15T10:00:00Z" \
  -F "photo_type=wetdry" \
  -F "__test_classification={\"valid\":true,\"water_state\":\"flooded\",\"confidence\":0.7,\"reason\":\"unclear\"}"
```
**Expect**: 201 with `{"verdict": "flagged"}`.

---

### 3. Admin Review Flow

**Test 3a: View review queue (HTML)**
```
Browser: https://netzero-carbon-poc.poom-a1d.workers.dev/admin/review
```
**Expect**: HTML page showing pending photos with verify/reject buttons.

**Test 3b: View review queue (JSON)**
```bash
curl https://netzero-carbon-poc.poom-a1d.workers.dev/api/admin/review
```
**Expect**: JSON array of photos needing review.

**Test 3c: Admin verify a photo**
```bash
curl -X POST https://netzero-carbon-poc.poom-a1d.workers.dev/api/admin/review/<photo-id> \
  -H "Content-Type: application/json" \
  -H "Cookie: nzc_session=<admin_session>" \
  -d '{"status":"verified","reason":"looks good"}'
```
**Expect**: 200 success. Farmer trust score increases.

**Test 3d: Admin reject a photo**
```bash
curl -X POST https://netzero-carbon-poc.poom-a1d.workers.dev/api/admin/review/<photo-id> \
  -H "Content-Type: application/json" \
  -H "Cookie: nzc_session=<admin_session>" \
  -d '{"status":"rejected","reason":"unclear image"}'
```
**Expect**: 200 success. Farmer trust score decreases.

**Test 3e: View audit trail**
```bash
curl https://netzero-carbon-poc.poom-a1d.workers.dev/api/admin/audit/<photo-id> \
  -H "Cookie: nzc_session=<admin_session>"
```
**Expect**: JSON array of all decisions made on the photo.

---

### 4. Farmer Trust Score

**Test 4a: Check trust score changes**
1. Upload a photo as a new farmer (trust starts at 0.50)
2. Admin verifies → trust should increase
3. Admin rejects → trust should decrease

**Test 4b: Auto-verify requires high trust**
1. New farmer uploads high-confidence photo → should be flagged (trust < 0.7)
2. After several verifications, trust increases
3. Same farmer uploads again → may auto-verify (trust > 0.7)

---

### 5. Sponsor Dashboard

**Test 5a: View sponsor dashboard**
```bash
curl https://netzero-carbon-poc.poom-a1d.workers.dev/sponsor
```
**Expect**: JSON with plots grouped by province, including:
- `water_state_tallies` (flooded/dry counts)
- `provenance_counts` (machine/human verified)

**Test 5b: View single plot**
```bash
curl https://netzero-carbon-poc.poom-a1d.workers.dev/sponsor/<plot-id>
```
**Expect**: Plot detail with verification provenance.

---

### 6. Kill Switch

**Test 6a: Upload with kill switch (should queue, no screening)**
```bash
curl -X POST https://netzero-carbon-poc.poom-a1d.workers.dev/photo/upload \
  -F "photo=@/path/to/test.jpg" \
  -F "plot_id=plot-1" \
  -F "season_id=2026-01" \
  -F "gps_lat=13.75" \
  -F "gps_lng=100.50" \
  -F "gps_accuracy=10" \
  -F "taken_at=2026-01-15T10:00:00Z" \
  -F "photo_type=wetdry" \
  -F "__kill_switch=true"
```
**Expect**: 201 with `{"verdict": "queued"}` (no CLIP screening).

---

## Expected Behaviors Summary

| Scenario | Expected Result |
|----------|-----------------|
| Valid EXIF in window | Photo processed normally |
| EXIF outside window | 400 rejected |
| Missing EXIF | Flagged for admin |
| High confidence + high trust | Auto-verified (pre_verified) |
| Invalid photo (no pipe) | Refused (200, nothing saved) |
| Low confidence | Flagged for admin |
| Admin verify | Trust +, audit entry |
| Admin reject | Trust -, audit entry |
| Kill switch on | Queued (no screening) |

---

## Known Limitations

1. **CLIP model not deployed**: Real classification requires model files in R2. Use `__test_classification` override for testing.
2. **Cron jobs not scheduled**: Queue digest and stale escalation logic exists but not triggered.
3. **LINE push**: Message composition works, actual push API not configured.
4. **Auth**: Admin review requires valid session cookie (login via `/auth/login`).

---

## Files Changed

- `src/routes/photo.ts` — Main upload route
- `src/admin/review.ts` — Admin review + trust updates
- `src/trust/farmer-trust.ts` — Trust scoring
- `src/vision/auto-verify.ts` — Auto-verify rules
- `src/vision/clip-classifier.ts` — CLIP loader
- `src/vision/clip-inference.ts` — CLIP inference
- `src/photo/exif.ts` — EXIF extraction
- `src/season/phase-windows.ts` — Phase calculator
- `src/season/temporal-validation.ts` — Temporal validation
- `src/admin/queue-digest.ts` — Queue digest logic
- `src/line/retake-message.ts` — Retake notifications
- `tests/` — 15 test files updated

---

**Test each scenario manually and report any issues found.**
