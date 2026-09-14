# API Contracts: Sponsor Dashboard

**Date**: 2026-09-14
**Feature**: Sponsor Dashboard (specs/004-sponsor-dashboard)

## Authentication Endpoints

### POST /sponsor/login

Authenticate and create session.

**Request**:
```json
{
  "email": "sponsor@company.com",
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
    "id": 10,
    "email": "sponsor@company.com",
    "role": "sponsor",
    "supportedAreas": ["Chiang Mai", "Lamphun"]
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

### POST /sponsor/logout

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

### GET /sponsor/

Get sponsor dashboard with plots by province.

**Query Parameters**:
- `province` (optional, filtered by sponsor's supported areas)
- `area_code` (optional, filtered by sponsor's supported areas)

**Response** (200):
```json
{
  "summary": {
    "totalPlots": 150,
    "totalRai": 1500.0,
    "totalHectares": 240.0,
    "householdCount": 75,
    "verifiedCredits": 8000.0,
    "estimatedCredits": 2000.0,
    "certificationPeriod": "2026-01-01 to 2026-12-31"
  },
  "areas": [
    {
      "province": "Chiang Mai",
      "areaCode": "CM-001",
      "plotCount": 100,
      "totalRai": 1000.0,
      "householdCount": 50
    }
  ],
  "seasonCredits": [
    {
      "season": "2026-Wet",
      "verifiedCredits": 5000.0,
      "estimatedCredits": 1200.0
    }
  ],
  "ghgBreakdown": {
    "methaneReduction": 6000.0,
    "n2oReduction": 1500.0,
    "co2Reduction": 500.0,
    "fertilizerParity": "No change in fertilizer emissions between baseline and project"
  },
  "uncertaintyNote": "Estimates may change when required evidence is incomplete and a conservative water-management factor (SF_w = 0.71) is used."
}
```

**Permissions**: sponsor (area-scoped)

### GET /sponsor/me

Get sponsor profile.

**Response** (200):
```json
{
  "id": 10,
  "email": "sponsor@company.com",
  "role": "sponsor",
  "supportedAreas": [
    {
      "province": "Chiang Mai",
      "areaCode": "CM-001"
    },
    {
      "province": "Lamphun",
      "areaCode": "LP-002"
    }
  ]
}
```

**Permissions**: sponsor

## Detail Endpoints

### GET /sponsor/plots/:id

Get plot detail (CPA-coded only).

**Response** (200):
```json
{
  "plot": {
    "id": 1,
    "plotCode": "CPA-001-PLOT-001",
    "areaRai": 10.5,
    "province": "Chiang Mai",
    "areaCode": "CM-001"
  },
  "seasons": [
    {
      "id": 1,
      "sowDate": "2026-06-01",
      "cropCycle": 120,
      "status": "active",
      "credits": {
        "verified": 50.0,
        "estimated": 10.0
      }
    }
  ]
}
```

**Permissions**: sponsor (area-scoped)

**Errors**:
- 403: Plot not in sponsor's supported areas
- 404: Plot not found

### GET /sponsor/summary

Get sponsor summary with all metrics.

**Query Parameters**:
- `province` (optional)
- `area_code` (optional)
- `season` (optional)

**Response** (200):
```json
{
  "totalPlots": 150,
  "totalRai": 1500.0,
  "totalHectares": 240.0,
  "householdCount": 75,
  "verifiedCredits": 8000.0,
  "estimatedCredits": 2000.0,
  "certificationPeriod": "2026-01-01 to 2026-12-31",
  "sfwFactor": {
    "current": 0.71,
    "optimal": 0.55,
    "note": "Conservative factor used due to incomplete evidence"
  }
}
```

**Permissions**: sponsor (area-scoped)

### GET /sponsor/farmers

Get farmer list (CPA codes only).

**Query Parameters**:
- `province` (optional)
- `area_code` (optional)
- `page` (default: 1)
- `limit` (default: 20)

**Response** (200):
```json
{
  "farmers": [
    {
      "cpaCode": "CPA-001",
      "plotCount": 3,
      "totalRai": 30.0,
      "province": "Chiang Mai"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 75,
    "totalPages": 4
  }
}
```

**Permissions**: sponsor (area-scoped, CPA codes only)

### GET /sponsor/areas

Get sponsor's supported areas.

**Response** (200):
```json
{
  "areas": [
    {
      "province": "Chiang Mai",
      "areaCode": "CM-001",
      "plotCount": 100,
      "totalRai": 1000.0,
      "householdCount": 50
    },
    {
      "province": "Lamphun",
      "areaCode": "LP-002",
      "plotCount": 50,
      "totalRai": 500.0,
      "householdCount": 25
    }
  ]
}
```

**Permissions**: sponsor

### GET /sponsor/certificates

Get certificate list.

**Query Parameters**:
- `season` (optional)

**Response** (200):
```json
{
  "certificates": [
    {
      "id": 1,
      "season": "2026-Wet",
      "verifiedCredits": 5000.0,
      "certificationDate": "2026-12-15",
      "status": "certified"
    }
  ]
}
```

**Permissions**: sponsor (area-scoped)

### GET /sponsor/ghg-breakdown

Get GHG source breakdown.

**Query Parameters**:
- `province` (optional)
- `area_code` (optional)
- `season` (optional)

**Response** (200):
```json
{
  "baseline": {
    "ch4": 10000.0,
    "n2o": 3000.0,
    "co2": 2000.0,
    "total": 15000.0
  },
  "project": {
    "ch4": 4000.0,
    "n2o": 1500.0,
    "co2": 1500.0,
    "total": 7000.0
  },
  "reduction": {
    "ch4": 6000.0,
    "n2o": 1500.0,
    "co2": 500.0,
    "total": 8000.0
  },
  "methaneContribution": "Methane reduction accounts for 75% of total credit difference",
  "fertilizerParity": "No change in fertilizer emissions between baseline and project"
}
```

**Permissions**: sponsor (area-scoped)

### GET /sponsor/season-credits

Get credits by season.

**Query Parameters**:
- `province` (optional)
- `area_code` (optional)

**Response** (200):
```json
{
  "seasons": [
    {
      "season": "2026-Wet",
      "verifiedCredits": 5000.0,
      "estimatedCredits": 1200.0,
      "totalCredits": 6200.0
    },
    {
      "season": "2026-Dry",
      "verifiedCredits": 3000.0,
      "estimatedCredits": 800.0,
      "totalCredits": 3800.0
    }
  ]
}
```

**Permissions**: sponsor (area-scoped)

## Export Endpoints

### GET /sponsor/export/summary

Export sponsor summary as CSV or JSON.

**Query Parameters**:
- `format` (csv or json, default: csv)
- `province` (optional)
- `area_code` (optional)

**Response** (200):
```
Content-Type: text/csv
Content-Disposition: attachment; filename="sponsor-summary-2026-09-14.csv"

Province,Area Code,Plot Count,Total Rai,Households,Verified Credits,Estimated Credits
Chiang Mai,CM-001,100,1000.0,50,5000.0,1200.0
Lamphun,LP-002,50,500.0,25,3000.0,800.0
```

**Permissions**: sponsor (area-scoped, CPA codes only)

### GET /sponsor/export/estimates

Export carbon estimates as CSV or JSON.

**Query Parameters**:
- `format` (csv or json, default: csv)
- `province` (optional)
- `area_code` (optional)
- `season` (optional)

**Response** (200):
```
Content-Type: text/csv
Content-Disposition: attachment; filename="sponsor-estimates-2026-09-14.csv"

Season,CPA Code,Plot Code,Baseline CH4,Project CH4,SF_w,Net Offset,Verified
2026-Wet,CPA-001,PLOT-001,500.0,200.0,0.55,300.0,Yes
2026-Wet,CPA-002,PLOT-001,450.0,180.0,0.71,270.0,No
```

**Permissions**: sponsor (area-scoped, CPA codes only)

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied: area not in sponsor's supported areas"
  }
}
```

**Error Codes**:
- `UNAUTHORIZED`: Invalid credentials or session
- `FORBIDDEN`: Area not in sponsor's supported areas
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `INTERNAL_ERROR`: Server error

## Privacy Guarantees

### What Sponsors CAN See

✅ CPA codes (e.g., CPA-001)
✅ Plot codes (e.g., PLOT-001)
✅ Area in rai/hectares
✅ Province and area codes
✅ Verified and estimated credits
✅ Season information
✅ GHG source breakdown
✅ Household counts (anonymized)

### What Sponsors CANNOT See

❌ Farmer names
❌ Phone numbers
❌ National ID numbers
❌ Deed numbers
❌ Full addresses
❌ Other sponsors' areas
❌ Areas not configured for their account

## Scope Enforcement

All sponsor endpoints enforce area scoping:

```typescript
// Example from src/routes/sponsor.ts
const areas = await getAreasForRequest(c);
if (areas.length === 0) {
  return c.json({ error: { code: 'FORBIDDEN', message: 'No supported areas configured' } }, 403);
}

// All queries filter by sponsor's areas
const plots = await db.prepare(`
  SELECT * FROM plots
  WHERE province IN (SELECT value FROM json_each(?))
    AND area_code IN (SELECT value FROM json_each(?))
`).bind(JSON.stringify(areas.provinces), JSON.stringify(areas.areaCodes)).all();
```

## Conclusion

The API contracts cover all Sponsor Dashboard requirements with strict area scoping, CPA-code-only data shapes, and visual distinction between verified and estimated credits. All endpoints are already implemented in `src/routes/sponsor.ts` and `src/sponsor/dashboard.ts`.
