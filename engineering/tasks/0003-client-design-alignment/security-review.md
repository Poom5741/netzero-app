# Security review — Task 0003 · 2026-09-14

## Threat model summary

**Assets:** (1) Farmer PII — name, phone, national ID, address, deed numbers (PDPA-protected); (2) Carbon credit data (fraudulent inflation); (3) Admin/sponsor accounts; (4) LINE user accounts.

**Actors:** Anonymous web visitor, self-registered farmer (LINE), another sponsor, compromised admin, LINE platform (webhook).

**Trust boundaries:** LINE webhook (HMAC-verified), LIFF app (currently unauthenticated), Admin API (session-auth), Sponsor API (session-auth).

## Critical — exploitable now

### S1. Hardcoded "farmer-004" as fallback for all new LINE users
**Actor:** Any LINE user. **Impact:** All new users share one farmer identity, can overwrite each other's data and corrupt carbon calculations.
**Location:** `src/index.ts:214,237,297`
**Fix:** Remove hardcoded fallback. New LINE users stay in pending state until phone-match completes.

### S2. Unauthenticated LIFF API allows acting as any farmer
**Actor:** Any anonymous web visitor. **Impact:** Can submit fertilizer drafts, photo metadata, and documents for any farmer.
**Location:** `src/routes/liff.ts:125-401`
**Fix:** Verify LINE access token server-side; resolve farmer from line_links, not request body.

## High — likely exploitable

### S3. Photo upload has no auth or plot-ownership check
**Actor:** Anonymous. **Impact:** Fabricate photo evidence for any plot, inflating carbon credits.
**Location:** `src/routes/photo.ts:86`
**Fix:** Add auth + ownership verification.

### S4. No rate limiting on login or OTP
**Actor:** Anonymous. **Impact:** Brute-force 6-digit OTP (1M combos, 90s window).
**Location:** `src/routes/auth.ts:84`
**Fix:** Per-IP rate limiting + OTP attempt counter with lockout.

### S5. Sponsor area scoping bypass when areas is null
**Actor:** Sponsor with null/empty areas. **Impact:** Sees all farmer data system-wide.
**Location:** `src/sponsor/dashboard.ts:352`
**Fix:** Return 403 when areas is null for sponsor role.

### S6. Unauthenticated farmer/plot creation endpoints
**Actor:** Anonymous. **Impact:** Create arbitrary records, corrupt database.
**Location:** `src/routes/farmer.ts:15-72`
**Fix:** Add requireRole("admin") middleware.

## Medium — defense-in-depth

### S7. Stored XSS in admin HTML via DB values
**Actor:** Compromised farmer with crafted DB values. **Impact:** Steal admin session.
**Location:** `src/routes/admin.ts:110-124`
**Fix:** Escape all DB-sourced values in HTML responses.

### S8. National ID stored as plaintext (despite _enc column name)
**Actor:** DB breach. **Impact:** All national IDs exposed, PDPA violation.
**Location:** `src/routes/liff.ts:248`
**Fix:** AES-256-GCM encrypt at rest using SECRET env var.

### S9. Farmer PII sent to OpenRouter without DPA
**Actor:** Third-party API. **Impact:** PDPA Section 28 violation.
**Location:** `src/chat/ai.ts:72-78`
**Fix:** Replace farmerName with pseudonymous identifier in AI prompts.

### S10. Session cookies have no expiry
**Actor:** Stolen cookie. **Impact:** Indefinite access.
**Location:** `src/auth/session.ts:18`
**Fix:** Add Max-Age=86400.

### S11. AI prompt injection can fabricate carbon data
**Actor:** Farmer via LINE. **Impact:** Inflate fertilizer rates in carbon calculations.
**Location:** `src/chat/ai.ts`, `src/line/flow.ts:1043-1073`
**Fix:** Validate AI draft data against bounds before saving.

## Info

S12. No CSP/security headers on HTML responses.
S13. Webhook signature bypassed when LINE_CHANNEL_SECRET is empty.
S14. Password verification uses === instead of timingSafeEqual.
S15. Photo IDs use predictable Date.now() + Math.random().

## Pre-existing issues (not introduced by task 0003, but in scope)

S1, S2, S3, S6 are pre-existing architectural gaps. Task 0003 extended the LIFF surface (document upload, registration form) without adding auth, making these reachable through new code paths.

## Fix outcomes (2026-09-14)

| Finding | Status | Notes |
|---------|--------|-------|
| S1 (hardcoded farmer-004) | DEFERRED | Pre-existing architectural issue — needs LIFF auth redesign |
| S2 (unauthenticated LIFF API) | DEFERRED | Pre-existing — needs LINE token verification |
| S3 (unauthenticated photo upload) | DEFERRED | Pre-existing — needs auth + ownership check |
| S4 (no rate limiting) | DEFERRED | Needs KV-based rate limiter design |
| S5 (null areas bypass) | FIXED ✓ | getAreasForRequest returns 403 when areas null |
| S6 (unauth farmer/plot creation) | FIXED ✓ | requireRole(["admin","field"]) added |
| S7 (stored XSS in admin HTML) | DEFERRED | Needs escapeHtml utility |
| S8 (national ID plaintext) | DEFERRED | Needs AES-256-GCM encryption |
| S9 (PII to OpenRouter) | DEFERRED | Needs pseudonymous identifier |
| S10 (no session expiry) | FIXED ✓ | Max-Age=86400 added |
| S11 (AI prompt injection) | DEFERRED | Needs draft validation bounds |
| S12 (no CSP headers) | DEFERRED | Info — hardening suggestion |
| S13 (webhook bypass when secret empty) | DEFERRED | Info |
| S14 (password === timingSafeEqual) | FIXED ✓ | Constant-time comparison |
| S15 (predictable photo IDs) | FIXED ✓ | crypto.randomUUID() |
