# Plan — Client Design Alignment

Build sequence: **01 → 02 → [03–06 ‖ 07–10 ‖ 11] → 12**

Foundation first (DB + auth), then three surface streams in parallel (LINE OA ‖ Admin ‖ Sponsor), then integration + deploy.

---

### Task 01 — DB schema additions
Goal:        Add all new tables/columns needed by the three surfaces so later tasks have a stable data foundation.
Consumes:    spec.md (Data model section), migrate.sql (existing schema)
Produces:    New entries in src/db/migrate.sql: application_documents table, widened audit_log columns (entity_type, entity_id, field_name, old_value, new_value), sponsor area scoping on users table (sponsor_id, areas JSON), consent_log enforcement (4-type check constraint)
Acceptance:  `bun test` passes; new tables/columns exist after migration; existing tests unaffected
Shape:       src/db/migrate.sql additions only — no new files, no abstraction layer
Size:        S
Status:      done

### Task 02 — Auth system (admin OTP + sponsor login + role middleware)
Goal:        Implement real authentication for admin (email+password+OTP) and sponsor (email+password+optional OTP) with role-based middleware; remove the `password === "bypass"` dev check.
Consumes:    Task 01 (users table with sponsor_id), existing routes/auth.ts
Produces:    POST /api/auth/login (with OTP verification), role middleware (requireRole('admin'|'sponsor'|'verifier'|'field'|'auditor')), session management; all admin/sponsor routes protected
Acceptance:  Login flow works in browser (admin + sponsor); bypass check removed; unauthenticated requests to /api/admin/* and /sponsor/* return 401; unit tests for auth + role middleware
Shape:       src/routes/auth.ts (modify), src/middleware/auth.ts (new), frontend admin/login + sponsor login pages (modify)
Size:        M
Status:      done

### Task 03 — LINE OA: PDPA 4-consent + project conditions (OB-15, OB-05)
Goal:        Wire the 4-type PDPA consent flow (CS-01..CS-04) and 3-project-conditions acceptance into the LINE chat flow, gating progression until all accepted.
Consumes:    Task 01 (consent_log table), existing flow.ts consent state, consent-persist.ts module, flex-builders.ts
Produces:    OB-15 state renders 4-checkbox flex card; each checkbox acceptance recorded via recordConsent(); OB-05 state renders 3-condition card with tick-accept; chat blocked from progressing to phone/registration until hasAllConsents() returns true
Acceptance:  LINE chat flow: friend-add → OB-01 → tap "ผูกบัญชี" → OB-15 renders 4 checkboxes → accept → OB-02 phone share; test: consent_log has 4 rows after acceptance; test: progression blocked without full consent
Shape:       src/line/flow.ts (modify states), src/line/flex-builders.ts (new builders: buildConsent4Checkbox, buildConditionsCard), src/trust/consent-persist.ts (already exists, wire into flow)
Size:        M
Status:      done

### Task 04 — LINE OA: Registration form + document upload
Goal:        Align LIFF registration form (LF-01) fields to artifact spec (R-01..R-14, deed types, holding status, multi-deed, GPS map) and wire document upload (OB-13/LiffDocs).
Consumes:    Task 01 (application_documents table), existing frontend/src/app/upload/ (partial), src/liff/documents-api.ts (unrouted)
Produces:    LF-01 form with all artifact fields (2-step wizard: personal info + deed registry); LiffDocs page with 3-document checklist and submit-gate; application_documents rows created on submit
Acceptance:  LIFF registration form renders all R-01..R-14 fields; deed type select has 3 options; holding status select has 4 options; GPS map widget captures plot center; document upload creates application_documents rows; submit blocked until 3 docs attached; unit tests for form validation + document submission
Shape:       frontend/src/app/register/ (new LIFF page), src/liff/documents-api.ts (modify, wire route), src/routes/liff.ts (add /register and /docs routes)
Size:        L → split: 04a (form fields), 04b (document upload). Keeping as one task since form submit triggers document flow.
Status:      done

### Task 05 — LINE OA: Rich menu + calendar real data + results real data
Goal:        Implement LINE rich menu (6 items), replace hardcoded calendar with real season_steps data, and replace hardcoded results zeros with real carbon_estimates data.
Consumes:    Task 01 (season_steps, carbon_estimates tables), existing flow.ts calendar/results states, flex-builders.ts
Produces:    Rich menu registered via LINE Messaging API with 6 postback items; calendarSteps() queries season_steps table and computes due dates from sow_date + rice_age_days; handleResults() queries carbon_estimates + photo_evidence for real values
Acceptance:  Rich menu visible in LINE app with 6 items; calendar shows real step dates from season_steps; results page shows real tCO2eq and photo count; unit tests for calendar query + results query
Shape:       src/line/rich-menu.ts (new), src/line/flow.ts (modify calendarSteps + handleResults), src/line/flex-builders.ts (modify buildCalendarBubble + buildDashboardBubble to accept dynamic data)
Size:        M
Status:      done

### Task 06 — LINE OA: Remaining chat states
Goal:        Implement rejection flow (PJ-09), pending tasks (RP-01), my-plots (LiffFields), and contact page (LiffContact).
Consumes:    Tasks 03-05 (PDPA, registration, calendar, results), existing flow.ts, plot-selection.ts (unrouted)
Produces:    PJ-09 shows rejection reason + resubmission deadline + "ถ่ายใหม่" button; RP-01 queries incomplete photos + unfilled retrospective seasons; LiffFields wired into LIFF route showing per-plot cards; LiffContact shows coordinator info
Acceptance:  Rejection message shows admin's reason text; pending tasks list shows real incomplete items; my-plots page renders plot cards with photo progress; contact page shows coordinator details; unit tests for each state
Shape:       src/line/flow.ts (modify PJ-09, RP-01 states), src/liff/plot-selection.ts (wire route), frontend/src/app/contact/ (new page)
Size:        M
Status:      done

### Task 07 — Admin: Console shell + overview screen
Goal:        Build the admin console shell (sidebar + topbar) and overview dashboard (KPIs, work queue alerts, credit chart, GHG source table, province table, filter bar).
Consumes:    Task 02 (auth + role middleware), spec.md (overview section)
Produces:    /admin renders console shell with 7-section sidebar; overview screen shows 4 KPI tiles, work queue (pending apps, photo queue, missing photos, SF_w fallback), credit bar chart, GHG emission source table, province/sponsor table; filter bar (season/province/tambon/sponsor)
Acceptance:  Admin login → console shell renders with sidebar nav; overview shows real KPI data from DB; filter bar filters data; unit tests for KPI queries
Shape:       frontend/src/app/admin/layout.tsx (new shell), frontend/src/app/admin/page.tsx (modify to overview), src/routes/admin.ts (new overview API endpoints)
Size:        L → acceptable as one task since shell + overview are tightly coupled
Status:      done

### Task 08 — Admin: Application review (real data)
Goal:        Connect the application review queue to real data (line_links + farmers + application_documents) and implement approve/reject actions with CPA code generation.
Consumes:    Tasks 01-02 (application_documents table, auth), existing line_links + farmers tables
Produces:    /admin/applications shows real pending applications with document checklist, consent status, farmer detail; approve action generates CPA code (SY-07) and transitions status to active; reject action with reason
Acceptance:  Application queue shows real pending line_links; approve generates CPA code in farmers table; document checklist shows DOC-01/03/06 status from application_documents; unit tests for approve + reject + CPA generation
Shape:       frontend/src/app/admin/applications/ (new page), src/routes/admin.ts (new application endpoints)
Size:        M
Status:      done

### Task 09 — Admin: Farmer detail 5-tab panel
Goal:        Build the farmer detail slide-out panel with 5 tabs: Plots & Documents, Credit Calculation (CalcTrace), Nitrogen Source, Photo Evidence, Audit Log.
Consumes:    Tasks 01-02 (audit_log, application_documents), existing farmer/plot/season/photo tables
Produces:    Clicking a farmer row opens slide-out with 5 tabs; CalcTrace shows 12-step formula with SF_w/SF_p/SF_o factors; nitrogen table shows fertilizer applications; photo grid shows WET-1/DRY-1/WET-2/DRY-2 status; audit log shows edit history
Acceptance:  Farmer detail panel opens; all 5 tabs render with real data; CalcTrace shows correct formula steps; photo grid shows correct approval statuses; unit tests for CalcTrace data aggregation
Shape:       frontend/src/app/admin/farmers/ (new page with detail panel), src/routes/admin.ts (farmer detail endpoint)
Size:        L
Status:      done

### Task 10 — Admin: Sponsors + settings + reports
Goal:        Implement sponsors management, settings (5 tabs), and reports catalogue screens.
Consumes:    Tasks 01-02 (users table with sponsor_id, auth), spec.md (sponsors/settings/reports sections)
Produces:    /admin/sponsors shows sponsor cards with area/permission editing; /admin/settings shows 5-tab settings (access permissions matrix, user accounts CRUD, calculation constants, notification rules, general); /admin/reports shows 6-report catalogue with download + audit logging
Acceptance:  Sponsors page shows sponsor cards; settings page renders all 5 tabs; reports page lists 6 exports; download triggers audit log entry; unit tests for permission matrix + report download
Shape:       frontend/src/app/admin/sponsors/ (new), frontend/src/app/admin/settings/ (new), frontend/src/app/admin/reports/ (new), src/routes/admin.ts (new endpoints)
Size:        L
Status:      done

### Task 11 — Sponsor portal (full surface)
Goal:        Build the complete sponsor portal: login, overview with KPIs + filter bar + charts, areas screen with per-plot detail, reports/certificates screen.
Consumes:    Tasks 01-02 (auth, sponsor area scoping), spec.md (sponsor sections)
Produces:    /sponsor login page; /sponsor overview with verified credits hero, area KPIs, seasonal credit chart, GHG source table, progress bars, impact metrics; /sponsor/areas with per-province sub-plot DataTable + photo gallery; /sponsor/reports with EX-2042 download + certificate listing; PDPA CS-02 notice on every screen
Acceptance:  Sponsor login works with area scoping; overview shows correct KPIs for assigned areas only; areas table shows all sub-plots with photo indicators; reports page shows EX-2042 downloadable; certificates display real TVER data; PDPA notice visible on every page; unit tests for area-scoped queries
Shape:       frontend/src/app/sponsor/ (modify existing pages), src/routes/sponsor.ts (modify + add auth + certificates endpoint)
Size:        L
Status:      done

### Task 12 — Integration tests + browser verification + deploy
Goal:        Run full integration test suite, browser-verify all three surfaces in production, and deploy.
Consumes:    Tasks 01-11 (all surfaces built)
Produces:    Integration test covering LINE registration → activation → first photo flow; browser screenshots of admin overview, application review, farmer detail, sponsor overview, areas, reports; production deploy to workers.dev
Acceptance:  `bun test` passes (all new + existing tests); LINE flow verified in real LINE app; admin pages render correctly in browser; sponsor pages render correctly in browser; deploy succeeds to workers.dev
Shape:       tests/ (new integration tests), no new production code
Size:        M
Status:      todo

---

## Dependency graph

```
01 (DB) → 02 (Auth) → [03, 04, 05, 06]  (LINE OA stream)
                   → [07, 08, 09, 10]   (Admin stream)
                   → [11]                (Sponsor stream)
                                      → 12 (Integration + deploy)
```

## Parallelization opportunity

After tasks 01+02 complete, three worker agents can run in parallel:
- **Agent A**: LINE OA stream (tasks 03 → 04 → 05 → 06, sequential within stream)
- **Agent B**: Admin stream (tasks 07 → 08 → 09 → 10, sequential within stream)
- **Agent C**: Sponsor stream (task 11, standalone)

## Architectural decisions (for decisions.md)

1. **Auth approach**: OTP via TOTP (authenticator app) for admin accounts seeing PII; optional for sponsor accounts (CS-02 hides PII). Session-based auth via cookie (matching existing pattern).
2. **Audit log widening**: extend automation_audit_log with entity_type/entity_id/field_name/old_value/new_value rather than creating a new table — the existing table already has the right indexes and the photo audit data stays in one place.
3. **CPA code generation**: sequential CPA#### codes assigned on application approval, stored in farmers.cpa_code column. Sub-plot codes are F## suffixes (CPA1001/F01, /F02…).
4. **CalcTrace**: client-side computation from fetched plot+season data, not a new backend endpoint — the computePlotSeason function already exists in the sponsor artifact and can be adapted.
