# Contract: REST API Endpoints

**Base URL**: `https://netzero-carbon-poc.<subdomain>.workers.dev/api`
**Authentication**: Session token (cookie) or API key (header)

## Farmer Endpoints

### GET /api/farmer/:id

**Purpose**: Retrieve farmer profile
**Auth**: Session token (farmer or staff)

**Response**:
```json
{
  "id": "farmer-001",
  "full_name": "สมชาย ใจดี",
  "phone": "0812345678",
  "addr_province": "สุพรรณบุรี",
  "addr_district": "เมือง",
  "plots": [
    {
      "id": "plot-001",
      "plot_code": "SPB-0142",
      "area_rai": 10.5
    }
  ]
}
```

**Status Codes**:
- 200: Success
- 404: Farmer not found
- 401: Unauthorized

---

### POST /api/farmer/register

**Purpose**: Register new farmer (LIFF form submission)
**Auth**: Session token (LIFF)

**Request**:
```json
{
  "full_name": "สมชาย ใจดี",
  "phone": "0812345678",
  "gender": "male",
  "addr_province": "สุพรรณบุรี",
  "addr_district": "เมือง",
  "addr_subdistrict": "ท่าพี่เลี้ยง",
  "addr_village": "หมู่ 3",
  "national_id": "1234567890123",
  "plot_code": "SPB-0142",
  "deed_no": "12345",
  "doc_type": "chanote",
  "tenure": "owner",
  "area_rai": 10.5
}
```

**Response**:
```json
{
  "farmer_id": "farmer-001",
  "plot_id": "plot-001",
  "status": "pending_review"
}
```

**Status Codes**:
- 201: Created
- 400: Validation error
- 409: Phone already registered

---

## Photo Endpoints

### POST /api/photo/upload

**Purpose**: Upload photo evidence (LIFF camera)
**Auth**: Session token (farmer)

**Request**: multipart/form-data
- `photo`: image/jpeg or image/png (max 10MB)
- `plot_id`: string
- `season_id`: string
- `gps_lat`: number
- `gps_lng`: number
- `round`: "WET-1" | "DRY-1" | "WET-2" | "DRY-2"

**Response**:
```json
{
  "photo_id": "photo-001",
  "ai_status": "pending",
  "ai_reason": "Photo uploaded, awaiting verification"
}
```

**Status Codes**:
- 201: Created
- 400: Invalid photo format or missing GPS
- 413: Photo too large (>10MB)

---

### GET /api/photo/:id

**Purpose**: Retrieve photo metadata
**Auth**: Session token (farmer or staff)

**Response**:
```json
{
  "id": "photo-001",
  "plot_id": "plot-001",
  "season_id": "2568-napi",
  "photo_url": "https://r2.netzero.carbon/photos/photo-001.jpg",
  "gps_lat": 14.4736,
  "gps_lng": 100.1984,
  "taken_at": "2026-09-14T10:30:00Z",
  "ai_status": "pass",
  "ai_confidence": 0.95,
  "admin_status": "verified"
}
```

**Status Codes**:
- 200: Success
- 404: Photo not found

---

## Season Endpoints

### POST /api/season/create

**Purpose**: Create new season with sowing date
**Auth**: Session token (farmer)

**Request**:
```json
{
  "plot_id": "plot-001",
  "sow_date": "2026-06-01",
  "rice_variety": "ปทุมธานี 1"
}
```

**Response**:
```json
{
  "season_id": "2568-napi",
  "calendar": [
    {
      "step": "SG-01",
      "label": "เตรียมดิน",
      "due_date": "2026-06-01",
      "photo_required": false
    },
    {
      "step": "SG-02",
      "label": "หว่าน",
      "due_date": "2026-06-15",
      "photo_required": false
    }
  ]
}
```

**Status Codes**:
- 201: Created
- 400: Invalid date format
- 409: Season already exists for this plot/year

---

### GET /api/season/:id/calendar

**Purpose**: Retrieve 9-step calendar
**Auth**: Session token (farmer or staff)

**Response**:
```json
{
  "season_id": "2568-napi",
  "plot_id": "plot-001",
  "sow_date": "2026-06-01",
  "steps": [
    {
      "step": "SG-01",
      "label": "เตรียมดิน",
      "due_date": "2026-06-01",
      "status": "completed",
      "photo_required": false
    },
    {
      "step": "SG-02",
      "label": "หว่าน",
      "due_date": "2026-06-15",
      "status": "pending",
      "photo_required": false
    },
    {
      "step": "SG-03",
      "label": "น้ำขังแรก (WET-1)",
      "due_date": "2026-07-01",
      "status": "pending",
      "photo_required": true
    }
  ]
}
```

**Status Codes**:
- 200: Success
- 404: Season not found

---

## Carbon Calculation Endpoints

### GET /api/carbon/:plot_id/:season_id

**Purpose**: Retrieve carbon offset calculation
**Auth**: Session token (farmer or staff)

**Response**:
```json
{
  "plot_id": "plot-001",
  "season_id": "2568-napi",
  "carbon_offset_tco2eq": 2.45,
  "sf_w": 0.55,
  "photo_progress": {
    "completed": 4,
    "total": 4,
    "rounds": ["WET-1", "DRY-1", "WET-2", "DRY-2"]
  },
  "water_savings_percent": 35.2
}
```

**Status Codes**:
- 200: Success
- 404: Season not found
- 400: Insufficient data for calculation

---

## Admin Endpoints

### GET /api/admin/review-queue

**Purpose**: Retrieve photos pending admin review
**Auth**: Session token (staff)

**Response**:
```json
{
  "photos": [
    {
      "id": "photo-001",
      "plot_id": "plot-001",
      "farmer_name": "สมชาย ใจดี",
      "photo_url": "https://r2.netzero.carbon/photos/photo-001.jpg",
      "ai_status": "pass",
      "ai_confidence": 0.95,
      "submitted_at": "2026-09-14T10:30:00Z"
    }
  ],
  "total": 15
}
```

**Status Codes**:
- 200: Success
- 403: Forbidden (not staff)

---

### POST /api/admin/photo/:id/review

**Purpose**: Approve or reject photo
**Auth**: Session token (staff)

**Request**:
```json
{
  "status": "verified",
  "reason": "Photo meets quality standards"
}
```

**Response**:
```json
{
  "photo_id": "photo-001",
  "admin_status": "verified",
  "reviewed_by": "staff-001",
  "reviewed_at": "2026-09-14T11:00:00Z"
}
```

**Status Codes**:
- 200: Success
- 400: Invalid status
- 403: Forbidden (not staff)

---

## Common Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Phone number must be 10 digits",
    "field": "phone"
  }
}
```

**Error Codes**:
- `VALIDATION_ERROR`: Request validation failed
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `CONFLICT`: Resource already exists
- `INTERNAL_ERROR`: Server error
