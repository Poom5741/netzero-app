#!/bin/bash
# CLAW Manual Test Commands for Admin Automation
# Run these against local dev server: http://localhost:8787
# Or against deployed: https://netzero-carbon-poc.poom-a1d.workers.dev

BASE_URL="${1:-http://localhost:8787}"

echo "=== CLAW Manual Test Commands ==="
echo "Testing against: $BASE_URL"
echo ""

# Create a test image file
TEST_IMAGE="/tmp/test-photo.jpg"
convert -size 100x100 xc:blue "$TEST_IMAGE" 2>/dev/null || echo "blue" > "$TEST_IMAGE"

echo "=== 1. Temporal Validation ==="
echo ""

echo "--- Test 1a: Valid photo within phase window ---"
curl -s -X POST "$BASE_URL/photo/upload" \
  -F "photo=@$TEST_IMAGE" \
  -F "plot_id=plot-001" \
  -F "season_id=2568-napi" \
  -F "gps_lat=13.75" \
  -F "gps_lng=100.50" \
  -F "gps_accuracy=10" \
  -F "taken_at=2026-05-10T12:00:00Z" \
  -F "photo_type=prepare" \
  -F "__exif_timestamp=2026-05-10T12:00:00Z" | jq .
echo "Expected: 201, no error"
echo ""

echo "--- Test 1b: Photo outside phase window (should reject) ---"
curl -s -X POST "$BASE_URL/photo/upload" \
  -F "photo=@$TEST_IMAGE" \
  -F "plot_id=plot-001" \
  -F "season_id=2568-napi" \
  -F "gps_lat=13.75" \
  -F "gps_lng=100.50" \
  -F "gps_accuracy=10" \
  -F "taken_at=2026-07-01T12:00:00Z" \
  -F "photo_type=prepare" \
  -F "__exif_timestamp=2026-07-01T12:00:00Z" | jq .
echo "Expected: 400, error='Photo taken at wrong time'"
echo ""

echo "--- Test 1c: Missing EXIF (should flag for admin) ---"
curl -s -X POST "$BASE_URL/photo/upload" \
  -F "photo=@$TEST_IMAGE" \
  -F "plot_id=plot-001" \
  -F "season_id=2568-napi" \
  -F "gps_lat=13.75" \
  -F "gps_lng=100.50" \
  -F "gps_accuracy=10" \
  -F "taken_at=2026-01-15T10:00:00Z" \
  -F "photo_type=prepare" | jq .
echo "Expected: 201, verdict='flagged', reason contains 'EXIF missing'"
echo ""

echo "=== 2. CLIP Classification (wetdry) ==="
echo ""

echo "--- Test 2a: High confidence pass (auto-verify) ---"
curl -s -X POST "$BASE_URL/photo/upload" \
  -F "photo=@$TEST_IMAGE" \
  -F "plot_id=plot-001" \
  -F "season_id=2568-napi" \
  -F "gps_lat=13.75" \
  -F "gps_lng=100.50" \
  -F "gps_accuracy=10" \
  -F "taken_at=2026-01-15T10:00:00Z" \
  -F "photo_type=wetdry" \
  -F '__test_classification={"valid":true,"water_state":"flooded","confidence":0.95,"reason":"clear"}' | jq .
echo "Expected: 201, verdict='pre_verified' (farmer trust=0.8)"
echo ""

echo "--- Test 2b: Invalid photo (refused, nothing persisted) ---"
curl -s -X POST "$BASE_URL/photo/upload" \
  -F "photo=@$TEST_IMAGE" \
  -F "plot_id=plot-001" \
  -F "season_id=2568-napi" \
  -F "gps_lat=13.75" \
  -F "gps_lng=100.50" \
  -F "gps_accuracy=10" \
  -F "taken_at=2026-01-15T10:00:00Z" \
  -F "photo_type=wetdry" \
  -F '__test_classification={"valid":false,"water_state":"not-applicable","confidence":0.1,"reason":"no pipe"}' | jq .
echo "Expected: 200, verdict='refused', no DB row created"
echo ""

echo "--- Test 2c: Low confidence (flagged for admin) ---"
curl -s -X POST "$BASE_URL/photo/upload" \
  -F "photo=@$TEST_IMAGE" \
  -F "plot_id=plot-001" \
  -F "season_id=2568-napi" \
  -F "gps_lat=13.75" \
  -F "gps_lng=100.50" \
  -F "gps_accuracy=10" \
  -F "taken_at=2026-01-15T10:00:00Z" \
  -F "photo_type=wetdry" \
  -F '__test_classification={"valid":true,"water_state":"flooded","confidence":0.7,"reason":"unclear"}' | jq .
echo "Expected: 201, verdict='flagged'"
echo ""

echo "=== 3. Admin Review Flow ==="
echo ""

echo "--- Test 3a: View review queue (JSON) ---"
curl -s "$BASE_URL/api/admin/review" | jq .
echo "Expected: JSON array of pending photos"
echo ""

echo "--- Test 3b: View review queue (HTML) ---"
echo "Open in browser: $BASE_URL/admin/review"
echo ""

echo "=== 4. Sponsor Dashboard ==="
echo ""

echo "--- Test 4a: View sponsor dashboard ---"
curl -s "$BASE_URL/sponsor" | jq .
echo "Expected: JSON with plots grouped by province"
echo ""

echo "=== 5. Kill Switch ==="
echo ""

echo "--- Test 5a: Upload with kill switch ---"
curl -s -X POST "$BASE_URL/photo/upload" \
  -F "photo=@$TEST_IMAGE" \
  -F "plot_id=plot-001" \
  -F "season_id=2568-napi" \
  -F "gps_lat=13.75" \
  -F "gps_lng=100.50" \
  -F "gps_accuracy=10" \
  -F "taken_at=2026-01-15T10:00:00Z" \
  -F "photo_type=wetdry" \
  -F "__kill_switch=true" | jq .
echo "Expected: 201, verdict='queued' (no CLIP screening)"
echo ""

echo "=== Test Complete ==="
echo "Review all responses and verify they match expected results."
