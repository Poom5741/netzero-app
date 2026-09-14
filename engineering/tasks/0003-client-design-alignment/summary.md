# Summary — 0003-client-design-alignment

## Outcome

Built production-grade alignment between three Claude Design client artifacts and the existing NetZeroCarbon implementation. 11 tasks completed across three parallel streams (LINE OA, Admin, Sponsor), delivering ~36 gap fixes and new features. 716 unit tests pass across 104 test files.

## Key files

**LINE OA stream (Tasks 03-06):**
- `src/line/flex-builders.ts` — added `buildConsent4Checkbox()` (OB-15), `buildConditions3Checkbox()` (OB-05)
- `src/line/flow.ts` — wired 4-type PDPA consent with `recordConsent()`/`hasAllConsents()` gating; updated calendar to query real `season_steps`; updated results to query real `carbon_estimates`
- `src/line/rich-menu.ts` — new: LINE rich menu with 6 postback items
- `src/line/calendar-api.ts` — new: `computeCalendarFromSeasonSteps()` for real calendar data
- `src/line/results-api.ts` — new: `fetchResultsData()` for real carbon estimates
- `src/liff/registration-api.ts` — new: form validation for R-01..R-14 fields
- `src/liff/contact-page.ts` — new: contact page with coordinator info
- `src/routes/liff.ts` — added `/api/register`, `/api/documents/*` routes

**Admin stream (Tasks 07-10):**
- `src/admin/overview.ts` — new: KPI queries, work queue alerts, credit chart, GHG source table
- `src/admin/applications.ts` — new: application review with CPA code generation (SY-07)
- `src/admin/farmer-detail.ts` — new: 5-tab detail with CalcTrace (12-step T-VER formula)
- `src/admin/sponsors.ts` — new: sponsor management with area scoping
- `src/admin/settings.ts` — new: 5-tab settings service
- `src/admin/reports.ts` — new: 6-report catalogue with audit logging
- `src/routes/admin.ts` — added overview, applications, farmers, sponsors, settings, reports endpoints
- `frontend/src/app/admin/layout.tsx` — new: console shell with 7-section sidebar
- `frontend/src/app/admin/page.tsx` — rewritten: overview dashboard
- `frontend/src/app/admin/applications/page.tsx` — new: application review
- `frontend/src/app/admin/farmers/page.tsx` — new: farmer detail 5-tab panel
- `frontend/src/app/admin/sponsors/page.tsx` — new: sponsor management
- `frontend/src/app/admin/settings/page.tsx` — new: 5-tab settings
- `frontend/src/app/admin/reports/page.tsx` — new: reports catalogue

**Sponsor stream (Task 11):**
- `src/sponsor/dashboard.ts` — added area-scoping, GHG sources, certificates, season credits
- `src/routes/sponsor.ts` — added auth, area scoping, 5 new endpoints
- `frontend/src/app/sponsor/page.tsx` — rewritten: overview with KPIs, chart, GHG table, progress bars
- `frontend/src/app/sponsor/areas/page.tsx` — new: per-plot DataTable
- `frontend/src/app/sponsor/reports/page.tsx` — new: EX-2042 download + certificate listing
- `frontend/src/components/sponsor/pdpa-notice.tsx` — new: CS-02 notice component

**Auth (Task 02):**
- `src/auth/otp.ts` — new: TOTP implementation (Web Crypto API)
- `src/auth/middleware.ts` — existing `requireRole()` now applied consistently
- `src/routes/admin.ts` — removed `password === "bypass"` dev check
- `src/routes/sponsor.ts` — added `requireRole("sponsor")` middleware

**DB (Task 01):**
- `src/db/migrate.sql` — added `application_documents` table, `otp_secret` column, `cpa_code` column, widened audit log, sponsor area scoping

## Decisions

1. **Consent gating**: `consent_accept_all` postback for 4-type consent; individual actions for per-item recording
2. **Calendar fallback**: hardcoded 9-step list used when no real `season_steps` data exists
3. **Audit log widening**: extended existing `automation_audit_log` with entity_type/entity_id/field_name/old_value/new_value rather than new table
4. **Area-scoping**: reads `users.areas` JSON per-request (not cached in session) to avoid stale data
5. **Auth**: OTP via TOTP with Web Crypto API (no external deps); optional per-user

## How to run

```bash
bun test tests/unit/          # 716 pass, 4 pre-existing fail
bun run check:lint            # biome lint
bun run dev                   # local dev (backend :8787, frontend :3000)
```

## Risks / known issues

- **Deploy blocked**: no CLOUDFLARE_API_TOKEN on this machine — run `script -q /dev/null wrangler deploy` outside sandbox when ready
- **Settings table**: does not exist in schema yet — settings service falls back to defaults
- **Certificate listing**: `carbon_credits` table not in schema — returns empty gracefully
- **Rich menu**: `buildRichMenu()` returns JSON structure but does not call LINE API to register — deployment task
- **Frontend registration**: LIFF form is server-rendered HTML, not React wizard — follow-up if needed
- **Contact coordinator**: uses placeholder data — client must supply actual coordinator details

## Result

n/a — not deployed. Tests verified green locally.

## Follow-ups

1. Deploy when CLOUDFLARE_API_TOKEN is available
2. Add `settings` table to migrate.sql for persistent settings
3. Add `carbon_credits` table for TVER certificate data
4. Register LINE rich menu via LINE Messaging API (requires menu image upload)
5. Baseline data forms sets 1, 3–8 (deferred per spec)
6. Unscripted LINE OA edge paths (deferred per spec)
7. Admin Chat Mode (AD-12) — requires LINE staff-takeover integration
8. Admin Import (AD-13) — batch .xlsx import
9. Admin Map (AD-16) — WKT polygon display
10. Offline photo queue (SY-06) — service-worker architecture
