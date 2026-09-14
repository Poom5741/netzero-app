# Data Model: LINE OA Chatbot

**Feature**: 001-line-oa-chatbot
**Date**: 2026-09-14
**Status**: Complete (feature already implemented)

## Core Entities

### Farmer

**Purpose**: Represents a registered farmer in the NetZeroCarbon program.

**Fields**:
- `id` (TEXT, PK): Unique farmer identifier
- `full_name` (TEXT, NOT NULL): Farmer's full name
- `gender` (TEXT): male | female | unspecified
- `phone` (TEXT, UNIQUE, NOT NULL): Phone number (identity)
- `addr_province` (TEXT): Province
- `addr_district` (TEXT): District
- `addr_subdistrict` (TEXT): Sub-district
- `addr_village` (TEXT): Village
- `national_id_enc` (TEXT): Encrypted national ID
- `group_id` (TEXT): Farmer group identifier
- `created_at` (TEXT): Creation timestamp
- `updated_at` (TEXT): Last update timestamp

**Relationships**:
- One farmer → many plots (1:N)
- One farmer → many line_links (1:N)

**Validation Rules**:
- Phone must be unique (enforced by UNIQUE constraint)
- Gender must be one of: male, female, unspecified
- Phone format: 10-digit Thai number (validated in application layer)

---

### Plot

**Purpose**: Represents a farm plot (field) owned or managed by a farmer.

**Fields**:
- `id` (TEXT, PK): Unique plot identifier
- `farmer_id` (TEXT, FK → farmers.id, NOT NULL): Owner farmer
- `plot_code` (TEXT, UNIQUE, NOT NULL): Human-readable code (e.g., SPB-0142)
- `deed_no` (TEXT, NOT NULL): Land deed number
- `doc_type` (TEXT): chanote | ns3k | spk | rental
- `tenure` (TEXT): owner | tenant | proxy
- `area_rai` (REAL, NOT NULL): Area in rai (1 rai = 1600 m²)
- `centroid_lat` (REAL): GPS latitude
- `centroid_lng` (REAL): GPS longitude
- `created_at` (TEXT): Creation timestamp
- `updated_at` (TEXT): Last update timestamp

**Relationships**:
- Many plots → one farmer (N:1)
- One plot → many photo_evidence (1:N)
- One plot → many season_inputs (1:N)
- One plot → many fertilizer_entries (1:N)

**Validation Rules**:
- Plot code must be unique
- Area must be positive
- Doc type must be one of: chanote, ns3k, spk, rental
- Tenure must be one of: owner, tenant, proxy

---

### LineLink

**Purpose**: Tracks the relationship between a farmer and their LINE user account.

**Fields**:
- `id` (TEXT, PK): Unique identifier
- `farmer_id` (TEXT, FK → farmers.id, NOT NULL): Linked farmer
- `line_user_id` (TEXT, UNIQUE, NOT NULL): LINE user ID
- `status` (TEXT): pending | verified | rejected
- `conversation_state` (TEXT): Current state in conversation flow (default: 'welcome')
- `selected_plot_id` (TEXT): Currently selected plot for operations
- `verified_by` (TEXT): Staff member who verified
- `created_at` (TEXT): Creation timestamp
- `updated_at` (TEXT): Last update timestamp

**Relationships**:
- Many line_links → one farmer (N:1)

**Validation Rules**:
- LINE user ID must be unique (one LINE account per farmer)
- Status must be one of: pending, verified, rejected
- Conversation state tracks position in state machine (welcome, consent, phone, identity_confirm, conditions, registration, documents, pending_review, activation, season_setup, calendar, photo_report, results)

---

### PhotoEvidence

**Purpose**: Stores photo evidence for carbon credit verification (4 rounds per season).

**Fields**:
- `id` (TEXT, PK): Unique photo identifier
- `plot_id` (TEXT, FK → plots.id, NOT NULL): Associated plot
- `season_id` (TEXT, NOT NULL): Season identifier (e.g., "2568-napi")
- `photo_url` (TEXT, NOT NULL): R2 storage URL
- `gps_lat` (REAL, NOT NULL): GPS latitude
- `gps_lng` (REAL, NOT NULL): GPS longitude
- `gps_accuracy` (REAL): GPS accuracy in meters
- `taken_at` (TEXT, NOT NULL): Photo capture timestamp
- `ai_status` (TEXT): pending | pass | flag | reject
- `ai_label` (TEXT): AI classification label
- `ai_reason` (TEXT): AI reasoning
- `ai_confidence` (REAL): AI confidence score (0-1)
- `admin_status` (TEXT): pending | verified | rejected
- `admin_reason` (TEXT): Staff review reason
- `created_at` (TEXT): Creation timestamp

**Relationships**:
- Many photo_evidence → one plot (N:1)

**Validation Rules**:
- GPS coordinates required (NOT NULL)
- AI status must be one of: pending, pass, flag, reject
- Admin status must be one of: pending, verified, rejected
- Photo URL must be valid R2 path

**Business Logic**:
- 4 photos per season per plot (WET-1, DRY-1, WET-2, DRY-2)
- SF_w calculation: 4 verified → 0.55, 1-3 verified → 0.71, 0 verified → 1.0

---

### SeasonInputs

**Purpose**: Captures seasonal input data for carbon calculation (sowing date, water management, fertilizer, etc.).

**Fields**:
- `id` (TEXT, PK): Unique identifier
- `plot_id` (TEXT, FK → plots.id, NOT NULL): Associated plot
- `season_id` (TEXT, NOT NULL): Season identifier
- `rice_variety` (TEXT): Rice variety name
- `sow_date` (TEXT): Sowing date (DD/MM/YYYY)
- `water_pre_plant` (TEXT): Pre-planting water management
- `water_management` (TEXT): Water management method (e.g., AWD)
- `organic_material` (TEXT): Organic material type
- `organic_rate_kg_per_rai` (REAL): Application rate
- `lime_kg_per_rai` (REAL): Lime application
- `dolomite_kg_per_rai` (REAL): Dolomite application
- `fuel_liters_per_rai` (REAL): Fuel consumption
- `fuel_type` (TEXT): Fuel type
- `electricity_kwh_per_rai` (REAL): Electricity consumption
- `straw_management` (TEXT): Straw management method

**Relationships**:
- Many season_inputs → one plot (N:1)

**Validation Rules**:
- Season ID format: "YEAR-name" (e.g., "2568-napi")
- Sow date format: DD/MM/YYYY
- Application rates must be non-negative

---

### FertilizerEntry

**Purpose**: Tracks fertilizer applications for nitrogen calculation.

**Fields**:
- `id` (TEXT, PK): Unique identifier
- `plot_id` (TEXT, FK → plots.id, NOT NULL): Associated plot
- `season_id` (TEXT, NOT NULL): Season identifier
- `step` (TEXT): base | tillering | panicle
- `formula` (TEXT, NOT NULL): Fertilizer formula (e.g., "46-0-0")
- `rate_kg_per_rai` (REAL, NOT NULL): Application rate
- `percent_n` (REAL): Nitrogen percentage
- `nitrogen_kg_per_rai` (REAL): Calculated nitrogen
- `is_urea` (INTEGER): Urea flag (0 or 1)
- `custom_formula` (TEXT): Custom formula description
- `confirmed` (INTEGER): Confirmation flag (0 or 1)
- `created_at` (TEXT): Creation timestamp

**Relationships**:
- Many fertilizer_entries → one plot (N:1)

**Validation Rules**:
- Step must be one of: base, tillering, panicle
- Rate must be positive
- Nitrogen calculated: rate × (percent_n / 100)

---

## State Transitions

### Conversation State Machine

```
welcome → consent → phone → identity_confirm → conditions → registration → documents → pending_review → activation → season_setup → calendar → photo_report → results
```

**Transitions**:
- Each state transition triggered by user action (button click, form submission)
- State stored in `line_links.conversation_state`
- Backward navigation allowed (rich menu)
- No forward skipping (must complete consent before phone, etc.)

### Photo Evidence Lifecycle

```
pending (AI) → pass | flag | reject (AI) → pending (Admin) → verified | rejected (Admin)
```

**Transitions**:
- AI verification: automatic after upload
- Admin verification: manual review by staff
- Final status: verified or rejected
- Only verified photos count toward SF_w calculation

---

## Indexes

**Performance-critical indexes**:
- `farmers.phone` (UNIQUE): Phone lookup for identity verification
- `plots.plot_code` (UNIQUE): Plot code lookup
- `line_links.line_user_id` (UNIQUE): LINE user lookup
- `photo_evidence.plot_id + season_id`: Photo query for SF_w calculation
- `season_inputs.plot_id + season_id`: Season data query

---

## Constraints

**Foreign Keys**:
- All relationships use TEXT IDs (UUIDs)
- CASCADE delete not used (preserve audit trail)
- Orphan records prevented by application logic

**Data Integrity**:
- Phone uniqueness enforced at database level
- Plot code uniqueness enforced at database level
- LINE user ID uniqueness enforced at database level
- GPS coordinates required for photo evidence

**Concurrency**:
- D1 SQLite concurrent write limitation: use mutex/batch transactions
- Farmer trust score updates batched after photo verification
- Session tokens stored in KV (not D1) to avoid write conflicts
