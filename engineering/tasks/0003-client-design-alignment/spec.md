# Client Design Alignment — Gap Analysis & Build

## Objective

Reconcile three Claude Design client artifacts (LINE OA farmer flow, Admin Console, Sponsor Portal) against the current production implementation and build the gaps, bringing all three surfaces to production-grade parity with the client's design spec.

## Build ambition

Production-grade. Edge cases, validation, error states, and a `harden` pass before release.

## Success criteria

1. **LINE OA chat**: all 15 scripted states (OB-01..OB-11, PJ-00..PJ-13, RP-01..RP-04) render correctly with exact flex-card copy, buttons, and transitions from the artifact. Zero hardcoded farmer IDs or season IDs. PDPA 4-consent flow (CS-01..CS-04) wired end-to-end (consent_log written, `hasAllConsents()` checked). Calendar seeded from actual `season_steps` data, not hardcoded. Results page shows real `carbon_estimates` data, not zeros.
2. **Admin Console**: photo review queue matches artifact column set and vocabulary. Application review queue functional (not MOCK). Farmer detail panel shows 5-tab layout with credit calculation trace (CalcTrace), nitrogen source table, photo evidence grid, and audit log. Settings screen with 5 tabs operational. All admin actions audit-logged.
3. **Sponsor Portal**: login with real authentication. Overview shows correct KPIs scoped to sponsor's assigned areas. Areas screen shows per-plot detail with photo evidence indicators. Reports screen allows download of EX-2042. Certificate listing displays real data. PDPA CS-02 notice on every screen. All data scoped to sponsor's `areas` array.
4. **DB schema**: all new tables/columns needed by the three surfaces are added via `migrate.sql` additions (not modifications to existing columns).
5. **Tests**: all new routes and business logic have unit tests (Vitest). Integration test covers the full LINE OA registration → activation → first photo submission flow. Admin review approval triggers correct SF_w recalculation (verified by test).
6. **Deploy**: all changes deploy to workers.dev and render correctly in LINE, admin browser, and sponsor browser (browser-verified).

## Scope

### What this task covers (gap-focused)

**LINE OA — gaps against artifact:**

| Gap | Current state | What's needed |
|-----|---------------|---------------|
| PDPA 4-consent (CS-01..CS-04) | Chat flow only checks single "accept"; `consent-persist.ts` module exists but unused | Wire `handleConsent()` to render 4-checkbox flex card (OB-15), call `recordConsent()` for each, gate on `hasAllConsents()` before phone share |
| Project conditions (CS-02..CS-04 acceptance) | Not implemented | Add OB-05 state: flex card with 3 checkbox conditions, all must be accepted before registration |
| Identity confirmation (OB-03) | Basic phone match exists | Enhance: show matched farmer name + district, "ใช่/ไม่ใช่" buttons, "ไม่ใช่" = unregistered path (log and re-prompt) |
| Registration form (LF-01) | Exists but needs field alignment | Align fields to artifact: R-01..R-14, deed type select, holding status select, multi-deed support, GPS map widget for plot center |
| Document upload (OB-13/LiffDocs) | `documents-api.ts` exists but unrouted | Wire into LIFF route; 3-document checklist (DOC-01, DOC-03, DOC-06), submit blocked until all attached |
| Rich menu (6 items) | Not implemented | Implement LINE rich menu with 6 postback items (BL_HOME, SEASON_HOME, TODO, FIELD_LIST, SUMMARY, CONTACT) |
| Calendar step seeding | `calendarSteps()` returns hardcoded static data | Query `season_steps` table; show real due dates computed from sow_date + rice_age_days |
| Results page real data | `handleResults()` passes hardcoded zeros | Query `carbon_estimates` and `photo_evidence` tables for real values |
| Photo status display (PJ-08) | Basic | Show per-round approval status grid (WET-1/DRY-1/WET-2/DRY-2) with approval badges |
| Rejection flow (PJ-09) | Basic | Show rejection reason from admin, resubmission deadline, "ถ่ายใหม่" button |
| Pending tasks (RP-01) | Not implemented | Query incomplete photos + unfilled retrospective seasons, display as task list |
| My dashboard (LiffSummary) | Partially exists | Add 3-tab layout (Results / Credit / Photos), progress bars, credit formula explanation, photo grid |
| My plots (LiffFields) | `plot-selection.ts` exists but unrouted | Wire into LIFF route; show per-plot cards with photo progress, variety, area |
| Contact / poor-signal mode (LiffContact) | Not implemented | Build contact page with coordinator info, 2-min video placeholder, offline queue status (SY-06) |
| Offline photo queue (SY-06) | Not implemented | Implement service-worker or localStorage queue with auto-upload on reconnect |
| Baseline forms (BL-01..BL-15) | Only set 2 built | **Deferred** — sets 1, 3–8 remain placeholders |
| Unscripted edge paths | Not implemented | **Deferred** — OB-03 "ไม่ใช่", PJ-00 "ยังไม่ได้หว่าน", "ขอดูวิธีถ่าย", "ยังไม่ได้ทำ" |

**Admin Console — gaps against artifact:**

| Gap | Current state | What's needed |
|-----|---------------|---------------|
| Login with real auth | Dev bypass exists | Implement OTP-based login per artifact spec (email + password + OTP for PII accounts) |
| Console shell / sidebar | Not implemented | 7-section sidebar nav with badges, topbar with avatar/name/role/logout |
| Overview screen (AD-08/AD-17) | Not implemented | 4 KPI tiles, work queue alerts, credit bar chart, GHG source table, province/sponsor table; filter bar (season/province/tambon/sponsor) |
| Charts screen | Not implemented | Gauge, donut, bubble, treemap, bar charts; export image button. **Phase 2** — chart library integration |
| Application review (AD-10) | MOCK (4 sample rows) | Connect to real `line_links` + `farmers` data; show per-application detail with document checklist, consent status; approve/reject actions with CPA code generation (SY-07) |
| Chat mode (AD-12) | Not implemented | **Phase 2** — requires LINE Messaging API staff-takeover integration |
| Farmer detail 5-tab panel | Basic listing only | Implement: Plots & Documents tab, Credit Calculation tab (CalcTrace component, 12-step formula display), Nitrogen Source tab, Photo Evidence tab, Audit Log tab |
| Sponsors management (F-65) | Not implemented | Sponsor cards, visibility scope checkboxes, "preview as client" action |
| Import (AD-13) | Not implemented | **Phase 2** — .xlsx/.csv upload, 21-column validation, dry-run preview |
| Map (AD-16) | Not implemented | **Phase 2** — WKT polygon display on map |
| Reports (AD-07) | Not implemented | 6-report catalogue, submission readiness panel, download with audit logging |
| Settings (5 tabs) | Not implemented | Access permissions matrix, user accounts CRUD, calculation constants with versioning, notification rules, general project config |
| Audit logging (AD-11) | Partial (`automation_audit_log` exists for photos) | Extend to all admin view/edit actions with before/after values |
| Role-based access (5 roles) | Basic admin/sponsor split | Implement 5-role permission matrix (admin/verifier/field/sponsor/auditor) with PDPA-locked rows |

**Sponsor Portal — gaps against artifact:**

| Gap | Current state | What's needed |
|-----|---------------|---------------|
| Login with auth | No auth at all | Implement email + password + optional OTP login; scope data to sponsor's `areas` |
| PDPA CS-02 notice | Not present | Display mandatory notice on every screen |
| Overview KPIs | Basic KPIs exist | Align to artifact: verified credits hero card, supported area (rai), beneficiary households (CPA-counted); seasonal credit bar chart with estimate vs verified; GHG source breakdown table; progress bars (sowing date, photos, input data); impact metrics (methane reduction %, water saved %, fuel increase, fertilizer unchanged) |
| Filter bar | Not implemented | Season, province, tambon, comparison baseline (previous season / 3-year baseline / project average) |
| Areas screen | Not implemented | Per-province sections with sub-plot DataTable (CPA, plot, rai, rice, photos 4-pill, SF_w, ER); photo gallery section (CU-02, de-identified) |
| Reports screen | Not implemented | Downloadable report list (EX-2042 only for sponsor); issued certificate listing (TVER IDs, season, volume, status, date) |
| Certificate display | Not implemented | Show issued TVER certificates with status badges (คงเหลือในบัญชี / ยกเลิกเพื่อชดเชยแล้ว / รอทวนสอบ) |

### Not doing (this task)

- Baseline data forms sets 1, 3–8 (placeholder in artifact — separate workstream)
- Unscripted LINE OA edge paths: OB-03 "ไม่ใช่" mismatch, PJ-00 "ยังไม่ได้หว่าน" / "ปีนี้ไม่ได้ปลูก", "ขอดูวิธีถ่าย" how-to, "ยังไม่ได้ทำ" skip
- Admin Chat Mode (AD-12) — requires LINE Messaging API staff-takeover, is phase 2
- Admin Import (AD-13) — batch .xlsx import is phase 2
- Admin Map (AD-16) — WKT polygon map display is phase 2
- Admin Charts screen — chart library integration is phase 2
- Sponsor certificate retirement workflow — admin-only function
- How-to video asset — client has not supplied the video file
- Multi-crop scheduling when farmer has several plots with different seeding dates
- LINE OA offline photo queue (SY-06) — complex service-worker work; defer to follow-up
- Notification cron rules (6 rules) — separate system; defer to follow-up
- Calculation constant versioning UI — settings Tab 3 is phase 2

## Data model & contracts

### New tables (additions to migrate.sql)

```sql
-- Application documents (OB-13)
CREATE TABLE IF NOT EXISTS application_documents (
  id TEXT PRIMARY KEY,
  farmer_id TEXT NOT NULL REFERENCES farmers(id),
  doc_type TEXT NOT NULL, -- DOC-01, DOC-03, DOC-06, DOC-07
  r2_key TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  reviewed_at TEXT,
  review_status TEXT DEFAULT 'pending', -- pending / approved / rejected
  UNIQUE(farmer_id, doc_type)
);

-- 4-type consent log (OB-15, CS-01..CS-04)
-- consent_log table already exists; ensure 4 types are enforced:
-- pdpa, data_collection, photo_sharing, carbon_project

-- Admin audit log (AD-11) — extend automation_audit_log scope
-- Add: entity_type, entity_id, field_name, old_value, new_value
-- Current table already has photo_evidence_id + action; widen to general CRUD

-- Sponsor accounts with area scoping
-- users table exists; add: sponsor_id TEXT, areas TEXT (JSON array of province names)

-- Application queue view
-- Derive from line_links (status='pending') + farmers + application_documents
```

### API contracts (new routes)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/admin/applications` | List pending applications with doc counts |
| POST | `/api/admin/applications/:id/approve` | Approve application, generate CPA code |
| POST | `/api/admin/applications/:id/reject` | Reject with reason |
| GET | `/api/admin/farmers/:id` | Farmer detail with 5-tab data |
| GET | `/api/admin/farmers/:id/audit` | Audit log for farmer |
| POST | `/api/admin/settings` | Read/write settings |
| GET | `/api/sponsor/me` | Authenticated sponsor profile + areas |
| GET | `/api/sponsor/plots` | Plots scoped to sponsor's areas |
| GET | `/api/sponsor/certificates` | TVER certificates for sponsor's area |
| GET | `/api/sponsor/reports/:id/download` | Download report file |

### Status vocabularies (canonical — FE and DB must match)

| Entity | Key | Thai label | DB value |
|--------|-----|------------|----------|
| Photo review | approved | อนุมัติ | `admin_status = 'verified'` |
| Photo review | rejected | ตีกลับ | `admin_status = 'rejected'` |
| Photo review | pending | รอตรวจ | `admin_status = 'pending'` |
| Application | ready | พร้อมอนุมัติ | computed: all docs present |
| Application | incomplete | เอกสารไม่ครบ | computed: missing docs |
| Application | pending | รอสัญญาเช่า | computed: lease doc missing |
| Evidence | complete | หลักฐานครบ | photos == needed |
| Evidence | incomplete | หลักฐานไม่ครบ — ถอย SF_w | fallback applied |
| Evidence | collecting | กำลังเก็บหลักฐาน | in progress |
| Certificate | available | คงเหลือในบัญชี | verified, not retired |
| Certificate | retired | ยกเลิกเพื่อชดเชยแล้ว | retired/compensated |
| Certificate | pending | รอทวนสอบ | estimated, not yet verified |

## Constraints & assumptions

- **Stack constraint**: Cloudflare Workers (no Node.js fs/stream), D1 (SQLite), R2, Hono, Next.js 16.3 static export, LIFF
- **Auth**: admin uses email+password+OTP; sponsor same; farmer uses LINE userId (no password)
- **PDPA**: national ID encrypted at rest, displayed last-4 only; CPA code replaces names in all sponsor/export views
- **Credit methodology**: T-VER-P-METH-13-08, Approach 3, U_d=15%, CF=0.89 (baseline only)
- **LINE API**: flex messages, quick replies, postbacks, rich menu, LIFF deep-links, phone number share
- **Design system**: client's own NZC design system (extracted from artifacts); reuse component patterns already in `flex-builders.ts`
- **One-season-at-a-time**: each plot has one active season; rice variety re-declared per season
- **Photo evidence**: only system-camera photos valid (LF-04); GPS + timestamp mandatory; chat submissions rejected (SY-03)

## Risks & open questions

| Risk | Impact | Mitigation |
|------|--------|------------|
| Admin auth bypass (`password === "bypass"`) in production code | Security: anyone can bypass admin login | Must remove bypass check before this task ships; add `harden` phase gate |
| No auth on sponsor API endpoints | Data exposure: any visitor can query sponsor data | Implement auth middleware before sponsor portal work |
| `seasons` table vs `season_inputs` table confusion | Data integrity: queries may return empty/wrong data | Clarify which table is canonical; migrate or merge |
| Baseline forms 1, 3–8 deferred | T-VER registration blocked until complete | Track as follow-up; not blocking this task's scope |
| How-to video asset not supplied | Farmer onboarding UX incomplete | Client must supply; track as follow-up |
| Client design artifacts are static prototypes with hardcoded data | Real data shapes may differ from artifact data | Use artifact as UI/copy spec; verify against actual DB schema during construct |
| Offline queue (SY-06) deferred | Farmers in low-connectivity areas can't submit photos | High priority follow-up; may need service-worker architecture |
