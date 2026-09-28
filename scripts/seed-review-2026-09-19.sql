-- NetZeroCarbon D1 wipe + seed for manual review 2026-09-19
-- TARGET: production D1 (database_id 9f9cb6c3-ef8b-4d10-9457-b92c63f68d64)
-- PRESERVES: users table (admin row stays; sponsor row you create via admin console)
-- WIPES: all farmer-application data
-- INSERTS: 1 happy farmer at documents state + 1 edge-case farmer at consent state
--
-- NOTE: D1 via wrangler --file does NOT support BEGIN TRANSACTION / COMMIT.
-- Each statement is auto-committed. Delete/insert order matters for FK.

-- Wipe farmer-application data (no FK from users, so users table is untouched)
DELETE FROM application_documents;
DELETE FROM season_steps;
DELETE FROM season_inputs;
DELETE FROM fertilizer_entries;
DELETE FROM photo_evidence;
DELETE FROM farmer_messages;
DELETE FROM carbon_estimates;
DELETE FROM ai_events;
DELETE FROM farmer_trust;
DELETE FROM consent_log;
DELETE FROM automation_audit_log;
DELETE FROM seasons;
DELETE FROM plots;
DELETE FROM line_links;
DELETE FROM farmers;

-- ── Happy-path farmer ──
-- Phone 0812345679, fully registered, owns 1 plot, line_link verified,
-- conversation_state = 'documents', zero documents uploaded.
INSERT INTO farmers (id, full_name, gender, phone, addr_province, addr_district, addr_subdistrict, created_at, updated_at)
VALUES ('farmer-happy', 'สมชาย มั่นคง', 'male', '0812345679', 'สุพรรณบุรี', 'เมืองสุพรรณบุรี', 'ท่าพี่เลี้ยง', datetime('now'), datetime('now'));

INSERT INTO plots (id, farmer_id, plot_code, deed_no, doc_type, tenure, area_rai, centroid_lat, centroid_lng, created_at, updated_at)
VALUES ('plot-happy-1', 'farmer-happy', 'PLOT-001', 'DEED-001', 'chanote', 'owner', 5.0, 14.4745, 100.1225, datetime('now'), datetime('now'));

INSERT INTO line_links (id, farmer_id, line_user_id, status, conversation_state, verified_by, created_at, updated_at)
VALUES ('link-happy', 'farmer-happy', 'U-test-happy-001', 'verified', 'documents', 'admin', datetime('now'), datetime('now'));

INSERT INTO consent_log (id, farmer_id, consent_type, accepted, created_at)
VALUES
  ('consent-happy-pdpa', 'farmer-happy', 'pdpa', 1, datetime('now')),
  ('consent-happy-data', 'farmer-happy', 'data_collection', 1, datetime('now')),
  ('consent-happy-photo', 'farmer-happy', 'photo_sharing', 1, datetime('now')),
  ('consent-happy-carbon', 'farmer-happy', 'carbon_project', 1, datetime('now'));

-- ── Edge-case farmer ──
-- Phone 0899999999, line_link pending, conversation_state = 'consent',
-- no plot, no documents, no consent accepted.
-- Used for Step 3.1 (consent reject), Step 3.11 (cross-farmer upload attempt).
INSERT INTO farmers (id, full_name, gender, phone, addr_province, created_at, updated_at)
VALUES ('farmer-edge', 'มานี มีใจ', 'female', '0899999999', 'สุพรรณบุรี', datetime('now'), datetime('now'));

INSERT INTO line_links (id, farmer_id, line_user_id, status, conversation_state, created_at, updated_at)
VALUES ('link-edge', 'farmer-edge', 'U-test-edge-001', 'pending', 'consent', datetime('now'), datetime('now'));
