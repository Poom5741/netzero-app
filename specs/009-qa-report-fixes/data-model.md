# Data Model: QA Report Fixes

**Date**: 2026-09-17 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Overview

No schema changes required. This spec uses existing tables and adds integration tests that verify data integrity.

## Existing Tables Used

### photo_evidence (R4: R2 Integration)

**Purpose**: Store photo metadata and verification status.

**Fields Used**:
- `id` (TEXT PRIMARY KEY): Photo UUID
- `plot_id` (TEXT): Associated plot
- `season_id` (TEXT): Associated season
- `photo_url` (TEXT): R2 object key
- `gps_lat` (REAL): GPS latitude
- `gps_lng` (REAL): GPS longitude
- `gps_accuracy` (REAL): GPS accuracy in meters
- `taken_at` (TEXT): Photo timestamp (ISO 8601)
- `ai_status` (TEXT): AI classification (pass/flag/reject)
- `admin_status` (TEXT): Admin verification (pending/verified/rejected)
- `pre_verified` (INTEGER): Auto-verification flag (0/1)
- `audit_sample` (INTEGER): Audit sampling flag (0/1)

**Validation Rules**:
- GPS coordinates required (not null)
- Timestamp required (ISO 8601 format)
- `ai_status` must be one of: pass, flag, reject
- `admin_status` must be one of: pending, verified, rejected

**State Transitions**:
- Initial: `admin_status = 'pending'`
- Verified: `admin_status = 'verified'` (admin action)
- Rejected: `admin_status = 'rejected'` (admin action)
- Auto-verified: `pre_verified = 1` (AI confidence > threshold)

### audit_log (R4, R5: Audit Trail Verification)

**Purpose**: Track all privileged actions and automated decisions.

**Fields Used**:
- `id` (TEXT PRIMARY KEY): Audit entry UUID
- `photo_id` (TEXT): Associated photo (nullable)
- `actor_type` (TEXT): Actor type (admin/machine/system)
- `action` (TEXT): Action performed (verified/rejected/pre_verified/flagged)
- `confidence` (REAL): AI confidence score (nullable)
- `reason` (TEXT): Action reason
- `timestamp` (TEXT): Action timestamp (ISO 8601)

**Validation Rules**:
- `actor_type` must be one of: admin, machine, system
- `action` must be one of: verified, rejected, pre_verified, flagged, superseded
- `timestamp` required (ISO 8601 format)

**Immutability**: Audit log entries are append-only. No updates or deletes.

### line_links (R6: LINE Webhook Test)

**Purpose**: Link LINE user IDs to farmer records.

**Fields Used**:
- `id` (TEXT PRIMARY KEY): Link UUID
- `line_user_id` (TEXT): LINE user ID
- `farmer_id` (TEXT): Associated farmer
- `status` (TEXT): Link status (pending/verified)
- `phone_number` (TEXT): Farmer phone number

**Validation Rules**:
- `line_user_id` must be unique
- `status` must be one of: pending, verified
- `phone_number` must match registered farmer

**State Transitions**:
- Initial: `status = 'pending'`
- Verified: `status = 'verified'` (coordinator action)

## Integration Test Data Strategy

### Test Isolation

**Principle**: Each test resets DB to known state; no shared state across tests.

**Implementation**:
- Use miniflare in-memory D1 (fresh database per test)
- Run migrations before each test
- Seed test data from fixtures
- Cleanup after test completes

### Test Fixtures

**Location**: `tests/fixtures/`

**Files**:
- `farmer.json`: Synthetic farmer data (name, phone, address)
- `plot.json`: Synthetic plot data (deed_no, area, location)
- `season.json`: Synthetic season data (year, season_type)
- `photo.json`: Synthetic photo metadata (GPS, timestamp)
- `test-photo.jpg`: 1MB JPEG with valid EXIF (GPS: 18.7883, 98.9853)
- `line-webhook-payload.json`: LINE webhook event payload

**Data Generation**:
- Use synthetic data (no real farmer PII)
- Phone numbers: `+66812345678` (test format)
- LINE user IDs: `U1234567890abcdef` (test format)
- GPS coordinates: Chiang Mai region (18.7883, 98.9853)

### Cleanup Strategy

**After Each Test**:
- Delete test photos from R2
- Delete test records from D1
- Reset audit log

**Implementation**:
```typescript
afterEach(async () => {
  await db.prepare("DELETE FROM photo_evidence WHERE id LIKE 'test-%'").run();
  await db.prepare("DELETE FROM audit_log WHERE photo_id LIKE 'test-%'").run();
  await r2.delete(`test-${photoId}`);
});
```

## Data Flow

### R4: R2 Integration Test

1. **Setup**: Create test photo with EXIF metadata
2. **Upload**: POST `/photo/upload` with photo + metadata
3. **Storage**: Backend uploads to R2, inserts into `photo_evidence`
4. **Audit**: Backend creates audit log entry
5. **Verify**: Test retrieves photo from R2, verifies metadata
6. **Cleanup**: Delete test photo and DB records

### R5: Workers AI Integration Test

1. **Setup**: Create test photo with EXIF metadata
2. **Classify**: POST `/photo/classify` with photo
3. **AI Call**: Backend calls Workers AI (or mock)
4. **Response**: Backend returns classification (valid, water_state, confidence)
5. **Verify**: Test verifies response shape and values
6. **Timeout**: Test verifies timeout handling (>10s)

### R6: LINE Webhook Integration Test

1. **Setup**: Create test payload with valid signature
2. **Send**: POST `/line/webhook` with payload + signature header
3. **Verify**: Backend verifies signature, processes webhook
4. **Audit**: Backend creates audit log entry
5. **Response**: Backend returns 200 OK
6. **Invalid**: Test sends invalid signature, verifies 401 rejection

## Validation Rules Summary

### Photo Evidence
- GPS coordinates: required, not null
- Timestamp: required, ISO 8601 format
- AI status: enum (pass/flag/reject)
- Admin status: enum (pending/verified/rejected)

### Audit Log
- Actor type: enum (admin/machine/system)
- Action: enum (verified/rejected/pre_verified/flagged/superseded)
- Timestamp: required, ISO 8601 format
- Immutability: append-only, no updates/deletes

### LINE Links
- LINE user ID: unique
- Status: enum (pending/verified)
- Phone number: must match registered farmer

## Constraints

### D1 Constraints
- Primary keys: TEXT (UUID format)
- Foreign keys: Enforced (plot_id, season_id, farmer_id)
- Indexes: photo_evidence (plot_id, season_id), audit_log (photo_id, timestamp)

### R2 Constraints
- Object keys: `evidence/{photoId}.jpg`
- Metadata: Stored as R2 object metadata (GPS, timestamp)
- Size limit: 10MB per object

### Performance
- D1 queries: <100ms (indexed)
- R2 upload: <5s (1MB photo)
- Workers AI: <10s (timeout)

## Security

### Privacy
- Test data uses synthetic PII (no real farmer data)
- LINE_CHANNEL_SECRET stored in `.dev.vars` (not committed)
- No secrets in test fixtures or logs

### Access Control
- Integration tests use admin credentials (test-only)
- LINE webhook test uses test channel secret
- No production data accessed in tests

### Audit
- All test actions logged to audit_log
- Test entries marked with `actor_type = 'machine'`
- Cleanup actions also logged
