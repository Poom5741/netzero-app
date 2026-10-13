-- 019/018 dual-env test provisioning — dev D1 (netzero-staging-db)
UPDATE users SET password_hash='b8aa149d9ebc604fe8d6db5b2a6a9d06:c0585834b13658f47381c0e4e0449056e1944febe69478718e4bd2645fd16879' WHERE email IN ('admin@netzero.local','sponsor@netzero.local');
UPDATE users SET areas='["สุพรรณบุรี"]' WHERE email='sponsor@netzero.local';
INSERT OR IGNORE INTO farmers (id, full_name, gender, phone, addr_province, addr_district, addr_subdistrict, addr_village, cpa_code)
  VALUES ('farmer-edge', 'มานี มีใจ', 'female', '0891234567', 'สุพรรณบุรี', 'สามชุก', 'หนองสะเดา', 'บ้านด่าน', 'CPA0003');
INSERT OR IGNORE INTO plots (id, farmer_id, plot_code, deed_no, doc_type, tenure, area_rai, centroid_lat, centroid_lng)
  VALUES ('plot-edge', 'farmer-edge', 'SPB-0001', 'TEST-DEED-0001', 'chanote', 'owner', 4.5, 14.716, 100.079);
INSERT OR IGNORE INTO line_links (id, farmer_id, line_user_id, status)
  VALUES ('line-edge', 'farmer-edge', 'UEDGEFARMER0000001', 'verified');

-- corrective pass (dev mirrored staging data — reconcile to r5 staging fixes)
UPDATE farmers SET cpa_code='CPA0003' WHERE id='farmer-edge' AND cpa_code IS NULL;
UPDATE users SET sponsor_id='farmer-edge' WHERE id='user-sponsor' AND sponsor_id='sp-nzc-01';

-- unify dev client-account passwords with the staging handoff identity (ClawTest2026!)
UPDATE users SET password_hash='cba5cb468818d7628cd808e2f8610fad:06c88f10d303bf4cdecf991cf69ef5f8707d91308e960ca7476e733902dd1213' WHERE email IN ('admin@netzero.com','sponsor@netzero.com','qa-admin@netzero.com','qa-sponsor@netzero.com');
