-- NetZeroCarbon D1 Schema Migration
-- Version: 001
-- Date: 2026-08-19

-- Farmers table
CREATE TABLE IF NOT EXISTS farmers (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  gender TEXT CHECK(gender IN ('male', 'female', 'unspecified')),
  phone TEXT UNIQUE NOT NULL,
  addr_province TEXT,
  addr_district TEXT,
  addr_subdistrict TEXT,
  addr_village TEXT,
  national_id_enc TEXT,
  group_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Plots table
CREATE TABLE IF NOT EXISTS plots (
  id TEXT PRIMARY KEY,
  farmer_id TEXT NOT NULL REFERENCES farmers(id),
  plot_code TEXT UNIQUE NOT NULL,
  deed_no TEXT NOT NULL,
  doc_type TEXT CHECK(doc_type IN ('chanote', 'ns3k', 'spk', 'rental')),
  tenure TEXT CHECK(tenure IN ('owner', 'tenant', 'proxy')),
  area_rai REAL NOT NULL,
  centroid_lat REAL,
  centroid_lng REAL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- LINE links table
CREATE TABLE IF NOT EXISTS line_links (
  id TEXT PRIMARY KEY,
  farmer_id TEXT NOT NULL REFERENCES farmers(id),
  line_user_id TEXT UNIQUE NOT NULL,
  status TEXT CHECK(status IN ('pending', 'verified', 'rejected')),
  conversation_state TEXT DEFAULT 'welcome',
  selected_plot_id TEXT,
  verified_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Photo evidence table
CREATE TABLE IF NOT EXISTS photo_evidence (
  id TEXT PRIMARY KEY,
  plot_id TEXT NOT NULL REFERENCES plots(id),
  season_id TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  gps_lat REAL NOT NULL,
  gps_lng REAL NOT NULL,
  gps_accuracy REAL,
  taken_at TEXT NOT NULL,
  ai_status TEXT CHECK(ai_status IN ('pending', 'pass', 'flag', 'reject')),
  ai_label TEXT,
  ai_reason TEXT,
  ai_confidence REAL,
  admin_status TEXT CHECK(admin_status IN ('pending', 'verified', 'rejected')),
  admin_reason TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Fertilizer entries table
CREATE TABLE IF NOT EXISTS fertilizer_entries (
  id TEXT PRIMARY KEY,
  plot_id TEXT NOT NULL REFERENCES plots(id),
  season_id TEXT NOT NULL,
  step TEXT CHECK(step IN ('base', 'tillering', 'panicle')),
  formula TEXT NOT NULL,
  rate_kg_per_rai REAL NOT NULL,
  percent_n REAL,
  nitrogen_kg_per_rai REAL,
  is_urea INTEGER DEFAULT 0,
  custom_formula TEXT,
  confirmed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Season inputs table
CREATE TABLE IF NOT EXISTS season_inputs (
  id TEXT PRIMARY KEY,
  plot_id TEXT NOT NULL REFERENCES plots(id),
  season_id TEXT NOT NULL,
  rice_variety TEXT,
  sow_date TEXT,
  water_pre_plant TEXT,
  water_management TEXT,
  organic_material TEXT,
  organic_rate_kg_per_rai REAL,
  lime_kg_per_rai REAL,
  dolomite_kg_per_rai REAL,
  fuel_liters_per_rai REAL,
  fuel_type TEXT,
  electricity_kwh_per_rai REAL,
  straw_management TEXT,
  yield_kg_per_rai REAL,
  harvest_fuel_liters REAL,
  harvest_electricity_kwh REAL,
  status TEXT CHECK(status IN ('draft', 'open', 'closed', 'approved')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Farmer messages table (audit trail)
CREATE TABLE IF NOT EXISTS farmer_messages (
  id TEXT PRIMARY KEY,
  farmer_id TEXT NOT NULL REFERENCES farmers(id),
  plot_id TEXT REFERENCES plots(id),
  raw_text TEXT NOT NULL,
  draft_json TEXT,
  confirmed INTEGER DEFAULT 0,
  message_type TEXT CHECK(message_type IN ('chat', 'input', 'confirmation')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- Carbon estimates table
CREATE TABLE IF NOT EXISTS carbon_estimates (
  id TEXT PRIMARY KEY,
  plot_id TEXT NOT NULL REFERENCES plots(id),
  season_id TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  status TEXT CHECK(status IN ('draft', 'superseded', 'final')),
  baseline_ch4 REAL,
  project_ch4 REAL,
  baseline_n2o REAL,
  project_n2o REAL,
  baseline_co2 REAL,
  project_co2 REAL,
  burning_emissions REAL,
  total_offset_tco2e REAL,
  sf_w REAL,
  sf_p REAL,
  sf_o REAL,
  nitrogen_total_kg_per_rai REAL,
  override_reason TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- AI events table (quota tracking)
CREATE TABLE IF NOT EXISTS ai_events (
  id TEXT PRIMARY KEY,
  farmer_id TEXT NOT NULL REFERENCES farmers(id),
  event_type TEXT CHECK(event_type IN ('chat', 'vision', 'draft')),
  model_version TEXT,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  cost_usd REAL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Users table (admin/sponsor)
-- H4 note: CHECK constraint only allows ('admin', 'sponsor').
-- D1/SQLite cannot ALTER CHECK constraints. Additional roles (field_agent,
-- auditor, researcher) must be added by recreating the table in a future
-- migration. The middleware already supports multi-role via string[].
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin', 'sponsor')),
  name TEXT,
  otp_secret TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_plots_farmer ON plots(farmer_id);
CREATE INDEX IF NOT EXISTS idx_line_links_farmer ON line_links(farmer_id);
CREATE INDEX IF NOT EXISTS idx_line_links_status ON line_links(status);
CREATE INDEX IF NOT EXISTS idx_photo_evidence_plot ON photo_evidence(plot_id);
CREATE INDEX IF NOT EXISTS idx_fertilizer_entries_plot ON fertilizer_entries(plot_id);
CREATE INDEX IF NOT EXISTS idx_season_inputs_plot ON season_inputs(plot_id);
CREATE INDEX IF NOT EXISTS idx_farmer_messages_farmer ON farmer_messages(farmer_id);
CREATE INDEX IF NOT EXISTS idx_carbon_estimates_plot ON carbon_estimates(plot_id);
CREATE INDEX IF NOT EXISTS idx_ai_events_farmer ON ai_events(farmer_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Issue #103: Pre-Verification stamp + audit sampling columns
ALTER TABLE photo_evidence ADD COLUMN photo_type TEXT CHECK(photo_type IN ('prepare', 'wetdry', 'harvest'));
ALTER TABLE photo_evidence ADD COLUMN water_state TEXT;
ALTER TABLE photo_evidence ADD COLUMN pre_verified INTEGER DEFAULT 0;
ALTER TABLE photo_evidence ADD COLUMN audit_sample INTEGER DEFAULT 0;
ALTER TABLE photo_evidence ADD COLUMN superseded INTEGER DEFAULT 0;

-- Automation audit log (ADR-0001 traceability)
-- C2 fix: photo_evidence_id is nullable — non-photo audit entries (admin actions)
-- insert NULL here rather than a bogus FK value.
CREATE TABLE IF NOT EXISTS automation_audit_log (
  id TEXT PRIMARY KEY,
  photo_evidence_id TEXT REFERENCES photo_evidence(id),
  actor_type TEXT CHECK(actor_type IN ('machine', 'admin')) NOT NULL,
  action TEXT NOT NULL,
  confidence REAL,
  reason TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_automation_audit_log_photo ON automation_audit_log(photo_evidence_id);

-- Seasons table (per-plot season definitions)
CREATE TABLE IF NOT EXISTS seasons (
  id TEXT PRIMARY KEY,
  plot_id TEXT NOT NULL REFERENCES plots(id),
  name TEXT NOT NULL,
  status TEXT CHECK(status IN ('active', 'closed', 'planned')) DEFAULT 'planned',
  start_date TEXT,
  end_date TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_seasons_plot ON seasons(plot_id);

-- Consent log (PDPA audit trail)
CREATE TABLE IF NOT EXISTS consent_log (
  id TEXT PRIMARY KEY,
  farmer_id TEXT NOT NULL REFERENCES farmers(id),
  consent_type TEXT NOT NULL CHECK(consent_type IN ('pdpa', 'data_collection', 'photo_sharing', 'carbon_project')),
  accepted INTEGER NOT NULL DEFAULT 0,
  ip_address TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_consent_log_farmer ON consent_log(farmer_id);

-- Season steps (9-step calendar per crop)
CREATE TABLE IF NOT EXISTS season_steps (
  id TEXT PRIMARY KEY,
  season_input_id TEXT NOT NULL REFERENCES season_inputs(id),
  step_code TEXT NOT NULL,
  step_name TEXT NOT NULL,
  due_day INTEGER NOT NULL,
  due_date TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'overdue')),
  photo_evidence_id TEXT REFERENCES photo_evidence(id),
  completed_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_season_steps_input ON season_steps(season_input_id);

-- Issue #LINE-OA: Water depth for DRY photo rounds
ALTER TABLE photo_evidence ADD COLUMN water_depth_cm INTEGER;
-- Preserve the calendar round selected by the farmer for approval linkage.
ALTER TABLE photo_evidence ADD COLUMN step_code TEXT;

-- Issue #LINE-OA: Rice age and dynamic SF_w factor
ALTER TABLE season_inputs ADD COLUMN rice_age_days INTEGER DEFAULT 120;
ALTER TABLE season_inputs ADD COLUMN sf_w_factor REAL;

-- Farmer trust scores (issue #120) — table was referenced in code but never
-- created, causing every admin review action to 500 in production.
CREATE TABLE IF NOT EXISTS farmer_trust (
  farmer_id TEXT PRIMARY KEY,
  trust_score REAL NOT NULL DEFAULT 0.5,
  total_photos INTEGER NOT NULL DEFAULT 0,
  verified_count INTEGER NOT NULL DEFAULT 0,
  rejected_count INTEGER NOT NULL DEFAULT 0
);

-- Issue #0003: Application documents (OB-13 document upload)
CREATE TABLE IF NOT EXISTS application_documents (
  id TEXT PRIMARY KEY,
  farmer_id TEXT NOT NULL REFERENCES farmers(id),
  doc_type TEXT NOT NULL CHECK(doc_type IN ('DOC-01', 'DOC-03', 'DOC-06', 'DOC-07')),
  r2_key TEXT NOT NULL,
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed_at TEXT,
  review_status TEXT DEFAULT 'pending' CHECK(review_status IN ('pending', 'approved', 'rejected')),
  UNIQUE(farmer_id, doc_type)
);

CREATE INDEX IF NOT EXISTS idx_application_documents_farmer ON application_documents(farmer_id);

-- Issue #0003: Sponsor area scoping on users table
ALTER TABLE users ADD COLUMN sponsor_id TEXT;
ALTER TABLE users ADD COLUMN areas TEXT; -- JSON array of province names, e.g. '["สุพรรณบุรี"]'

-- Issue #0003: Generalize audit log (was photo-only, now covers all admin actions)
-- Add new columns; existing photo_evidence_id column stays for backward compatibility
ALTER TABLE automation_audit_log ADD COLUMN entity_type TEXT; -- 'photo_evidence', 'farmer', 'plot', 'season', 'user', 'setting'
ALTER TABLE automation_audit_log ADD COLUMN entity_id TEXT;
ALTER TABLE automation_audit_log ADD COLUMN field_name TEXT;
ALTER TABLE automation_audit_log ADD COLUMN old_value TEXT;
ALTER TABLE automation_audit_log ADD COLUMN new_value TEXT;

-- Issue #0003: CPA code on farmers table (auto-generated on application approval)
-- BUG-008-B2: SQLite rejects UNIQUE in ADD COLUMN; enforce via a unique index
-- (unique indexes allow multiple NULLs, matching the previous intent).
ALTER TABLE farmers ADD COLUMN cpa_code TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_farmers_cpa_code ON farmers(cpa_code);

-- Task 02: OTP TOTP secret for admin/sponsor MFA
-- BUG-008-B2: the column is already in CREATE TABLE users; a duplicate
-- ALTER here aborted fresh-database init (npm run db:init).

-- C2 fix: Recreate automation_audit_log with nullable photo_evidence_id
-- D1/SQLite does not support ALTER COLUMN, so recreate the table.
-- On fresh databases this is redundant but harmless; on existing databases
-- it migrates the NOT NULL column to nullable.
DROP TABLE IF EXISTS automation_audit_log_new;
CREATE TABLE automation_audit_log_new (
  id TEXT PRIMARY KEY,
  photo_evidence_id TEXT REFERENCES photo_evidence(id),
  actor_type TEXT CHECK(actor_type IN ('machine', 'admin')) NOT NULL,
  actor_id TEXT,
  action TEXT NOT NULL,
  confidence REAL,
  reason TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  entity_type TEXT,
  entity_id TEXT,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT
);
INSERT OR IGNORE INTO automation_audit_log_new
  (id, photo_evidence_id, actor_type, actor_id, action, confidence, reason, created_at, entity_type, entity_id, field_name, old_value, new_value)
SELECT id, photo_evidence_id, actor_type, NULL as actor_id, action, confidence, reason, created_at, entity_type, entity_id, field_name, old_value, new_value
FROM automation_audit_log;
DROP TABLE IF EXISTS automation_audit_log;
ALTER TABLE automation_audit_log_new RENAME TO automation_audit_log;
