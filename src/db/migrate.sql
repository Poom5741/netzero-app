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
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin', 'sponsor')),
  name TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_plots_farmer ON plots(farmer_id);
CREATE INDEX IF NOT EXISTS idx_line_links_farmer ON line_links(farmer_id);
CREATE INDEX IF NOT EXISTS idx_photo_evidence_plot ON photo_evidence(plot_id);
CREATE INDEX IF NOT EXISTS idx_fertilizer_entries_plot ON fertilizer_entries(plot_id);
CREATE INDEX IF NOT EXISTS idx_season_inputs_plot ON season_inputs(plot_id);
CREATE INDEX IF NOT EXISTS idx_farmer_messages_farmer ON farmer_messages(farmer_id);
CREATE INDEX IF NOT EXISTS idx_carbon_estimates_plot ON carbon_estimates(plot_id);
CREATE INDEX IF NOT EXISTS idx_ai_events_farmer ON ai_events(farmer_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
