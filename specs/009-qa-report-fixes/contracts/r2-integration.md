# Contract: R2 Integration Test

**Requirement**: R4 | **Date**: 2026-09-17

## Purpose

Verify R2 photo upload/download works with real Cloudflare bindings (via miniflare).

## Interface

### Upload Photo

**Endpoint**: `POST /photo/upload`

**Request**:
```
Content-Type: multipart/form-data
Fields:
  - photo: File (JPEG, <10MB)
  - plot_id: string
  - season_id: string
  - gps_lat: string (decimal)
  - gps_lng: string (decimal)
  - gps_accuracy: string (meters)
  - taken_at: string (ISO 8601)
  - photo_type: string (wetdry|preparation|harvest)
```

**Response** (201 Created):
```json
{
  "id": "photo_abc123",
  "verdict": "pre_verified|queued|flagged",
  "photo_url": "evidence/photo_abc123.jpg",
  "photo_type": "wetdry",
  "water_state": "flooded",
  "ai_confidence": 0.95,
  "pre_verified": true,
  "audit_sample": false
}
```

### Download Photo

**Method**: `R2.get(key)`

**Input**: `key: string` (e.g., `"evidence/photo_abc123.jpg"`)

**Output**: R2 object with:
- `body: ReadableStream` (photo bytes)
- `metadata: { gps_lat, gps_lng, gps_accuracy, taken_at }`

## Test Scenarios

### Scenario 1: Upload and Retrieve

**Given**: Test photo with valid EXIF (GPS: 18.7883, 98.9853)
**When**: Upload photo via `/photo/upload`
**Then**:
- Response status: 201
- Response contains `photo_url`
- R2.get(photo_url) returns photo bytes
- Metadata preserved (GPS, timestamp)

### Scenario 2: Metadata Preservation

**Given**: Photo uploaded with GPS coordinates
**When**: Retrieve photo from R2
**Then**:
- `metadata.gps_lat === 18.7883`
- `metadata.gps_lng === 98.9853`
- `metadata.taken_at === "2026-01-15T10:00:00Z"`

### Scenario 3: Cleanup

**Given**: Test photo uploaded
**When**: Test completes
**Then**:
- Photo deleted from R2
- DB records deleted
- Audit log entries deleted

## Test Data

**Photo**: `tests/fixtures/test-photo.jpg` (1MB JPEG)
**EXIF**: GPS 18.7883, 98.9853; Timestamp 2026-01-15T10:00:00Z
**Plot ID**: `test-plot-1`
**Season ID**: `2026-01`

## Assertions

```typescript
expect(res.status).toBe(201);
expect(body.photo_url).toMatch(/^evidence\/photo_/);
expect(body.pre_verified).toBe(true);

const r2Object = await env.R2.get(body.photo_url);
expect(r2Object).not.toBeNull();
expect(r2Object.metadata.gps_lat).toBe(18.7883);
```

## Cleanup

```typescript
afterEach(async () => {
  await env.DB.prepare("DELETE FROM photo_evidence WHERE id LIKE 'test-%'").run();
  await env.DB.prepare("DELETE FROM audit_log WHERE photo_id LIKE 'test-%'").run();
  await env.R2.delete(`test-${photoId}`);
});
```
