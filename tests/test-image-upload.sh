#!/bin/bash
# End-to-end test script for image upload flow
# Usage: ./tests/test-image-upload.sh [backend_url]
# Default: http://localhost:8787

set -euo pipefail

BACKEND="${1:-http://localhost:8787}"
FRONTEND="${2:-http://localhost:3000}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
IMAGE_DIR="$SCRIPT_DIR/fixtures/images"
PASS=0
FAIL=0
TOTAL=0

green() { printf "\033[32m✓ %s\033[0m\n" "$1"; }
red()   { printf "\033[31m✗ %s\033[0m\n" "$1"; }
bold()  { printf "\033[1m%s\033[0m\n" "$1"; }

assert_status() {
  local desc="$1" expected="$2" actual="$3"
  TOTAL=$((TOTAL + 1))
  if [ "$actual" = "$expected" ]; then
    green "$desc (HTTP $actual)"
    PASS=$((PASS + 1))
  else
    red "$desc — expected HTTP $expected, got $actual"
    FAIL=$((FAIL + 1))
  fi
}

assert_json_field() {
  local desc="$1" json="$2" field="$3" expected="$4"
  TOTAL=$((TOTAL + 1))
  actual=$(echo "$json" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('$field','MISSING'))" 2>/dev/null || echo "PARSE_ERROR")
  if [ "$actual" = "$expected" ]; then
    green "$desc ($field=$actual)"
    PASS=$((PASS + 1))
  else
    red "$desc — expected $field=$expected, got $actual"
    FAIL=$((FAIL + 1))
  fi
}

# ─────────────────────────────────────────────
bold "Phase 0: Health check"
# ─────────────────────────────────────────────
HEALTH=$(curl -s -w "\n%{http_code}" "$BACKEND/health")
HEALTH_STATUS=$(echo "$HEALTH" | tail -1)
HEALTH_BODY=$(echo "$HEALTH" | head -1)
assert_status "Backend health endpoint" "200" "$HEALTH_STATUS"

# ─────────────────────────────────────────────
bold "Phase 1: Upload — photo_type=prepare (no AI screening)"
# ─────────────────────────────────────────────
UPLOAD_PREPARE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND/photo/upload" \
  -F "photo=@$IMAGE_DIR/test-wetdry.png" \
  -F "plot_id=plot-004" \
  -F "season_id=2568-napi" \
  -F "gps_lat=18.8300" \
  -F "gps_lng=98.9900" \
  -F "gps_accuracy=10" \
  -F "taken_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  -F "photo_type=prepare")
PREPARE_STATUS=$(echo "$UPLOAD_PREPARE" | tail -1)
PREPARE_BODY=$(echo "$UPLOAD_PREPARE" | head -1)
assert_status "Upload prepare photo" "201" "$PREPARE_STATUS"
assert_json_field "Prepare verdict (flagged = EXIF missing, expected)" "$PREPARE_BODY" "verdict" "flagged"
PREPARE_PHOTO_ID=$(echo "$PREPARE_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
echo "   → Photo ID: $PREPARE_PHOTO_ID"

# ─────────────────────────────────────────────
bold "Phase 2: Upload — photo_type=wetdry (CLIP not loaded → queued)"
# ─────────────────────────────────────────────
UPLOAD_WETDRY=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND/photo/upload" \
  -F "photo=@$IMAGE_DIR/test-wetdry.png" \
  -F "plot_id=plot-004" \
  -F "season_id=2568-napi" \
  -F "gps_lat=18.8301" \
  -F "gps_lng=98.9901" \
  -F "gps_accuracy=8" \
  -F "taken_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  -F "photo_type=wetdry")
WETDRY_STATUS=$(echo "$UPLOAD_WETDRY" | tail -1)
WETDRY_BODY=$(echo "$UPLOAD_WETDRY" | head -1)
assert_status "Upload wetdry photo" "201" "$WETDRY_STATUS"
assert_json_field "Wetdry verdict (flagged = EXIF missing, expected)" "$WETDRY_BODY" "verdict" "flagged"
WETDRY_PHOTO_ID=$(echo "$WETDRY_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
echo "   → Photo ID: $WETDRY_PHOTO_ID"

# ─────────────────────────────────────────────
bold "Phase 3: Upload — photo_type=harvest"
# ─────────────────────────────────────────────
UPLOAD_HARVEST=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND/photo/upload" \
  -F "photo=@$IMAGE_DIR/test-chat.png" \
  -F "plot_id=plot-004" \
  -F "season_id=2568-napi" \
  -F "gps_lat=18.8302" \
  -F "gps_lng=98.9902" \
  -F "gps_accuracy=12" \
  -F "taken_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  -F "photo_type=harvest")
HARVEST_STATUS=$(echo "$UPLOAD_HARVEST" | tail -1)
HARVEST_BODY=$(echo "$UPLOAD_HARVEST" | head -1)
assert_status "Upload harvest photo" "201" "$HARVEST_STATUS"
assert_json_field "Harvest verdict (flagged = EXIF missing, expected)" "$HARVEST_BODY" "verdict" "flagged"
HARVEST_PHOTO_ID=$(echo "$HARVEST_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
echo "   → Photo ID: $HARVEST_PHOTO_ID"

# ─────────────────────────────────────────────
bold "Phase 4: Upload — missing required fields (expect 400)"
# ─────────────────────────────────────────────
UPLOAD_BAD=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND/photo/upload" \
  -F "photo=@$IMAGE_DIR/test-wetdry.png")
BAD_STATUS=$(echo "$UPLOAD_BAD" | tail -1)
assert_status "Upload missing fields → 400" "400" "$BAD_STATUS"

# ─────────────────────────────────────────────
bold "Phase 5: Upload — missing photo_type (expect 400)"
# ─────────────────────────────────────────────
UPLOAD_NOTYPE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND/photo/upload" \
  -F "photo=@$IMAGE_DIR/test-wetdry.png" \
  -F "plot_id=plot-004" \
  -F "season_id=2568-napi" \
  -F "gps_lat=18.83" \
  -F "gps_lng=98.99" \
  -F "taken_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)")
NOTYPE_STATUS=$(echo "$UPLOAD_NOTYPE" | tail -1)
assert_status "Upload missing photo_type → 400" "400" "$NOTYPE_STATUS"

# ─────────────────────────────────────────────
bold "Phase 6: Login as admin + check review queue"
# ─────────────────────────────────────────────
# Login via backend directly (returns 302 redirect on success, don't follow)
LOGIN_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=admin@netzero.local&password=ClawTest2026!" \
  -c /tmp/nzc-cookies.txt)
LOGIN_STATUS=$(echo "$LOGIN_RESP" | tail -1)
assert_status "Admin login (302 redirect = success)" "302" "$LOGIN_STATUS"

# Get review queue (JSON API endpoint)
QUEUE_RESP=$(curl -s -w "\n%{http_code}" "$BACKEND/api/admin/review" \
  -b /tmp/nzc-cookies.txt)
QUEUE_STATUS=$(echo "$QUEUE_RESP" | tail -1)
QUEUE_BODY=$(echo "$QUEUE_RESP" | head -1)
assert_status "Review queue loads" "200" "$QUEUE_STATUS"

# Count photos in queue
QUEUE_COUNT=$(echo "$QUEUE_BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
echo "   → Photos in queue: $QUEUE_COUNT"

# ─────────────────────────────────────────────
bold "Phase 7: Admin review — approve a photo"
# ─────────────────────────────────────────────
if [ -n "$PREPARE_PHOTO_ID" ]; then
  APPROVE_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND/api/admin/review/$PREPARE_PHOTO_ID" \
    -H "Content-Type: application/json" \
    -d '{"status":"verified","reason":"Looks good — test approval"}' \
    -b /tmp/nzc-cookies.txt)
  APPROVE_STATUS=$(echo "$APPROVE_RESP" | tail -1)
  assert_status "Admin approve photo" "200" "$APPROVE_STATUS"
fi

# ─────────────────────────────────────────────
bold "Phase 8: Admin review — reject a photo"
# ─────────────────────────────────────────────
if [ -n "$WETDRY_PHOTO_ID" ]; then
  REJECT_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND/api/admin/review/$WETDRY_PHOTO_ID" \
    -H "Content-Type: application/json" \
    -d '{"status":"rejected","reason":"Blurry image — test rejection"}' \
    -b /tmp/nzc-cookies.txt)
  REJECT_STATUS=$(echo "$REJECT_RESP" | tail -1)
  assert_status "Admin reject photo" "200" "$REJECT_STATUS"
fi

# ─────────────────────────────────────────────
bold "Phase 9: Verify queue updated"
# ─────────────────────────────────────────────
QUEUE_AFTER=$(curl -s "$BACKEND/api/admin/review" -b /tmp/nzc-cookies.txt)
QUEUE_AFTER_COUNT=$(echo "$QUEUE_AFTER" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
echo "   → Photos remaining in queue: $QUEUE_AFTER_COUNT"

# ─────────────────────────────────────────────
bold "Phase 10: Evidence image retrieval"
# ─────────────────────────────────────────────
if [ -n "$PREPARE_PHOTO_ID" ]; then
  EVIDENCE_RESP=$(curl -s -w "\n%{http_code}" "$BACKEND/evidence/${PREPARE_PHOTO_ID}.jpg")
  EVIDENCE_STATUS=$(echo "$EVIDENCE_RESP" | tail -1)
  assert_status "Evidence image endpoint" "200" "$EVIDENCE_STATUS"
fi

# ─────────────────────────────────────────────
bold "Phase 11: Frontend pages load"
# ─────────────────────────────────────────────
for page in "/chat" "/upload" "/summary" "/sponsor" "/admin"; do
  PAGE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND$page")
  assert_status "Frontend $page loads" "200" "$PAGE_STATUS"
done
# Homepage redirects (307) — that's expected
HOME_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND/")
assert_status "Frontend / redirects (307 = expected)" "307" "$HOME_STATUS"

# ─────────────────────────────────────────────
bold "Phase 12: CORS check — frontend origin allowed"
# ─────────────────────────────────────────────
CORS_RESP=$(curl -s -w "\n%{http_code}" -X OPTIONS "$BACKEND/photo/upload" \
  -H "Origin: $FRONTEND" \
  -H "Access-Control-Request-Method: POST")
CORS_STATUS=$(echo "$CORS_RESP" | tail -1)
TOTAL=$((TOTAL + 1))
if [ "$CORS_STATUS" = "200" ] || [ "$CORS_STATUS" = "204" ]; then
  green "CORS preflight from frontend origin (HTTP $CORS_STATUS)"
  PASS=$((PASS + 1))
else
  red "CORS preflight from frontend origin — expected 200/204, got $CORS_STATUS"
  FAIL=$((FAIL + 1))
fi

# ─────────────────────────────────────────────
bold "Phase 13: Upload with EXIF timestamp → CLIP screening runs"
# ─────────────────────────────────────────────
CLIP_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND/photo/upload" \
  -F "photo=@$IMAGE_DIR/test-wetdry.png" \
  -F "plot_id=plot-004" \
  -F "season_id=2568-napi" \
  -F "gps_lat=18.8310" \
  -F "gps_lng=98.9910" \
  -F "gps_accuracy=8" \
  -F "taken_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  -F "photo_type=wetdry" \
  -F "__exif_timestamp=2026-09-01T10:00:00Z")
CLIP_STATUS=$(echo "$CLIP_RESP" | tail -1)
CLIP_BODY=$(echo "$CLIP_RESP" | head -1)
assert_status "Upload with EXIF → CLIP runs" "201" "$CLIP_STATUS"
CLIP_VERDICT=$(echo "$CLIP_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('verdict',''))" 2>/dev/null)
CLIP_WATER=$(echo "$CLIP_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('water_state',''))" 2>/dev/null)
CLIP_CONF=$(echo "$CLIP_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('ai_confidence',''))" 2>/dev/null)
echo "   → Verdict: $CLIP_VERDICT | Water: $CLIP_WATER | Confidence: $CLIP_CONF"
TOTAL=$((TOTAL + 1))
if [ "$CLIP_WATER" = "flooded" ] || [ "$CLIP_WATER" = "dry" ]; then
  green "CLIP classified water_state correctly"
  PASS=$((PASS + 1))
else
  red "CLIP water_state expected flooded or dry, got: $CLIP_WATER"
  FAIL=$((FAIL + 1))
fi

# ─────────────────────────────────────────────
bold "Phase 14: Upload with kill_switch → bypass CLIP"
# ─────────────────────────────────────────────
KILL_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND/photo/upload" \
  -F "photo=@$IMAGE_DIR/test-wetdry.png" \
  -F "plot_id=plot-004" \
  -F "season_id=2568-napi" \
  -F "gps_lat=18.8311" \
  -F "gps_lng=98.9911" \
  -F "gps_accuracy=8" \
  -F "taken_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  -F "photo_type=wetdry" \
  -F "__exif_timestamp=2026-09-01T10:00:00Z" \
  -F "__kill_switch=true")
KILL_STATUS=$(echo "$KILL_RESP" | tail -1)
KILL_BODY=$(echo "$KILL_RESP" | head -1)
KILL_VERDICT=$(echo "$KILL_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('verdict',''))" 2>/dev/null)
assert_status "Kill switch upload → 201" "201" "$KILL_STATUS"
TOTAL=$((TOTAL + 1))
if [ "$KILL_VERDICT" = "queued" ]; then
  green "Kill switch bypassed CLIP → queued for human review"
  PASS=$((PASS + 1))
else
  red "Kill switch expected verdict=queued, got: $KILL_VERDICT"
  FAIL=$((FAIL + 1))
fi

# ─────────────────────────────────────────────
bold "RESULTS"
# ─────────────────────────────────────────────
echo ""
echo "  Total: $TOTAL | Pass: $PASS | Fail: $FAIL"
echo ""
if [ "$FAIL" -eq 0 ]; then
  green "All tests passed!"
else
  red "$FAIL test(s) failed"
  exit 1
fi
