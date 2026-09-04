#!/bin/bash
# Quick automated check — run this first, then do manual testing
# Usage: ./tests/poc1-verification/quick-check.sh

set -euo pipefail

BACKEND="https://netzero-carbon-poc.poom-a1d.workers.dev"
FRONTEND="https://netzero-frontend.poom-a1d.workers.dev"
DIR="$(cd "$(dirname "$0")" && pwd)"
PASS=0; FAIL=0; TOTAL=0

green() { printf "\033[32m✓ %s\033[0m\n" "$1"; }
red()   { printf "\033[31m✗ %s\033[0m\n" "$1"; }
check() {
  TOTAL=$((TOTAL+1))
  if eval "$2" >/dev/null 2>&1; then green "$1"; PASS=$((PASS+1))
  else red "$1"; FAIL=$((FAIL+1)); fi
}

echo ""
echo "═══════════════════════════════════════════════"
echo " POC1 Quick Check — $(date)"
echo "═══════════════════════════════════════════════"
echo ""

echo "── Backend ──"
check "Health endpoint" "curl -sf $BACKEND/health | grep -q ok"
check "Chat API (consent flow)" "curl -sf -X POST $BACKEND/api/chat -H 'Content-Type: application/json' -d '{\"text\":\"test\",\"userId\":\"anon\"}' | grep -q reply"
check "Login page renders" "curl -sf $BACKEND/login | grep -q 'เข้าสู่ระบบ'"
check "CORS preflight" "curl -sf -o /dev/null -w '%{http_code}' -X OPTIONS $BACKEND/photo/upload -H 'Origin: https://netzero-frontend.poom-a1d.workers.dev' -H 'Access-Control-Request-Method: POST' | grep -qE '20[04]'"

echo ""
echo "── Photo Upload ──"
UPLOAD=$(curl -sf -X POST $BACKEND/photo/upload \
  -F "photo=@$DIR/test-photo-wetdry.png" \
  -F "plot_id=plot-004" \
  -F "season_id=2568-napi" \
  -F "gps_lat=18.83" \
  -F "gps_lng=98.99" \
  -F "gps_accuracy=10" \
  -F "taken_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  -F "photo_type=wetdry" \
  -F "__exif_timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)" 2>/dev/null || echo "{}")
check "Upload returns 201 with verdict" "echo '$UPLOAD' | python3 -c 'import sys,json; d=json.load(sys.stdin); assert d.get(\"verdict\") in [\"flagged\",\"pre_verified\",\"queued\",\"refused\"]'"
check "CLIP returns water_state" "echo '$UPLOAD' | python3 -c 'import sys,json; d=json.load(sys.stdin); assert d.get(\"water_state\") in [\"flooded\",\"dry\"]'"
echo "   Upload result: $(echo "$UPLOAD" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(f\"verdict={d.get(\"verdict\")} water={d.get(\"water_state\")} conf={d.get(\"ai_confidence\",\"N/A\")}\")' 2>/dev/null)"

echo ""
echo "── Admin ──"
LOGIN=$(curl -sf -c /tmp/poc1-cookies.txt -X POST $BACKEND/login \
  -d "email=admin@netzero.com&password=ClawTest2026!" -w "\n%{http_code}" 2>/dev/null)
LOGIN_CODE=$(echo "$LOGIN" | tail -1)
check "Admin login returns 302" "[ '$LOGIN_CODE' = '302' ]"
check "Review queue loads" "curl -sf -b /tmp/poc1-cookies.txt $BACKEND/api/admin/review | python3 -c 'import sys,json; d=json.load(sys.stdin); assert isinstance(d,list)'"
QUEUE_COUNT=$(curl -sf -b /tmp/poc1-cookies.txt $BACKEND/api/admin/review | python3 -c 'import sys,json; print(len(json.load(sys.stdin)))' 2>/dev/null || echo "?")
echo "   Photos in queue: $QUEUE_COUNT"

echo ""
echo "── Frontend Pages ──"
for page in /chat /upload /summary /sponsor /admin; do
  check "Frontend $page" "curl -sf -o /dev/null -w '%{http_code}' $FRONTEND$page | grep -q 200"
done

echo ""
echo "═══════════════════════════════════════════════"
echo " Results: $PASS/$TOTAL passed, $FAIL failed"
echo "═══════════════════════════════════════════════"
echo ""

if [ "$FAIL" -eq 0 ]; then
  green "All automated checks passed!"
  echo ""
  echo "Next: Open https://netzero-frontend.poom-a1d.workers.dev and follow TEST-GUIDE.md"
  echo "      for manual visual testing."
else
  red "$FAIL check(s) failed — fix before manual testing"
  exit 1
fi
