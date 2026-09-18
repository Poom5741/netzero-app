# Handoff: LIFF URL Configuration Defect — RESOLVED

**Date:** 2026-09-18  
**Priority:** HIGH (blocks photo upload flow)  
**Stage:** ✅ RESOLVED  
**Resolution Date:** 2026-09-18  
**Deploy:** `ccc001b6` (2026-09-18 02:50 UTC)

---

## Problem Statement

**Observed Evidence:**
- During full flow manual review (Step 6), photo upload flow is blocked
- LINE OA sends LIFF registration URL: `https://netzero-carbon-poc.poom-a1d.workers.dev/?liff.state=%2Fregister`
- This URL returns HTTP 404
- LIFF registration form cannot load in LINE in-app browser
- Photo upload flow cannot proceed without completed registration

**Root Cause Analysis:**
- ❌ **Initial hypothesis (INCORRECT):** LIFF endpoint in LINE Developer Console points to wrong URL
- ✅ **Actual root cause:** Registration form HTML doesn't exist anywhere in the codebase
  - Frontend has no `/register` route (only `/admin`, `/sponsor`, `/chat`, `/upload`, etc.)
  - Backend has `/liff/` (chat) and `/liff/camera` but no `/liff/register`
  - Flex Message constructs `https://liff.line.me/{liffId}/register` but no handler exists
  - The handoff's claim that "frontend has /register route" was false

**Resolution:**
- Added `GET /liff/register` route to backend Worker (`src/routes/liff.ts`)
- Serves inline HTML registration form (same pattern as chat/camera pages)
- Form includes all required fields: personal info, address, land details
- Submits to existing `POST /liff/api/register` endpoint
- Added root-level `/register` redirect to `/liff/register` for LIFF deep-link compatibility
- No LINE Developer Console changes needed

---

## Impact Assessment

**Blocked Flows:**
1. ❌ Photo upload via LINE OA (Step 6 in full flow review)
2. ❌ Camera LIFF integration
3. ❌ GPS/time-aware evidence capture

**Working Flows:**
1. ✅ Admin farmer registration (Steps 1-5)
2. ✅ LINE OA webhook and consent flow
3. ✅ Phone number recognition and validation
4. ✅ LIFF registration form (when accessed directly)
5. ✅ Sponsor dashboard
6. ✅ Admin applications page

---

## Implementation

**Files Changed:**
1. `src/routes/liff.ts` — Added `GET /register` route (170 lines of inline HTML)
2. `src/index.ts` — Added root-level `/register` redirect
3. `tests/unit/liff-register-route.test.ts` — Added regression tests

**Registration Form Features:**
- Thai language UI matching project design tokens
- All required fields from `RegistrationFormData` interface
- LIFF SDK integration for user profile resolution
- Client-side validation (phone format, national ID length)
- Submits to `/liff/api/register` (existing endpoint)
- Success/error feedback
- Mobile-responsive design

**Verification:**
```bash
# /register now redirects to /liff/register
curl -I 'https://netzero-carbon-poc.poom-a1d.workers.dev/register'
# HTTP/2 302, location: /liff/register

# /liff/register returns registration form
curl -I 'https://netzero-carbon-poc.poom-a1d.workers.dev/liff/register'
# HTTP/2 200, content-type: text/html

# Form contains all required fields
curl -s 'https://netzero-carbon-poc.poom-a1d.workers.dev/liff/register' | grep -c 'full_name\|addr_province\|deed_no'
# 18 matches
```

---

## Verification Steps

✅ **Completed:**

1. **Unit Tests:** 3/3 pass
   - Route returns 200 with HTML
   - Form includes LIFF SDK
   - Form submits to correct endpoint

2. **Integration Tests:** 850/850 pass (no regressions)

3. **Type Check:** Clean

4. **Lint:** Clean

5. **Production Deploy:** `ccc001b6` deployed successfully

6. **Endpoint Verification:**
   - `/register` → 302 redirect to `/liff/register`
   - `/liff/register` → 200 with registration form
   - Form HTML contains all required fields

**Remaining Manual Verification:**
- [ ] Test in LINE OA: send "สมัคร" → verify registration link works
- [ ] Complete registration form in LINE in-app browser
- [ ] Verify registration data saves to database
- [ ] Test photo upload flow after registration
- [ ] Verify GPS coordinates captured (if available)
- [ ] Verify AI screening result displays correctly

---

## Dependencies & Unknowns

**Known:**
- Frontend Pages URL: `https://1484e21b.netzero-frontend.pages.dev`
- Backend Worker URL: `https://netzero-carbon-poc.poom-a1d.workers.dev`
- LIFF app ID: `2011183008-7bEomfVF` (from memory)
- LIFF registration form exists at frontend `/register` route

**Unknowns:**
- Who has access to LINE Developers Console?
- Are there other LIFF endpoints that need updating?
- Will changing the LIFF URL break other flows?
- Is there a staging/test LIFF app that should also be updated?

**Assumptions:**
- Frontend Pages deployment is stable and won't change URL
- LIFF registration form at `/register` route is functional
- No other LIFF deep-links are broken

---

## Related Documentation

- Full flow review: `tests/verification/admin-registration-verification-2026-09-18.md`
- LIFF integration spec: `specs/007-hybrid-test-pyramid/spec.md`
- LINE OA requirements: `REQUIREMENTS.md` (Section 1)
- Deployment URLs: Memory entry `netzero-deploy-urls.md`

---

## Success Criteria

- [x] LIFF registration URL returns HTTP 200 ✅
- [x] Registration form includes all required fields ✅
- [x] Form submits to existing API endpoint ✅
- [x] Unit tests pass ✅
- [x] No regression in other LINE OA flows ✅
- [ ] Photo upload flow completes end-to-end in LINE OA (pending manual test)
- [ ] GPS coordinates captured (if available) (pending manual test)
- [ ] AI screening result displays correctly (pending manual test)

---

## Next Session Checklist

1. [x] ~~Confirm access to LINE Developers Console~~ (not needed)
2. [x] ~~Update LIFF endpoint URL to frontend Pages URL~~ (not needed)
3. [x] ~~Test LIFF registration URL directly~~ ✅
4. [ ] Test photo upload flow in LINE OA (real device)
5. [x] ~~Verify no regression in other flows~~ ✅ (850 tests pass)
6. [ ] Update deployment documentation if needed
7. [ ] Mark Step 6 as PASS in verification log (after manual test)

**Lessons Learned:**
- Always verify assumptions before implementing fixes
- The handoff's "frontend has /register route" claim was false
- Backend inline HTML pages (chat/camera) are the correct pattern for LIFF
- Root-level redirects handle LIFF deep-link compatibility

---

**Handoff Created By:** Manual review session (2026-09-18)  
**Resolved By:** Automated fix session (2026-09-18)  
**Status:** ✅ RESOLVED — Ready for manual verification in LINE OA
