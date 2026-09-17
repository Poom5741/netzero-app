# Quickstart: Claude Multi-Page Design Parity Validation

**Date**: 2026-09-17 | **Spec**: [spec.md](../spec.md) | **Plan**: [plan.md](../plan.md)

## Prerequisites

- **Node.js**: 18+ (for Playwright)
- **Bun**: 1.4+ (for tests)
- **wrangler**: Latest (for Cloudflare Workers)
- **Git**: For version control

## Setup

### 1. Install Dependencies

```bash
# Install Node dependencies
cd frontend && npm install

# Install Bun (if not installed)
curl -fsSL https://bun.sh/install | bash

# Install Playwright browsers
bunx playwright install
```

### 2. Verify Repository State

```bash
# Check that the Claude artifact map is present
ls docs/claude-design-artifact-map.md

# Check that visual capture infrastructure exists
ls tests/visual/lib/capture.ts
ls tests/visual/reference-harness/
```

## Validation Scenarios

### Scenario 1: Authoritative Artifact Map (FR-001)

**Goal**: Verify every in-scope Admin/Sponsor page has one labeled artifact mapping.

**Steps**:
```bash
# Check the authoritative map
cat docs/claude-design-artifact-map.md | grep -A 5 -B 5 "AD-\|SP-"
```

**Expected**: All 11 in-scope routes have a labeled entry with surface, page, source module, and route.

**Alternative**:
1. Open `docs/claude-design-artifact-map.md`
2. Verify each Admin/Sponsor page from the spec has a labeled row
3. Verify each row has a unique label, source module, and route

**Pass Criteria**: All 11 pages have a unique mapping; no route appears twice.

### Scenario 2: Source Reference Captures (FR-002, FR-003)

**Goal**: Verify source-reference captures exist for all in-scope routes with provenance.

**Steps**:
```bash
# Generate source reference captures
npx tsx tests/visual/scripts/capture-single.ts --screen admin-login --state default --viewport 1280x720
npx tsx tests/visual/scripts/capture-single.ts --screen sponsor-overview --state default --viewport 1280x720
# Repeat for all 11 in-scope routes
```

**Expected**: Each capture produces a PNG and a provenance JSON with source, route, state, viewport, and readiness status.

**Alternative** (batch):
```bash
# Run all source captures
bun run tests/visual/scripts/capture-all-screens.ts
```

**Pass Criteria**: All 11 captures succeed with `fontState: ready`, `assetStatus: ready`, and valid provenance.

### Scenario 3: Shared Visual Foundation (FR-004, FR-005, FR-006)

**Goal**: Verify Claude source tokens are applied to shared login and dashboard shell.

**Steps**:
```bash
# Check the updated CSS variables
grep -E "(232px|#061E5C|#028E91|Fira Sans)" frontend/src/app/globals.css
```

**Expected**: Sidebar width is 232px, background is navy `#061E5C`, primary is teal `#028E91`, fonts are Fira Sans/Noto Sans Thai.

**Alternative** (browser):
1. Open http://localhost:3000/admin/login
2. Verify split-panel layout with navy gradient (232px width on left)
3. Verify teal primary buttons and Fira Sans typography
4. Navigate to http://localhost:3000/admin
5. Verify sidebar and header match Claude source

**Pass Criteria**: All shared visual tokens match Claude source authority.

### Scenario 4: Existing Route Parity (FR-007, FR-008)

**Goal**: Verify existing routes receive Claude visual treatment without behavior changes.

**Steps**:
```bash
# Start dev servers
npm run dev:all
```

**Alternative** (browser):
1. Open http://localhost:3000/admin
2. Verify overview dashboard matches Claude source visual
3. Navigate to http://localhost:3000/admin/farmers
4. Verify farmers table matches Claude source visual
5. Navigate to http://localhost:3000/sponsor
6. Verify sponsor dashboard matches Claude source visual

**Pass Criteria**: All routes use Claude visual tokens; no data, permissions, or workflow behavior changes.

### Scenario 5: Visual Comparison (FR-011, FR-012)

**Goal**: Verify source and implementation captures can be compared.

**Steps**:
```bash
# Compare one route
npx tsx tests/visual/scripts/compare-pair.ts \
  --before tests/visual/captures/reference/admin-login-default-1280x720.png \
  --after tests/visual/captures/implementation/admin-login-default-1280x720.png \
  --tolerance 0.05
```

**Expected**: Comparison produces a diff image and noise-adjusted similarity score.

**Pass Criteria**: Each route comparison identifies visual differences; unexplained mismatches are documented.

### Scenario 6: Provenance Recording (FR-011)

**Goal**: Verify all captures have complete provenance records.

**Steps**:
```bash
# Check provenance directory
ls tests/visual/captures/provenance/
```

**Expected**: Each capture has a corresponding JSON provenance file with source, viewport, state, and readiness status.

**Pass Criteria**: Every capture has a matching provenance record; no captures are orphaned.

### Scenario 7: Behavior Preservation (FR-009)

**Goal**: Verify visual changes do not alter existing behavior.

**Steps**:
```bash
# Run existing E2E tests
cd frontend
bunx playwright test
```

**Expected**: All existing tests pass with visual changes applied.

**Pass Criteria**: 17+ E2E tests pass; no new behavioral regressions introduced.

## Full Validation

**Run all checks**:
```bash
# 1. Verify artifact map completeness
bash -c 'grep -c "AD-\|SP-" docs/claude-design-artifact-map.md'

# 2. Generate source captures
bun run tests/visual/scripts/capture-all-screens.ts

# 3. Check visual tokens
grep -E "(232px|#061E5C|#028E91)" frontend/src/app/globals.css

# 4. Run E2E tests to verify behavior
cd frontend && bunx playwright test

# 5. Run comparison on selected routes
npx tsx tests/visual/scripts/compare-pair.ts --before ... --after ... --tolerance 0.05
```

**Expected**: All checks pass; visual parity achieved without behavioral changes.

## Troubleshooting

### Missing artifact map entry

**Symptom**: A route has no corresponding label in the artifact map
**Fix**: Add the route to `docs/claude-design-artifact-map.md` with the correct surface, page, source module, and status

### Font loading timeout in capture

**Symptom**: Source capture shows fallback fonts instead of Fira Sans
**Cause**: Network timeout or missing font assets
**Fix**: Increase font timeout in capture script or verify font availability

### Sidebar geometry mismatch

**Symptom**: Admin sidebar is not 232px wide
**Cause**: CSS variables not updated to Claude source
**Fix**: Update `--sidebar-width` in `frontend/src/app/globals.css`

### E2E test failures after visual changes

**Symptom**: Tests fail after applying Claude visual tokens
**Cause**: Visual changes inadvertently altered element selectors or behavior
**Fix**: Revert visual changes temporarily and identify the specific change causing the failure

## Success Criteria

All 7 validation scenarios pass:
- ✅ SC-001: 11/11 in-scope routes mapped in artifact map
- ✅ SC-002: All reference captures have complete provenance
- ✅ SC-003: Admin/Sponsor routes accessible at desktop/mobile without clipping
- ✅ SC-004: Existing E2E tests remain green
- ✅ SC-005: Every route has comparison result at agreed viewports
- ✅ SC-006: No deferred pages reported as complete; no runtime imports
- ✅ SC-007: Mismatch source identifiable in under 5 minutes

## Next Steps

After validation:
1. Commit changes: `git add -A && git commit -m "feat(design): apply Claude multi-page design parity"`
2. Push to branch: `git push origin HEAD`
3. Create PR to main
4. Verify CI passes
5. Merge after visual QA approval

## References

- **Spec**: [spec.md](../spec.md)
- **Plan**: [plan.md](../plan.md)
- **Research**: [research.md](../research.md)
- **Data Model**: [data-model.md](../data-model.md)
- **Contracts**: [contracts/](../contracts/)
- **Artifact Map**: [docs/claude-design-artifact-map.md](../../../docs/claude-design-artifact-map.md)