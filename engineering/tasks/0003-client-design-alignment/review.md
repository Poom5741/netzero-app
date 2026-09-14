# Review — 0003-client-design-alignment

Reviewer: fresh-eyes code review (inspector agent, never saw build session)
Date: 2026-09-12
Round 2 (fixes applied): 2026-09-12 — all Critical and High resolved, 725 tests pass

## Critical (must fix before ship) — ALL RESOLVED ✓

**C1. Sponsor plot detail endpoint has no area scoping — data leakage across sponsors**
`src/routes/sponsor.ts:136-144` — FIXED: area-scoping check added; returns 403 if plot's province not in sponsor's areas.

**C2. Non-photo audit log entries will FK-violate at runtime**
`src/admin/applications.ts:191-198`, `src/routes/admin.ts:440-448` — FIXED: audit INSERTs use NULL for photo_evidence_id; column made nullable in migration.

**C3. CPA code generation race condition**
`src/admin/applications.ts:137-157` — FIXED: wrapped in db.batch() with retry loop (max 3 attempts) on UNIQUE constraint collision.

## High (should fix) — ALL RESOLVED ✓

**H1. N+1 queries in getApplications** — FIXED: single query with correlated subqueries.
**H2. N+1 queries in getPlotsByProvince** — FIXED: batch queries with WHERE plot_id IN (...).
**H3. Missing index on line_links.status** — FIXED: index added.
**H4. 5-role permission matrix** — FIXED: requireRole accepts string|array; DB constraint noted as future migration.

## Suggestion

**S1. getCertificates silently swallows all errors** — log and only swallow "no such table"
**S2. No rate limiting on OTP verification** — consider attempt counter
**S3. rice_age_days fetched but unused in calendar API** — remove or use it

## FYI (confirmed correct)

- Bypass removed: zero references to `password === "bypass"` in src/
- TOTP: correct RFC 6238 with pure-JS HMAC-SHA1, tolerance appropriate
- PDPA consent: 4-type consent properly wired with append-only audit trail
- Session cookie: timingSafeEqual, HttpOnly, SameSite=Lax, Secure
- CalcTrace: correct 12-step T-VER formula decomposition
- Area scoping: all sponsor endpoints except plot detail correctly scoped
