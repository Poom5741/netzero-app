# Known Risks — LINE OA Chatbot

## Date: 2026-09-11

## Accepted Risks for Pilot

### 1. No Authentication on Write Endpoints
- **Severity:** High
- **Files:** `src/routes/farmer.ts`, `src/routes/season.ts`
- **Impact:** Farmer/plot creation endpoints are publicly accessible
- **Mitigation:** Pilot environment only; auth middleware needed for production
- **Action:** Add `requireRole` middleware before production launch

### 2. Plot Code Collision Risk
- **Severity:** Medium
- **File:** `src/farmer/create.ts`
- **Impact:** 9999 possible codes per province prefix; UNIQUE constraint causes 500 on collision
- **Mitigation:** Low volume in pilot; collision unlikely at <100 plots per province
- **Action:** Add retry logic or longer suffix for production

### 3. Non-Atomic DB Writes
- **Severity:** Medium
- **Files:** `src/season/create.ts`, `src/season/approve-estimate.ts`
- **Impact:** Partial data if any INSERT/UPDATE fails mid-sequence
- **Mitigation:** D1 batch API available; wraps in single transaction
- **Action:** Wrap in `db.batch()` for production

### 4. LINE Webhook Disabled
- **Severity:** Low
- **File:** `src/index.ts`
- **Impact:** Standalone LIFF chat only; no LINE push notifications
- **Mitigation:** LIFF standalone is the pilot path; LINE integration deferred
- **Action:** Enable `LINE_WEBHOOK_ENABLED=true` when ready

### 5. Rice Age Parameter Ignored
- **Severity:** Low
- **File:** `src/season/calendar.ts`
- **Impact:** Harvest step hardcoded to 120 days regardless of `riceAgeDays` parameter
- **Mitigation:** Rice age is always 120 for pilot varieties
- **Action:** Wire parameter to harvest step for production

### 6. Consent Append-Only (No Withdrawal)
- **Severity:** Low
- **File:** `src/trust/consent-persist.ts`
- **Impact:** Consents cannot be withdrawn via API; only appended
- **Mitigation:** PDPA withdrawal handled by coordinator manually
- **Action:** Add withdrawal endpoint for production

## Fixed Issues

| Issue | Status |
|-------|--------|
| due_date column missing from season_steps | ✅ Fixed |
| approve-estimate.ts dead code | ✅ Fixed |
| Consent persistence docstring wrong | ✅ Fixed |
| Dead validation block in camera-api | ✅ Fixed |
| Typo sfWWaseline → sfWBaseline | ✅ Fixed |
