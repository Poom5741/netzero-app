# API Contracts: Admin Console

**Date**: 2026-09-14
**Feature**: Admin Console (specs/003-admin-console)

## Authentication Endpoints

### POST /admin/login

Authenticate and create session.

**Request**:
```json
{
  "email": "admin@example.com",
  "password": "password123",
  "otp": "123456",
  "remember": true
}
```

**Response** (200):
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Headers**:
```
Set-Cookie: nzc_session=<base64-payload>.<hex-signature>; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400
```

**Errors**:
- 401: Invalid credentials or OTP
- 403: Account disabled

### POST /admin/logout

Destroy session.

**Response** (200):
```json
{
  "success": true
}
```

**Headers**:
```
Set-Cookie: nzc_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0
```

## Overview Endpoints

### GET /admin/overview

Get overview dashboard data.

**Response** (200):
```json
{
  "metrics": {
    "totalFarmers": 1000,
    "totalPlots": 5000,
    "pendingReviews": 50,
    "totalCredits": 12345.67
  },
  "workQueue": {
    "pendingApplications": 25,
    "photoQueue": 100,
    "missingPhotos": 15,
    "sfwFallback": 30
  },
  "creditChart": {
    "verified": 8000.0,
    "estimated": 4345.67
  },
  "provinceBreakdown": [
    {
      "province": "Chiang Mai",
      "farmers": 200,
      "plots": 1000,
      "credits": 2500.0
    }
  ],
  "seasonBreakdown": [
    {
      "season": "2026-Wet",
      "verified": 5000.0,
      "estimated": 2000.0
    }
  ]
}
```

**Permissions**: admin, verifier, field

## Farmer Registry Endpoints

### GET /admin/farmers

List farmers with pagination and filters.

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 20)
- `province` (optional)
- `search` (optional, matches CPA code or name)

**Response** (200):
```json
{
  "farmers": [
    {
      "id": 1,
      "cpaCode": "CPA-001",
      "name": "สมชาย ใจดี",
      "province": "Chiang Mai",
      "area": 10.5,
      "sponsor": "Company A",
      "subplotCount": 3,
      "rai": 30.0,
      "photoProgress": {
        "completed": 3,
        "total": 4
      },
      "be": 1234.5,
      "pe": 234.5,
      "er": 12.3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1000,
    "totalPages": 50
  }
}
```

**Permissions**:
- admin: sees all fields including name
- verifier: sees CPA code only
- field: sees CPA code and area
- sponsor: sees CPA code only, filtered by supported areas
- auditor: sees CPA code only

### GET /admin/farmers/:id

Get farmer detail with all tabs.

**Response** (200):
```json
{
  "farmer": {
    "id": 1,
    "cpaCode": "CPA-001",
    "name": "สมชาย ใจดี",
    "phone": "0812345678",
    "nationalId": "1234567890123",
    "province": "Chiang Mai",
    "district": "Mueang",
    "address": "123 Moo 1"
  },
  "plots": [
    {
      "id": 1,
      "plotCode": "PLOT-001",
      "areaRai": 10.5,
      "deedNo": "CH-12345",
      "holdingStatus": "owner",
      "riceVariety": "Hom Mali",
      "evidenceStatus": {
        "WET-1": "approved",
        "DRY-1": "approved",
        "WET-2": "pending",
        "DRY-2": null
      }
    }
  ],
  "creditCalculation": {
    "seasonId": 1,
    "baselineCh4": 500.0,
    "projectCh4": 200.0,
    "sfW": 0.55,
    "netOffset": 300.0,
    "verified": false,
    "inputs": {
      "areaRai": 10.5,
      "waterManagement": "AWD",
      "fertilizer": 50.0
    }
  },
  "photoEvidence": [
    {
      "id": 1,
      "plotCode": "PLOT-001",
      "photoType": "WET-1",
      "fileUrl": "https://r2.example.com/photo1.jpg",
      "gpsLat": 18.788,
      "gpsLng": 98.985,
      "capturedAt": "2026-06-15T10:30:00Z",
      "waterLevelCm": 5,
      "adminStatus": "approved"
    }
  ],
  "auditLog": [
    {
      "id": 1,
      "actorType": "admin",
      "actorId": 1,
      "action": "approve_photo",
      "targetType": "photo_evidence",
      "targetId": 1,
      "createdAt": "2026-06-15T11:00:00Z"
    }
  ]
}
```

**Permissions**:
- admin: sees all fields
- verifier: sees CPA code, plots, photo evidence
- field: sees CPA code, plots, area
- sponsor: sees CPA code only
- auditor: sees CPA code, plots, photo evidence

## Application Review Endpoints

### GET /admin/applications

List applications awaiting review.

**Query Parameters**:
- `status` (default: pending)
- `page` (default: 1)
- `limit` (default: 20)

**Response** (200):
```json
{
  "applications": [
    {
      "id": 1,
      "cpaCode": "CPA-001",
      "farmerName": "สมชาย ใจดี",
      "location": "Chiang Mai, Mueang",
      "subplotCount": 3,
      "area": 30.0,
      "holdingType": "owner",
      "docCount": 3,
      "docsNeeded": 3,
      "ageDays": 5,
      "status": "pending"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "totalPages": 2
  }
}
```

**Permissions**: admin, verifier

### POST /admin/applications/:id/approve

Approve an application.

**Request**:
```json
{
  "reason": "All documents verified"
}
```

**Response** (200):
```json
{
  "success": true,
  "applicationId": 1,
  "status": "approved",
  "cpaCode": "CPA-001"
}
```

**Permissions**: admin, verifier

### POST /admin/applications/:id/reject

Reject an application.

**Request**:
```json
{
  "reason": "Missing land deed document"
}
```

**Response** (200):
```json
{
  "success": true,
  "applicationId": 1,
  "status": "rejected"
}
```

**Permissions**: admin, verifier

### POST /admin/applications/:id/hold

Hold an application with reason.

**Request**:
```json
{
  "reason": "Please provide clearer photo of land deed"
}
```

**Response** (200):
```json
{
  "success": true,
  "applicationId": 1,
  "status": "hold"
}
```

**Permissions**: admin, verifier

## Evidence Review Endpoints

### GET /admin/evidence/queue

Get photo review queue.

**Query Parameters**:
- `status` (optional: pass, flag, reject, queue_for_admin)
- `page` (default: 1)
- `limit` (default: 20)

**Response** (200):
```json
{
  "photos": [
    {
      "id": 1,
      "plotCode": "PLOT-001",
      "farmerCpa": "CPA-001",
      "photoType": "WET-1",
      "fileUrl": "https://r2.example.com/photo1.jpg",
      "gpsLat": 18.788,
      "gpsLng": 98.985,
      "capturedAt": "2026-06-15T10:30:00Z",
      "waterLevelCm": 5,
      "aiStatus": "queue_for_admin",
      "aiConfidence": 0.75,
      "aiReason": "Unclear water level",
      "adminStatus": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**Permissions**: admin, verifier

### POST /admin/evidence/:id/approve

Approve photo evidence.

**Request**:
```json
{
  "reason": "Clear image with valid GPS and timestamp"
}
```

**Response** (200):
```json
{
  "success": true,
  "photoId": 1,
  "adminStatus": "approved"
}
```

**Permissions**: admin, verifier

### POST /admin/evidence/:id/reject

Reject photo evidence.

**Request**:
```json
{
  "reason": "GPS coordinates do not match plot location"
}
```

**Response** (200):
```json
{
  "success": true,
  "photoId": 1,
  "adminStatus": "rejected"
}
```

**Permissions**: admin, verifier

### POST /admin/evidence/:id/retake

Request retake of photo evidence.

**Request**:
```json
{
  "reason": "Image is blurry, please retake with better focus"
}
```

**Response** (200):
```json
{
  "success": true,
  "photoId": 1,
  "adminStatus": "retake"
}
```

**Permissions**: admin, verifier

## Export Endpoints

### GET /admin/export/farmers

Export farmer data as CSV or JSON.

**Query Parameters**:
- `format` (csv or json, default: csv)
- `province` (optional)

**Response** (200):
```
Content-Type: text/csv
Content-Disposition: attachment; filename="farmers-2026-09-14.csv"

CPA Code,Province,Area (rai),Subplot Count,Photo Progress,BE,PE,ER
CPA-001,Chiang Mai,30.0,3,3/4,1234.5,234.5,12.3
```

**Permissions**:
- admin: exports all fields
- sponsor: exports CPA code only, filtered by supported areas

### GET /admin/export/estimates

Export carbon estimates as CSV or JSON.

**Query Parameters**:
- `format` (csv or json, default: csv)
- `season` (optional)

**Response** (200):
```
Content-Type: text/csv
Content-Disposition: attachment; filename="estimates-2026-09-14.csv"

Season,CPA Code,Plot Code,Baseline CH4,Project CH4,SF_w,Net Offset,Verified
2026-Wet,CPA-001,PLOT-001,500.0,200.0,0.55,300.0,No
```

**Permissions**:
- admin: exports all fields
- sponsor: exports CPA code only, filtered by supported areas

## Settings Endpoints

### GET /admin/settings/permissions

Get role-permission matrix.

**Response** (200):
```json
{
  "roles": [
    {
      "role": "admin",
      "permissions": {
        "viewAllAreaDashboard": true,
        "viewAssignedAreasOnly": false,
        "viewNames": true,
        "viewPhoneNumbers": true,
        "viewIdentityNumbers": true,
        "viewDeedNumbers": true,
        "reviewEvidencePhotos": true,
        "reviewApplications": true,
        "enterDataOnBehalf": true,
        "replyAsBot": true,
        "importBatchData": true,
        "rerunCreditCalculation": true,
        "editFixedParameters": true,
        "exportFarmerReports": true,
        "exportPremiumSubmission": true,
        "viewOwnReports": true,
        "viewAuditLog": true,
        "configurePermissions": true
      }
    }
  ]
}
```

**Permissions**: admin

### PUT /admin/settings/permissions

Update role-permission matrix.

**Request**:
```json
{
  "role": "verifier",
  "permissions": {
    "viewNames": false,
    "reviewEvidencePhotos": true
  }
}
```

**Response** (200):
```json
{
  "success": true,
  "role": "verifier"
}
```

**Permissions**: admin

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid credentials or OTP"
  }
}
```

**Error Codes**:
- `UNAUTHORIZED`: Invalid credentials or session
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `INTERNAL_ERROR`: Server error

## Conclusion

The API contracts cover all Admin Console requirements with role-based access control, audit logging, and data export. All endpoints are already implemented in `src/routes/admin.ts` and related modules.
