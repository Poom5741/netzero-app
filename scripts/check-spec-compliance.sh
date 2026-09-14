#!/bin/bash
# Spec Compliance Check Script
# Checks implementation against spec requirements
# Exit 0 = compliant, Exit 1 = gaps detected

set -e

SPEC_DIR="${1:-specs}"
SRC_DIR="src"
GAPS=0
CHECKS=0

echo "=== Spec Compliance Check ==="
echo ""

# Function to check if a pattern exists in a file
check_pattern() {
  local description="$1"
  local file="$2"
  local pattern="$3"
  local required="$4"  # "yes" or "no"

  CHECKS=$((CHECKS + 1))

  if grep -q "$pattern" "$file" 2>/dev/null; then
    echo "✅ $description"
  else
    if [ "$required" = "yes" ]; then
      echo "❌ GAP: $description"
      GAPS=$((GAPS + 1))
    else
      echo "️  OPTIONAL: $description"
    fi
  fi
}

# Function to check state exists in flow.ts
check_state() {
  local state="$1"
  local description="$2"

  check_pattern "$description" "$SRC_DIR/line/flow.ts" "\"$state\"" "yes"
}

# Function to check flex builder exists
check_flex_builder() {
  local builder="$1"
  local description="$2"

  check_pattern "$description" "$SRC_DIR/line/flex-builders.ts" "$builder" "yes"
}

# ============================================================================
# LINE OA Spec Checks
# ============================================================================

echo "--- LINE OA: States ---"
check_state "welcome" "OB-01: welcome state"
check_state "consent" "OB-15: consent state"
check_state "phone" "OB-02: phone state"
check_state "identity_confirm" "OB-03: identity confirm state"
check_state "conditions" "OB-05: conditions state"
check_state "registration" "OB-12: registration state"
check_state "documents" "OB-13: documents state"
check_state "pending_review" "OB-10: pending review state"
check_state "activation" "OB-11: activation state"
check_state "season_setup" "PJ-00: season setup state"
check_state "calendar" "PJ-13: calendar state"
check_state "photo_report" "PJ-02 to PJ-09: photo report state"
check_state "results" "RP-01 to RP-04: results state"

echo ""
echo "--- LINE OA: Flex Builders ---"
check_flex_builder "buildWelcomeBubble" "OB-01: welcome bubble"
check_flex_builder "buildConsent4Checkbox" "OB-15: 4-checkbox consent"
check_flex_builder "buildIdentityConfirmBubble" "OB-03: identity confirm bubble"
check_flex_builder "buildConditions3Checkbox" "OB-05: 3-checkbox conditions"
check_flex_builder "buildRegistrationLinkBubble" "OB-12: registration link bubble"
check_flex_builder "buildCalendarBubble" "PJ-13: calendar bubble"
check_flex_builder "buildDashboardBubble" "RP-03: dashboard bubble"

echo ""
echo "--- LINE OA: Business Rules ---"
check_pattern "BR-01: SF_w = 0.55 calculation" "$SRC_DIR/calc/sf-w.ts" "0.55" "yes"
check_pattern "BR-02: SF_w fallback to 0.71" "$SRC_DIR/calc/sf-w.ts" "0.71" "yes"
check_pattern "BR-03: SY-03 chat photo rejection" "$SRC_DIR/line/flow-photo-reporting.ts" "composePhotoRejected" "yes"
check_pattern "BR-04: 4 photo rounds defined" "$SRC_DIR/line/flow.ts" "WET-1" "yes"
check_pattern "BR-05: 9-step calendar" "$SRC_DIR/line/flow.ts" "SG-09" "yes"
check_pattern "BR-06: LIFF camera URL" "$SRC_DIR/line/flow.ts" "liff.line.me" "yes"

echo ""
echo "--- LINE OA: Rich Menu ---"
check_pattern "Rich menu: 6 items" "$SRC_DIR/line/rich-menu.ts" "getRichMenuItems" "yes"
check_pattern "Rich menu: BL_HOME action" "$SRC_DIR/line/rich-menu.ts" "BL_HOME" "yes"
check_pattern "Rich menu: SEASON_HOME action" "$SRC_DIR/line/rich-menu.ts" "SEASON_HOME" "yes"
check_pattern "Rich menu: TODO action" "$SRC_DIR/line/rich-menu.ts" "TODO" "yes"
check_pattern "Rich menu: FIELD_LIST action" "$SRC_DIR/line/rich-menu.ts" "FIELD_LIST" "yes"
check_pattern "Rich menu: SUMMARY action" "$SRC_DIR/line/rich-menu.ts" "SUMMARY" "yes"
check_pattern "Rich menu: CONTACT action" "$SRC_DIR/line/rich-menu.ts" "CONTACT" "yes"

echo ""
echo "--- LINE OA: LIFF Integration ---"
check_pattern "LIFF ID from env" "$SRC_DIR/index.ts" "LIFF_ID" "yes"
check_pattern "LIFF deep-link in welcome" "$SRC_DIR/line/flow.ts" "liff.line.me" "yes"
check_pattern "LIFF camera deep-link" "$SRC_DIR/line/flow.ts" "/camera" "yes"

# ============================================================================
# Summary
# ============================================================================

echo ""
echo "=== Summary ==="
echo "Checks: $CHECKS"
echo "Gaps:   $GAPS"
echo ""

if [ $GAPS -gt 0 ]; then
  echo " SPEC DRIFT DETECTED: $GAPS gap(s) found"
  exit 1
else
  echo "✅ SPEC COMPLIANT: All checks passed"
  exit 0
fi
