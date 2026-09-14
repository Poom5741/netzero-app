#!/bin/bash
# What Next? - Spec-Driven Workflow Guidance
# Shows current status and suggests next steps
# Does NOT auto-execute anything

set -e

echo "=== Spec-Driven Workflow: Current Status ==="
echo ""

# Check if specs exist
echo "📋 Specs Status:"
if [ -d "specs" ]; then
  for dir in specs/*/; do
    if [ -f "$dir/spec.md" ]; then
      echo "   ✅ $dir/spec.md exists"
    else
      echo "   ⚠️  $dir exists but no spec.md"
    fi
  done
else
  echo "   ❌ No specs/ directory"
fi
echo ""

# Run compliance check
echo "🔍 Spec Compliance:"
if [ -f "scripts/check-spec-compliance.sh" ]; then
  ./scripts/check-spec-compliance.sh 2>&1 | tail -5
else
  echo "   ❌ Compliance script not found"
fi
echo ""

# Check traceability
echo "📊 Traceability:"
for dir in specs/*/; do
  if [ -f "$dir/traceability.md" ]; then
    echo "   ✅ $dir/traceability.md exists"
  else
    echo "   ⚠️  $dir/traceability.md missing"
  fi
done
echo ""

# Check visual tests
echo "️  Visual Regression:"
if [ -d "tests/visual" ]; then
  echo "   ✅ tests/visual/ exists"
  if [ -d "tests/visual/baselines" ]; then
    count=$(ls tests/visual/baselines/*.png 2>/dev/null | wc -l)
    echo "   ✅ $count baseline screenshot(s)"
  else
    echo "   ⚠️  No baselines/ folder"
  fi
else
  echo "   ⚠️  No tests/visual/ folder"
fi
echo ""

# Suggest next steps
echo "=== Recommended Next Steps ==="
echo ""

# Check for gaps
if [ -f "scripts/check-spec-compliance.sh" ]; then
  gap_output=$(./scripts/check-spec-compliance.sh 2>&1)
  if echo "$gap_output" | grep -q "SPEC DRIFT DETECTED"; then
    echo "1️⃣  Fix spec compliance gaps:"
    echo "   ./scripts/check-spec-compliance.sh"
    echo "   (See gap report above)"
    echo ""
  fi
fi

# Check for missing traceability
missing_trace=false
for dir in specs/*/; do
  if [ ! -f "$dir/traceability.md" ]; then
    missing_trace=true
    break
  fi
done

if [ "$missing_trace" = true ]; then
  echo "2️⃣  Create/update traceability matrix:"
  echo "   Edit: specs/<feature>/traceability.md"
  echo "   (Map REQ-ID → Implementation → Test → PR)"
  echo ""
fi

# Check for visual baselines
if [ ! -d "tests/visual/baselines" ] || [ $(ls tests/visual/baselines/*.png 2>/dev/null | wc -l) -eq 0 ]; then
  echo "3️  Capture visual baselines from Claude Design artifacts:"
  echo "   - Open artifact in browser"
  echo "   - Screenshot each state"
  echo "   - Save to: tests/visual/baselines/"
  echo ""
fi

echo "4️⃣  Run full verification before PR:"
echo "   ./scripts/check-spec-compliance.sh"
echo "   npm run test:visual"
echo ""

echo "=== Quick Commands ==="
echo ""
echo "  Check compliance:  ./scripts/check-spec-compliance.sh"
echo "  Run visual tests:  npm run test:visual"
echo "  View specs:        ls specs/"
echo "  View this guide:   cat scripts/what-next.sh"
echo ""
