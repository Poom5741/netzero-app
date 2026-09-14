# Data Model: Admin Console

**Date**: 2026-09-14
**Feature**: Admin Console (specs/003-admin-console)

## Entities

### Privileged User

**Table**: `users`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Auto-increment ID |
| email | TEXT | UNIQUE, NOT NULL | Login email |
| password_hash | TEXT | NOT NULL | PBKDF2 hash (100K iterations, SHA-256) |
| otp_secret | TEXT | NOT NULL | Base32-encoded TOTP secret |
| role | TEXT | NOT NULL | admin, verifier, field, sponsor, or auditor |
| supported_areas | TEXT | NULLABLE | JSON array of province/area codes (sponsor only) |
| created_at | TEXT | NOT NULL | ISO 8601 timestamp |
| updated_at | TEXT | NOT NULL | ISO 8601 timestamp |

**Relationships**:
- One user has many audit log entries
- Sponsor users have many supported areas

**Validation Rules**:
- Email must be valid format
- Password must be ≥8 characters
- Role must be one of the five defined roles
- Supported areas required for sponsor role

### Farmer Record

**Table**: `farmers`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Auto-increment ID |
| cpa_code | TEXT | UNIQUE, NOT NULL | CPA code (e.g., CPA-001) |
| full_name | TEXT | NOT NULL | Farmer name (restricted to authorized admin) |
| phone | TEXT | UNIQUE, NOT NULL | Phone number (identity) |
| national_id | TEXT | NULLABLE | National ID (restricted to authorized admin) |
| province | TEXT | NOT NULL | Province name |
| district | TEXT | NOT NULL | District name |
| address | TEXT | NOT NULL | Full address |
| created_at | TEXT | NOT NULL | ISO 8601 timestamp |

**Relationships**:
- One farmer has many plots
- One farmer has many line_links
- One farmer has many photo_evidence records

**Validation Rules**:
- CPA code must be unique
- Phone must be 10 digits starting with 0
- Province and district must match known values

### Plot

**Table**: `plots`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Auto-increment ID |
| farmer_id | INTEGER | FOREIGN KEY → farmers.id | Owner farmer |
| plot_code | TEXT | UNIQUE, NOT NULL | Plot code (e.g., PLOT-001) |
| area_rai | REAL | NOT NULL | Area in rai |
| deed_no | TEXT | NULLABLE | Land deed number |
| holding_status | TEXT | NOT NULL | owner, co-owner, tenant, or authorized-representative |
| rice_variety | TEXT | NULLABLE | Rice variety grown |
| centroid_lat | REAL | NULLABLE | Centroid latitude |
| centroid_lng | REAL | NULLABLE | Centroid longitude |
| created_at | TEXT | NOT NULL | ISO 8601 timestamp |

**Relationships**:
- One plot belongs to one farmer
- One plot has many seasons
- One plot has many photo_evidence records

**Validation Rules**:
- Plot code must be unique
- Area must be > 0
- Holding status must be one of four values

### Application

**Table**: `line_links`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Auto-increment ID |
| farmer_id | INTEGER | FOREIGN KEY → farmers.id | Applicant farmer |
| line_user_id | TEXT | UNIQUE, NOT NULL | LINE user ID |
| status | TEXT | NOT NULL | pending, approved, rejected, or hold |
| doc_count | INTEGER | NOT NULL | Number of documents submitted |
| holding_type | TEXT | NOT NULL | owner, co-owner, tenant, or authorized-representative |
| age_days | INTEGER | NOT NULL | Days since submission |
| reviewer_id | INTEGER | FOREIGN KEY → users.id, NULLABLE | Reviewer user |
| review_reason | TEXT | NULLABLE | Reason for rejection or hold |
| reviewed_at | TEXT | NULLABLE | ISO 8601 timestamp |
| created_at | TEXT | NOT NULL | ISO 8601 timestamp |

**Relationships**:
- One application belongs to one farmer
- One application belongs to one LINE user
- One application has many application_documents

**Validation Rules**:
- Status must be one of four values
- Doc count must be ≥ 0
- Holding type must be one of four values

### Application Document

**Table**: `application_documents`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Auto-increment ID |
| application_id | INTEGER | FOREIGN KEY → line_links.id | Parent application |
| doc_type | TEXT | NOT NULL | DOC-01 (land deed), DOC-03 (ID card), or DOC-06 (power of attorney) |
| status | TEXT | NOT NULL | required, received, missing, or invalid |
| file_url | TEXT | NULLABLE | R2 URL for uploaded document |
| created_at | TEXT | NOT NULL | ISO 8601 timestamp |

**Relationships**:
- One document belongs to one application

**Validation Rules**:
- Doc type must be one of three values
- Status must be one of four values
- File URL required when status is received

### Photo Evidence

**Table**: `photo_evidence`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Auto-increment ID |
| plot_id | INTEGER | FOREIGN KEY → plots.id | Source plot |
| season_id | INTEGER | FOREIGN KEY → seasons.id | Source season |
| photo_type | TEXT | NOT NULL | WET-1, DRY-1, WET-2, or DRY-2 |
| file_url | TEXT | NOT NULL | R2 URL for uploaded photo |
| gps_lat | REAL | NULLABLE | GPS latitude |
| gps_lng | REAL | NULLABLE | GPS longitude |
| captured_at | TEXT | NULLABLE | ISO 8601 timestamp from EXIF |
| water_level_cm | INTEGER | NULLABLE | Water level in cm |
| ai_status | TEXT | NULLABLE | pass, flag, reject, or queue_for_admin |
| ai_confidence | REAL | NULLABLE | AI confidence score (0-1) |
| ai_reason | TEXT | NULLABLE | AI decision reason |
| admin_status | TEXT | NULLABLE | approved, rejected, or retake |
| admin_reason | TEXT | NULLABLE | Admin decision reason |
| reviewer_id | INTEGER | FOREIGN KEY → users.id, NULLABLE | Reviewer user |
| reviewed_at | TEXT | NULLABLE | ISO 8601 timestamp |
| created_at | TEXT | NOT NULL | ISO 8601 timestamp |

**Relationships**:
- One photo belongs to one plot
- One photo belongs to one season
- One photo has one reviewer (optional)

**Validation Rules**:
- Photo type must be one of four values
- AI status must be one of four values
- Admin status must be one of three values
- GPS and timestamp required for valid evidence

### Carbon Estimate

**Table**: `carbon_estimates`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Auto-increment ID |
| season_id | INTEGER | FOREIGN KEY → seasons.id | Source season |
| baseline_ch4 | REAL | NOT NULL | Baseline methane emissions (tCO2e) |
| project_ch4 | REAL | NOT NULL | Project methane emissions (tCO2e) |
| baseline_n2o | REAL | NOT NULL | Baseline N2O emissions (tCO2e) |
| project_n2o | REAL | NOT NULL | Project N2O emissions (tCO2e) |
| baseline_co2 | REAL | NOT NULL | Baseline CO2 emissions (tCO2e) |
| project_co2 | REAL | NOT NULL | Project CO2 emissions (tCO2e) |
| sf_w | REAL | NOT NULL | Water management factor (0.55, 0.71, or 1.0) |
| uncertainty_deduction | REAL | NOT NULL | Uncertainty deduction (tCO2e) |
| net_offset | REAL | NOT NULL | Net carbon offset (tCO2e) |
| verified | INTEGER | NOT NULL | 0 (estimate) or 1 (verified) |
| inputs_json | TEXT | NOT NULL | JSON of all calculation inputs |
| created_at | TEXT | NOT NULL | ISO 8601 timestamp |

**Relationships**:
- One estimate belongs to one season

**Validation Rules**:
- All emission values must be ≥ 0
- SF_w must be 0.55, 0.71, or 1.0
- Net offset must be ≥ 0
- Inputs JSON must be valid

### Audit Event

**Table**: `automation_audit_log`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Auto-increment ID |
| actor_type | TEXT | NOT NULL | machine or admin |
| actor_id | INTEGER | NULLABLE | User ID (admin only) |
| action | TEXT | NOT NULL | Action description (e.g., "approve_photo", "reject_application") |
| target_type | TEXT | NOT NULL | Target entity type (e.g., "photo_evidence", "application") |
| target_id | INTEGER | NOT NULL | Target entity ID |
| previous_value | TEXT | NULLABLE | JSON of previous state |
| new_value | TEXT | NULLABLE | JSON of new state |
| confidence | REAL | NULLABLE | AI confidence (machine only) |
| reason | TEXT | NULLABLE | Decision reason |
| created_at | TEXT | NOT NULL | ISO 8601 timestamp |

**Relationships**:
- One audit event has one actor (user or machine)
- One audit event has one target entity

**Validation Rules**:
- Actor type must be machine or admin
- Actor ID required for admin actions
- Action must be non-empty
- Target type and ID required

## State Transitions

### Application Status

```
pending → approved (admin approves)
pending → rejected (admin rejects with reason)
pending → hold (admin holds with reason)
hold → approved (admin approves after resolution)
hold → rejected (admin rejects after resolution)
```

### Photo Evidence Status

```
(null) → ai_status: pass/flag/reject/queue_for_admin (AI pre-verification)
ai_status → admin_status: approved/rejected/retake (admin review)
admin_status: rejected → admin_status: approved (admin overrides after retake)
```

## Indexes

```sql
CREATE INDEX idx_farmers_cpa_code ON farmers(cpa_code);
CREATE INDEX idx_farmers_phone ON farmers(phone);
CREATE INDEX idx_plots_farmer_id ON plots(farmer_id);
CREATE INDEX idx_plots_plot_code ON plots(plot_code);
CREATE INDEX idx_line_links_farmer_id ON line_links(farmer_id);
CREATE INDEX idx_line_links_status ON line_links(status);
CREATE INDEX idx_photo_evidence_plot_id ON photo_evidence(plot_id);
CREATE INDEX idx_photo_evidence_season_id ON photo_evidence(season_id);
CREATE INDEX idx_photo_evidence_admin_status ON photo_evidence(admin_status);
CREATE INDEX idx_carbon_estimates_season_id ON carbon_estimates(season_id);
CREATE INDEX idx_automation_audit_log_target ON automation_audit_log(target_type, target_id);
CREATE INDEX idx_automation_audit_log_actor ON automation_audit_log(actor_type, actor_id);
```

## Conclusion

The data model supports all Admin Console requirements with existing tables and relationships. No schema changes required. All validation rules are enforced at the application layer.
