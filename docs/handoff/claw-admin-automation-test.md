# CLAW Agent Test Handoff — Admin Automation System

**Date**: 2026-08-28  
**Version**: d604479  
**Deployed URL**: https://netzero-carbon-poc.poom-a1d.workers.dev

## What Was Built

Complete admin automation system implementing 17 tickets (#113-#129) that automate photo verification, temporal validation, farmer trust scoring, and admin notifications.

## Architecture Overview

```
Farmer uploads photo (POST /photo/upload)
    │
    ├─ Temporal validation (EXIF vs season phase window)
    │   ├─ Invalid (outside window) → 400 rejected
    │   ├─ Unknown (missing EXIF) → flagged for admin
    │   └─ Valid → continue
    │
    ├─ CLIP classification (wetdry photos only)
    │   ├─ Invalid photo → refused (200, nothing persisted)
    │   ├─ Below threshold → flagged for admin
    │   ├─ Auto-verify rules (confidence + trust)
    │   │   ├─ High confidence + high trust → pre_verified
    │   │   └─ Otherwise → flagged for admin
    │   └─ Audit sampling (10% default)
    │
    └─ Admin review queue
        ├─ Verify/reject → updates farmer trust score
        └─ Supersede/promote → audit trail entries
```

## Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/photo/upload` | POST | Upload photo with AI classification |
| `/api/admin/review/:photoId` | POST | Admin verify/reject |
| `/api/admin/audit/:photoId` | GET | Decision history |
| `/api/admin/review` | GET | Review queue (JSON) |
| `/admin/review` | GET | Review queue (HTML) |
| `/sponsor` | GET | Sponsor dashboard |

## Test Scenarios

### 1. Photo Upload with Temporal Validation

```bash
# Valid photo within phase window
curl -X POST https://netzero-carbon-poc.poom-a1d.workers.dev/photo/upload \
  -F "photo=@test.jpg" \
  -F "plot_id=plot-1" \
  -F "season_id=2026-01" \
  -F "gps_lat=13.75" \
  -F "gps_lng=100.50" \
  -F "gps_accuracy=10" \
  -F "taken_at=2026-05-10T12:00:00Z" \
  -F "photo_type=prepare" \
  -F "__exif_timestamp=2026-05-10T12:00:00Z"

# Invalid photo outside phase window (should return 400)
curl -X POST https://netzero-carbon-poc.poom-a1d.workers.dev/photo/upload \
  -F "photo=@test.jpg" \
  -F "plot_id=plot-1" \
  -F "season_id=2026-01" \
  -F "gps_lat=13.75" \
  -F "gps_lng=100.50" \
  -F "gps_accuracy=10" \
  -F "taken_at=2026-07-01T12:00:00Z" \
  -F "photo_type=prepare" \
  -F "__exif_timestamp=2026-07-01T12:00:00Z"
```

### 2. Photo Upload with CLIP Classification (wetdry)

```bash
# High confidence pass (should auto-verify with high trust farmer)
curl -X POST https://netzero-carbon-poc.poom-a1d.workers.dev/photo/upload \
  -F "photo=@test.jpg" \
  -F "plot_id=plot-1" \
  -F "season_id=2026-01" \
  -F "gps_lat=13.75" \
  -F "gps_lng=100.50" \
  -F "gps_accuracy=10" \
  -F "taken_at=2026-01-15T10:00:00Z" \
  -F "photo_type=wetdry" \
  -F "__test_classification={\"valid\":true,\"water_state\":\"flooded\",\"confidence\":0.95,\"reason\":\"clear\"}"

# Invalid photo (should return 200 refused, nothing persisted)
curl -X POST https://netzero-carbon-poc.poom-a1d.workers.dev/photo/upload \
  -F "photo=@test.jpg" \
  -F "plot_id=plot-1" \
  -F "season_id=2026-01" \
  -F "gps_lat=13.75" \
  -F "gps_lng=100.50" \
  -F "gps_accuracy=10" \
  -F "taken_at=2026-01-15T10:00:00Z" \
  -F "photo_type=wetdry" \
  -F "__test_classification={\"valid\":false,\"water_state\":\"not-applicable\",\"confidence\":0.1,\"reason\":\"no pipe\"}"
```

### 3. Admin Review Flow

```bash
# Get review queue
curl https://netzero-carbon-poc.poom-a1d.workers.dev/api/admin/review

# Admin verify (requires auth cookie)
curl -X POST https://netzero-carbon-poc.poom-a1d.workers.dev/api/admin/review/photo-123 \
  -H "Content-Type: application/json" \
  -H "Cookie: nzc_session=<admin_session>" \
  -d '{"status":"verified","reason":"looks good"}'

# Admin reject
curl -X POST https://netzero-carbon-poc.poom-a1d.workers.dev/api/admin/review/photo-123 \
  -H "Content-Type: application/json" \
  -H "Cookie: nzc_session=<admin_session>" \
  -d '{"status":"rejected","reason":"unclear"}'

# Get audit trail
curl https://netzero-carbon-poc.poom-a1d.workers.dev/api/admin/audit/photo-123 \
  -H "Cookie: nzc_session=<admin_session>"
```

### 4. Farmer Trust Score

```bash
# Check farmer trust (via D1 query or add endpoint)
# Trust score = (verified_count + 1) / (total_photos + 2) [Bayesian smoothing]
# New farmers start at 0.50
```

## Database Schema Changes

```sql
-- New table for farmer trust scoring
CREATE TABLE farmer_trust (
  farmer_id TEXT PRIMARY KEY REFERENCES farmers(id),
  trust_score REAL DEFAULT 0.50,
  total_photos INTEGER DEFAULT 0,
  verified_count INTEGER DEFAULT 0,
  rejected_count INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- photo_evidence table already has:
-- pre_verified, audit_sample, superseded columns
```

## Auto-Verify Rules

| Confidence | Trust | Valid | Decision |
|------------|-------|-------|----------|
| < 0.4 | any | any | auto_reject |
| any | < 0.3 | any | auto_reject |
| > 0.85 | > 0.7 | true | auto_verify |
| other | other | other | queue_for_admin |

## Temporal Validation

Phase windows calculated from `sow_date` in `season_inputs`:

| Phase | Window (with 7-day grace) |
|-------|---------------------------|
| prepare | sow_date - 37 days → sow_date + 7 days |
| grow | sow_date - 7 days → sow_date + 127 days |
| harvest | sow_date + 113 days → sow_date + 157 days |

## Cron Jobs (Future)

These are implemented but not yet scheduled in wrangler.toml:

| Cron | Schedule | Description |
|------|----------|-------------|
| Queue digest | Daily 9am | Notify admin if queue > 10 |
| Stale escalation | Every 6h | Escalate photos pending > 48h |

To enable, add to wrangler.toml:
```toml
[triggers]
crons = ["0 9 * * *", "0 */6 * * *"]
```

## Test Checklist

- [ ] Photo upload with valid EXIF → continues to classification
- [ ] Photo upload with invalid EXIF → 400 rejected
- [ ] Photo upload with missing EXIF → flagged for admin
- [ ] Wetdry photo with high confidence + high trust → auto-verified
- [ ] Wetdry photo with invalid classification → refused (200, nothing persisted)
- [ ] Wetdry photo with low confidence → flagged for admin
- [ ] Admin verify → farmer trust increases
- [ ] Admin reject → farmer trust decreases
- [ ] Admin supersede pre-verified → audit trail shows "superseded"
- [ ] Admin promote audit sample → audit trail shows "promoted"
- [ ] Audit history endpoint returns full decision timeline
- [ ] Sponsor dashboard shows machine vs human provenance counts

## Known Limitations

1. **CLIP model not deployed**: Model files (~890MB) need to be uploaded to R2 or external service
2. **Cron jobs not scheduled**: Need to add `[triggers]` section to wrangler.toml
3. **LINE push notifications**: Message composition works, but actual push API not configured
4. **Test classification override**: `__test_classification` form field only for testing

## Files Modified/Created

### Source Code (11 files)
- `src/routes/photo.ts` — Main upload route with temporal + CLIP + auto-verify
- `src/admin/review.ts` — Admin review with trust score updates
- `src/admin/queue-digest.ts` — Queue digest cron logic
- `src/trust/farmer-trust.ts` — Farmer trust scoring
- `src/vision/auto-verify.ts` — Auto-verify rule engine
- `src/vision/clip-classifier.ts` — CLIP model loader
- `src/vision/clip-inference.ts` — CLIP inference endpoint
- `src/vision/retake-message.ts` — Retake notification composer
- `src/photo/exif.ts` — EXIF extraction
- `src/season/phase-windows.ts` — Phase window calculator
- `src/season/temporal-validation.ts` — Temporal validation logic

### Tests (15 files)
- `tests/helpers/integration.ts` — Updated mock DB with first() and value parsing
- `tests/integration/admin-trust.test.ts` — Admin trust integration
- `tests/integration/audit-trail.test.ts` — Audit trail tests
- `tests/integration/preverify-flow.test.ts` — Pre-verification flow
- `tests/integration/temporal-upload.test.ts` — Temporal validation
- `tests/integration/upload-screening.test.ts` — Upload screening
- `tests/unit/auto-verify.test.ts` — Auto-verify unit tests
- `tests/unit/farmer-trust.test.ts` — Farmer trust unit tests
- `tests/unit/farmer-trust-update.test.ts` — Trust update tests
- `tests/unit/phase-windows.test.ts` — Phase window tests
- `tests/unit/photo.test.ts` — Photo upload unit tests
- `tests/unit/preverify-review.test.ts` — Review logic tests
- `tests/unit/queue-digest.test.ts` — Queue digest tests
- `tests/unit/retake-message.test.ts` — Retake message tests
- `tests/unit/temporal-validation.test.ts` — Temporal validation tests

## Test Results

```
Test Files: 76 passed, 2 failed (78 total)
Tests: 451 passed, 2 failed (453 total)
```

The 2 failing tests are verification tests for `/tmp/sandcastle-test.txt` which only exists on the VPS.

## Next Steps for CLAW Agent

1. **Run E2E tests** using Playwright to verify the full upload → classify → review flow
2. **Test with real photos** to verify CLIP classification works (once model is deployed)
3. **Verify cron jobs** by adding triggers to wrangler.toml
4. **Test LINE notifications** by configuring push API credentials
5. **Load test** with 50+ photos/day to verify auto-verify reduces admin queue

---

**Contact**: For questions, check the spec at `specs/admin-automation.md` or the parent issue #112.
