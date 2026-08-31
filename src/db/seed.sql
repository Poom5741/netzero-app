-- Seed demo data for NetZeroCarbon POC

-- Farmers
INSERT OR IGNORE INTO farmers (id, full_name, gender, phone, addr_province, addr_district, addr_subdistrict, addr_village)
VALUES 
  ('farmer-001', 'สมชาย ใจดี', 'male', '0812345678', 'เชียงใหม่', 'สันทราย', 'สันทรายหลวง', 'บ้านสันทราย'),
  ('farmer-002', 'สมหญิง รักโลก', 'female', '0898765432', 'เชียงราย', 'เมือง', 'ริมกก', 'บ้านริมกก'),
  ('farmer-003', 'ทดสอบ ทดลอง', 'unspecified', '0999999999', 'กรุงเทพ', 'จตุจักร', 'จันทรเกษม', 'ทดสอบ');

-- Plots
INSERT OR IGNORE INTO plots (id, farmer_id, plot_code, deed_no, doc_type, tenure, area_rai, centroid_lat, centroid_lng)
VALUES
  ('plot-001', 'farmer-001', 'CM-001', '12345', 'chanote', 'owner', 15.5, 18.82, 98.98),
  ('plot-002', 'farmer-002', 'CR-001', '67890', 'ns3k', 'tenant', 22.0, 19.91, 100.08),
  ('plot-003', 'farmer-003', 'TEST-001', '99999', 'chanote', 'owner', 10.0, 13.85, 100.57);

-- LINE Links
INSERT OR IGNORE INTO line_links (id, farmer_id, line_user_id, status)
VALUES
  ('line-001', 'farmer-001', 'U1234567890abcdef', 'verified'),
  ('line-002', 'farmer-003', 'UTESTFARMER000001', 'verified');

-- Users (demo credentials — use seed.ts for proper password hashing)
-- admin@netzero.local / admin123
-- sponsor@netzero.local / sponsor123
INSERT OR IGNORE INTO users (id, email, password_hash, role, name)
VALUES
  ('user-admin', 'admin@netzero.local', 'placeholder-hash', 'admin', 'Admin User'),
  ('user-sponsor', 'sponsor@netzero.local', 'placeholder-hash', 'sponsor', 'Sponsor User');
