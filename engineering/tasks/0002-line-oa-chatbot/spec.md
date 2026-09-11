# LINE OA Chatbot — Full Farmer Flow (43 Steps)

## Objective

Implement the complete LINE OA chatbot flow for Thai rice farmers, covering registration, seasonal photo reporting, and carbon credit results — as defined in the design system artifact (43 steps across 3 flows + 9 LIFF pages).

## Build ambition

Full / production — all edge cases, rejection flows, backfill, dashboard tabs.

## Success criteria

1. **Registration flow (OB-01 → OB-11):** A new farmer can add the LINE friend, consent to PDPA, share phone number, have identity matched against staff registry, fill the LIFF registration form (personal + plot + deed data), upload 3 required documents, and receive account activation with a farmer code.
2. **Photo reporting flow (PJ-00 → PJ-13):** An activated farmer can see a 9-step calendar based on their sowing date, submit 4 photos per crop cycle (WET-1, DRY-1, WET-2, DRY-2) via LIFF camera with auto GPS+timestamp, enter water depth for DRY rounds, see confirmation screens, receive staff approval/rejection with reasons, and retake rejected photos.
3. **Results flow (RP-01 → RP-04):** A farmer can view their dashboard showing carbon credit estimate (tCO₂eq), photo progress (X/4), backfill status, and pending tasks. The carbon estimate uses the full calculation engine (CH4 + N2O + CO2 + burning) with correct SF_w factor based on photo completeness.
4. **Water management factor (SF_w):** When all 4 photos are submitted and approved, SF_w = 0.55. When incomplete, SF_w auto-downgrades to 0.71. The factor is computed from actual photo data, not hardcoded.
5. **Chat photo rejection:** Photos sent via LINE chat (not LIFF camera) are rejected with SY-03 error, explaining that LINE strips EXIF data.
6. **Staff review:** Each photo enters a review queue. Staff can approve or reject with a reason. Rejection shows the farmer what was wrong and gives a retake deadline.
7. **Backfill:** Farmers can enter historical season data (up to 3 years) for plots that joined mid-season.

## Scope

### In scope
- LINE webhook handler for friend addition, phone sharing, consent
- LIFF registration form (LF-01) — personal data + plot + deed
- LIFF document upload — 3 required documents per plot
- LIFF camera page (LF-04) — photo capture with GPS + timestamp
- LIFF calendar page — 9-step season calendar
- LIFF dashboard — carbon credits, photo progress, tasks
- Season management API — create season, set sow_date, compute phase windows
- Photo upload enhancement — water depth input for DRY rounds
- Carbon estimation trigger — call runEstimation() on season approval
- SF_w dynamic computation — based on photo completeness
- Chat flow state machine — 43 steps with guards and transitions
- Staff review workflow — approve/reject with reasons and retake deadlines
- Backfill flow — historical season data entry
- Trust score integration — auto-verify threshold, rejection impact

### Not doing (explicitly excluded)
- LINE rich menu (deferred — using chat quick actions)
- Real-time LINE push notifications (deferred — queue digest computed but not sent)
- Multi-language support (Thai only for pilot)
- Payment/financial transactions
- Mobile native app (LIFF only)
- Batch/csv import of farmer data
- Advanced analytics dashboard (sponsor dashboard already exists)
- LINE login integration (using phone number matching instead)

## Data model & contracts

### New/modified tables

**consent_log** (new):
```sql
CREATE TABLE consent_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  farmer_id TEXT NOT NULL REFERENCES farmers(id),
  consent_type TEXT NOT NULL, -- 'pdpa', 'data_collection', 'photo_sharing', 'carbon_project'
  accepted INTEGER NOT NULL DEFAULT 0,
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_consent_log_farmer ON consent_log(farmer_id);
```

**season_steps** (new):
```sql
CREATE TABLE season_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  season_input_id INTEGER NOT NULL REFERENCES season_inputs(id),
  step_code TEXT NOT NULL, -- 'SG-01' through 'SG-09'
  step_name TEXT NOT NULL,
  due_day INTEGER NOT NULL, -- days after sow_date
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'overdue'
  photo_evidence_id INTEGER REFERENCES photo_evidence(id),
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_season_steps_input ON season_steps(season_input_id);
```

### Modified tables

**photo_evidence** — add column:
```sql
ALTER TABLE photo_evidence ADD COLUMN water_depth_cm INTEGER; -- NULL for WET rounds, integer for DRY
```

**season_inputs** — add columns:
```sql
ALTER TABLE season_inputs ADD COLUMN rice_age_days INTEGER DEFAULT 120;
ALTER TABLE season_inputs ADD COLUMN sf_w_factor REAL; -- computed from photo completeness
```

### API contracts

**POST /api/season/create** — Create a new season for a plot
```
Request: { plot_id, sow_date, rice_variety }
Response: { season_input_id, steps: [{ step_code, step_name, due_date }] }
```

**POST /api/photo/upload** — Enhanced with water_depth
```
Request: FormData { photo, plot_id, season_id, photo_type, gps_lat, gps_lng, water_depth_cm? }
Response: { verdict: 'accepted'|'rejected'|'flagged', reason?, deadline? }
```

**POST /api/consent** — Record PDPA consent
```
Request: { farmer_id, consents: { pdpa, data_collection, photo_sharing, carbon_project } }
Response: { success, all_accepted }
```

**GET /api/carbon-estimate/:plotId/:seasonId** — Get carbon credit estimate
```
Response: { total_offset_tco2e, sf_w, sf_p, sf_o, breakdown: { ch4, n2o, co2, burning } }
```

**GET /api/season-steps/:seasonInputId** — Get calendar steps
```
Response: { steps: [{ step_code, step_name, due_date, status, photo_url? }] }
```

**POST /api/season-steps/:stepId/complete** — Mark step as done
```
Request: { photo_evidence_id? }
Response: { success, next_step? }
```

## Constraints & assumptions

- LIFF_ID `2011183008-7bEomfVF` is already configured
- D1 database is used (SQLite constraints apply)
- R2 bucket for photo storage already exists
- OpenRouter API key is available for AI features
- Rice variety age defaults to 120 days (configurable per variety)
- Sowing date is day 0 for all step calculations
- GPS accuracy threshold is 50m (existing)
- Photo types: prepare, wetdry, harvest (existing) — wetdry covers WET-1/DRY-1/WET-2/DRY-2
- Staff review is manual (no auto-approve for production)
- LINE webhook is disabled — all interaction via LIFF standalone chat

## Risks & open questions

1. **EXIF extraction is a no-op** — need to implement real EXIF parsing or rely on client-side timestamp. Risk: temporal validation can't verify photo timing server-side.
2. **LINE webhook disabled** — the chat flow runs in LIFF standalone mode. If LINE integration is needed later, the webhook handler needs re-enabling.
3. **No farmer CRUD** — farmers are currently seed-only. The registration flow needs routes to create farmers, plots, and season records.
4. **Carbon estimation never called** — need to wire runEstimation() into the season approval flow.
5. **water_management → SF_w mapping** — the design system defines SF_w based on photo completeness (0.55 vs 0.71), but the codebase has SF_w as a constant. Need to compute dynamically.
6. **Backfill scope** — "ข้อมูลย้อนหลัง 3 ปี" means 3 years of historical data. Need to define what data is required for backfill vs what's optional.
