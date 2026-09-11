# GO/NO-GO Decision — LINE OA Chatbot

## Date: 2026-09-11

## Decision: **GO** (with noted risks)

## Evidence

### Verify phase
- 563 tests pass (unit + integration)
- 7 pre-existing failures (not caused by this change)
- 1 pre-existing error (not caused by this change)

### Inspect phase
- 2 critical issues found → **fixed** (due_date schema, dead estimation code)
- 3 high issues → 1 fixed (consent docstring), 2 noted (auth, plot code collision)
- 5 medium issues → 2 fixed (dead code, typo), 3 noted (atomic writes, rice age param)

### Build completeness
- 18/18 tasks complete
- 17 new files created
- 4 files modified
- 147 new tests written

### Schema changes
- consent_log table (PDPA audit trail)
- season_steps table (9-step calendar)
- water_depth_cm column on photo_evidence
- rice_age_days, sf_w_factor columns on season_inputs

## Risks Accepted

| Risk | Severity | Mitigation |
|------|----------|------------|
| No auth on farmer/plot endpoints | High | Deferred to release phase — pilot environment only |
| Plot code collision (9999 codes/province) | Medium | Low volume in pilot; retry logic needed for production |
| Non-atomic DB writes | Medium | D1 batch API available; needs integration |
| LINE webhook disabled | Low | Standalone LIFF chat is the pilot path |

## Rollback Plan
1. Revert git commit to previous state
2. No data migrations to rollback (new tables are additive)
3. Existing functionality unchanged

## Recommendation
Ship to pilot environment. The core flows (registration, photo reporting, carbon estimation) are complete and tested. Auth and atomic writes are production hardening items, not pilot blockers.
