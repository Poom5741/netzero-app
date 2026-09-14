# Data Model: Sponsor Dashboard

**Date**: 2026-09-14
**Feature**: Sponsor Dashboard (specs/004-sponsor-dashboard)

## Entities

### Sponsor Account

**Table**: `users` (role = 'sponsor')

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Auto-increment ID |
| email | TEXT | UNIQUE, NOT NULL | Login email |
| password_hash | TEXT | NOT NULL | PBKDF2 hash (100K iterations, SHA-256) |
| otp_secret | TEXT | NOT NULL | Base32-encoded TOTP secret |
| role | TEXT | NOT NULL | Must be 'sponsor' |
| supported_areas | TEXT | NOT NULL | JSON array of province/area codes |
| created_at | TEXT | NOT NULL | ISO 8601 timestamp |
| updated_at | TEXT | NOT NULL | ISO 8601 timestamp |

**Relationships**:
- One sponsor has many supported areas (via JSON array)
- One sponsor has many audit log entries

**Validation Rules**:
- Email must be valid format
- Password must be ≥8 characters
- Role must be 'sponsor'
- Supported areas must be non-empty JSON array

### Supported Area

**Derived from**: `plots` table filtered by sponsor's `supported_areas`

| Field | Source | Description |
|-------|--------|-------------|
| province | `plots.province` | Province name |
| area_code | `plots.area_code` | Area code |
| total_rai | SUM(`plots.area_rai`) | Total area in rai |
| total_hectares | SUM(`plots.area_rai`) * 0.16 | Total area in hectares |
| subplot_count | COUNT(`plots.id`) | Number of subplots |
| crop_cycle | `seasons.crop_cycle` | Crop cycle information |

**Relationships**:
- One supported area has many plots
- One supported area has many seasons
- One supported area has many farmers (via plots)

### Plot (Sponsor View)

**Table**: `plots` (filtered by sponsor's supported_areas)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Auto-increment ID |
| farmer_id | INTEGER | FOREIGN KEY → farmers.id | Owner farmer |
| plot_code | TEXT | NOT NULL | Plot code (CPA-XXX-PLOT-YYY) |
| area_rai | REAL | NOT NULL | Area in rai |
| province | TEXT | NOT NULL | Province name |
| area_code | TEXT | NOT NULL | Area code |
| created_at | TEXT | NOT NULL | ISO 8601 timestamp |

**Sponsor View Restrictions**:
- ✅ plot_code (CPA code)
- ✅ area_rai
- ✅ province, area_code
- ❌ farmer name (PII)
- ❌ deed_no (PII)
- ❌ national_id (PII)
- ❌ phone (PII)

### Carbon Estimate (Sponsor View)

**Table**: `carbon_estimates` (filtered by sponsor's supported_areas via plots)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Auto-increment ID |
| season_id | INTEGER | FOREIGN KEY → seasons.id | Source season |
| plot_id | INTEGER | FOREIGN KEY → plots.id | Source plot |
| baseline_ch4 | REAL | NOT NULL | Baseline methane emissions (tCO2e) |
| project_ch4 | REAL | NOT NULL | Project methane emissions (tCO2e) |
| sf_w | REAL | NOT NULL | Water management factor (0.55, 0.71, or 1.0) |
| net_offset | REAL | NOT NULL | Net carbon offset (tCO2e) |
| verified | INTEGER | NOT NULL | 0 (estimate) or 1 (verified) |
| created_at | TEXT | NOT NULL | ISO 8601 timestamp |

**Sponsor View**:
- Verified credits: SUM(net_offset) WHERE verified = 1
- Estimated credits: SUM(net_offset) WHERE verified = 0
- Season breakdown: GROUP BY season_id

### Season

**Table**: `seasons` (filtered by sponsor's supported_areas via plots)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Auto-increment ID |
| plot_id | INTEGER | FOREIGN KEY → plots.id | Source plot |
| sow_date | TEXT | NOT NULL | Sowing date (ISO 8601) |
| crop_cycle | INTEGER | NOT NULL | Crop cycle in days (default 120) |
| status | TEXT | NOT NULL | active, closed |
| created_at | TEXT | NOT NULL | ISO 8601 timestamp |

### Farmer (Sponsor View)

**Table**: `farmers` (filtered by sponsor's supported_areas via plots)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Auto-increment ID |
| cpa_code | TEXT | NOT NULL | CPA code (e.g., CPA-001) |

**Sponsor View Restrictions**:
- ✅ cpa_code
- ❌ full_name (PII)
- ❌ phone (PII)
- ❌ national_id (PII)
- ❌ address (PII)

## Queries

### Sponsor Dashboard Queries

```sql
-- Get sponsor's supported areas
SELECT supported_areas FROM users WHERE id = ? AND role = 'sponsor';

-- Get plots by province (area-scoped)
SELECT p.*, f.cpa_code
FROM plots p
JOIN farmers f ON p.farmer_id = f.id
WHERE p.province IN (SELECT value FROM json_each(?))
  AND p.area_code IN (SELECT value FROM json_each(?));

-- Get season credits (verified vs estimated)
SELECT
  s.id as season_id,
  SUM(CASE WHEN ce.verified = 1 THEN ce.net_offset ELSE 0 END) as verified_credits,
  SUM(CASE WHEN ce.verified = 0 THEN ce.net_offset ELSE 0 END) as estimated_credits
FROM seasons s
JOIN carbon_estimates ce ON ce.season_id = s.id
JOIN plots p ON s.plot_id = p.id
WHERE p.province IN (SELECT value FROM json_each(?))
  AND p.area_code IN (SELECT value FROM json_each(?))
GROUP BY s.id;

-- Get GHG source breakdown
SELECT
  SUM(ce.baseline_ch4 - ce.project_ch4) as methane_reduction,
  SUM(ce.baseline_n2o - ce.project_n2o) as n2o_reduction,
  SUM(ce.baseline_co2 - ce.project_co2) as co2_reduction
FROM carbon_estimates ce
JOIN plots p ON ce.plot_id = p.id
WHERE p.province IN (SELECT value FROM json_each(?))
  AND p.area_code IN (SELECT value FROM json_each(?));

-- Get household count (distinct farmers)
SELECT COUNT(DISTINCT f.id) as household_count
FROM farmers f
JOIN plots p ON f.id = p.farmer_id
WHERE p.province IN (SELECT value FROM json_each(?))
  AND p.area_code IN (SELECT value FROM json_each(?));
```

## Indexes

```sql
-- Existing indexes (from admin console)
CREATE INDEX idx_plots_farmer_id ON plots(farmer_id);
CREATE INDEX idx_plots_plot_code ON plots(plot_code);
CREATE INDEX idx_carbon_estimates_season_id ON carbon_estimates(season_id);
CREATE INDEX idx_carbon_estimates_plot_id ON carbon_estimates(plot_id);

-- Additional indexes for sponsor queries
CREATE INDEX idx_plots_province_area ON plots(province, area_code);
CREATE INDEX idx_carbon_estimates_verified ON carbon_estimates(verified);
```

## Privacy Enforcement

### Data Shape by Role

| Field | Admin | Verifier | Field | Sponsor | Auditor |
|-------|-------|----------|-------|---------|---------|
| cpa_code | ✅ | ✅ | ✅ | ✅ | ✅ |
| full_name | ✅ | ❌ | ❌ | ❌ | ❌ |
| phone | ✅ | ❌ | ❌ | ❌ | ❌ |
| national_id | ✅ | ❌ | ❌ | ❌ | ❌ |
| deed_no | ✅ | ❌ | ❌ | ❌ | ❌ |
| address | ✅ | ❌ | ❌ | ❌ | ❌ |
| plot_code | ✅ | ✅ | ✅ | ✅ | ✅ |
| area_rai | ✅ | ✅ | ✅ | ✅ | ✅ |
| province | ✅ | ✅ | ✅ | ✅ | ✅ |
| verified_credits | ✅ | ✅ | ✅ | ✅ | ✅ |
| estimated_credits | ✅ | ✅ | ✅ | ✅ | ✅ |

### Area Scoping

Sponsors can only access data where:
```sql
plots.province IN (sponsor.supported_areas.provinces)
AND plots.area_code IN (sponsor.supported_areas.area_codes)
```

## Conclusion

The data model supports all Sponsor Dashboard requirements with existing tables and relationships. No schema changes required. Privacy enforcement is implemented at the route layer with CPA-code-only data shapes and area-scoped queries.
