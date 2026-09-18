# NetZeroCarbon — Entrypoints & User Journeys

> Architecture diagram for the full NetZeroCarbon codebase. Anyone reading this document should understand every way a user or system can enter the application, what happens next, and where they end up.

---

## System Overview

NetZeroCarbon is a Cloudflare Workers (Hono) application deployed on `workers.dev` and Cloudflare Pages. It has three distinct user surfaces:

| Surface | Protocol | Auth | Role |
|---------|----------|------|------|
| **LINE OA Chatbot** | LINE Messaging API (webhook) | LINE userId | Farmer |
| **Admin Console** | HTTPS (browser) | Session cookie | Admin |
| **Sponsor Portal** | HTTPS (browser) | Session cookie | Sponsor |

Underpinning everything: **Cloudflare D1** (SQLite at the edge) for data, **Cloudflare R2** for document/photo storage, and **OpenRouter API** for AI-powered chat.

---

## Entrypoint Index

### A. Farmer Entrypoints

| Entrypoint | Method | Path | Auth |
|---|---|---|---|
| LINE Add Friend | POST | `/webhook/line` (LINE server pushes) | X-Line-Signature |
| LINE Text Message | POST | `/webhook/line` | X-Line-Signature |
| LINE Postback | POST | `/webhook/line` | X-Line-Signature |
| LIFF Chat App | GET | `/liff/` | LIFF SDK token |
| LIFF Registration Form | GET | `/register` | LIFF SDK token |
| LIFF Camera | GET | `/liff/camera` | LIFF SDK token |
| LIFF Documents | GET | `/liff/documents` | LIFF SDK token |
| LIFF Chat API | POST | `/liff/api/chat` | userId in body |
| LIFF Registration API | POST | `/liff/api/register` | userId in body |
| LIFF Document Upload API | POST | `/liff/api/documents/upload` | userId in body |
| Photo Upload (from camera) | POST | `/api/photo/upload` | — |

### B. Admin Entrypoints

| Entrypoint | Method | Path | Auth |
|---|---|---|---|
| Admin Login Page | GET | `/login` | None |
| Admin Login Submit | POST | `/login` | Form (email+password+OTP) |
| Admin Dashboard | GET | `/admin` | Session cookie |
| Admin Overview | GET | `/admin/overview` | Session cookie |
| Admin Applications | GET | `/admin/applications` | Session cookie |
| Admin Review Queue | GET | `/admin/review` | Session cookie |
| Admin Farmer List | GET | `/admin/farmers` | Session cookie |
| Admin Farmer Detail | GET | `/admin/farmers/:id` | Session cookie |
| Admin Sponsors | GET | `/admin/sponsors` | Session cookie |
| Admin Reports | GET | `/admin/reports` | Session cookie |
| Admin Settings | GET | `/admin/settings` | Session cookie |
| Admin Audit Log | GET | `/admin/audit/:photoId` | Session cookie |
| Admin Farmers API | GET | `/api/admin/farmers` | Session cookie |
| Admin Farmers Create API | POST | `/api/admin/farmers` | Session cookie |
| Admin Farmer Detail API | GET | `/api/admin/farmers/:id` | Session cookie |
| Admin Applications API | GET/POST | `/api/admin/applications` | Session cookie |
| Admin Application Approve | POST | `/api/admin/applications/:id/approve` | Session cookie |
| Admin Application Hold | POST | `/api/admin/applications/:id/hold` | Session cookie |
| Admin Application Reject | POST | `/api/admin/applications/:id/reject` | Session cookie |
| Admin Review API | GET | `/api/admin/review` | Session cookie |
| Admin Photo Review Action | POST | `/api/admin/review/:photoId` | Session cookie |
| Admin Overview KPIs | GET | `/api/admin/overview/kpis` | Session cookie |
| Admin Credit Chart | GET | `/api/admin/overview/credit-chart` | Session cookie |
| Admin GHG Sources | GET | `/api/admin/overview/ghg-sources` | Session cookie |
| Admin Province Table | GET | `/api/admin/overview/provinces` | Session cookie |
| Admin Precision Stat | GET | `/api/admin/precision` | Session cookie |
| Admin Audit API | GET | `/api/admin/audit/:photoId` | Session cookie |
| Admin Settings API | GET/POST | `/api/admin/settings` | Session cookie |
| Admin Sponsors API | GET | `/api/admin/sponsors` | Session cookie |
| Admin Reports API | GET | `/api/admin/reports` | Session cookie |
| Admin Report Download | GET | `/api/admin/reports/:id/download` | Session cookie |
| Admin Dashboard API | GET | `/api/admin/dashboard` | Session cookie |
| Serve Photo | GET | `/api/photo/:photoId` | Session cookie |
| Logout | POST | `/logout` | Session cookie |
| Auth Redirect | GET | `/redirect` | Session cookie |

### C. Sponsor Entrypoints

| Entrypoint | Method | Path | Auth |
|---|---|---|---|
| Sponsor Login Page | GET | `/sponsor/login` | None |
| Sponsor Login Submit | POST | `/sponsor/login` | Form |
| Sponsor Logout | POST | `/sponsor/logout` | Session cookie |
| Sponsor Overview | GET | `/sponsor` | Session cookie |
| Sponsor Summary API | GET | `/sponsor/summary` | Session cookie |
| Sponsor Plots by Province | GET | `/sponsor` | Session cookie |
| Sponsor Farmers API | GET | `/sponsor/farmers` | Session cookie |
| Sponsor GHG Sources API | GET | `/sponsor/ghg-sources` | Session cookie |
| Sponsor Season Credits API | GET | `/sponsor/season-credits` | Session cookie |
| Sponsor Certificates API | GET | `/sponsor/certificates` | Session cookie |
| Sponsor Report Download | GET | `/sponsor/reports/:id/download` | Session cookie |
| Sponsor Plot Detail API | GET | `/sponsor/:plotId` | Session cookie |
| Sponsor Me API | GET | `/sponsor/me` | Session cookie |

### D. System/Webhook Entrypoints

| Entrypoint | Method | Path | Auth |
|---|---|---|---|
| LINE Webhook Verification | GET | `/webhook/line` | — (returns 200) |
| LINE Webhook Events | POST | `/webhook/line` | X-Line-Signature |
| Health Check | GET | `/health` | None |
| Export Estimates | GET | `/export/*` | — |

---

## User Journeys

### Journey 1 — Farmer Registers via LINE OA

```
[Farmer opens LINE]
  → taps "Add Friend" on LINE OA
  → LINE sends follow event to /webhook/line
  → Bot replies with welcome flex + "Open App" button (LIFF deep-link)
  → Farmer taps "เปิดแอป NetZeroCarbon"
  → LINE opens LIFF URL: https://liff.line.me/{LIFF_ID}/register
  → GET /register (LIFF registration form)
  → Farmer fills form + submits
  → POST /liff/api/register
  → Farmer record created/updated in D1
  → Plot record created in D1
  → line_links.conversation_state → 'documents'
  → Success UI shown
```

**Data written:** `farmers`, `plots`, `line_links`

---

### Journey 2 — Farmer Completes Document Upload via LIFF

```
[Farmer is on LIFF /register success screen]
  → navigates to /liff/documents?farmer_id=...
  → LIFF SDK resolves LINE userId → farmerId
  → GET /liff/documents
  → Farmer uploads DOC-01 (โฉนด), DOC-03 (บัตรประชาชน), optionally DOC-06 (มอบอำนาจ)
  → each file: POST /liff/api/documents/upload
  → file stored in R2
  → record upserted into application_documents
  → When all required docs attached: application created in D1
```

**Data written:** `application_documents` (R2 + D1)

---

### Journey 3 — Farmer Chats with Bot (LINE Messaging API)

```
[Farmer opens LINE OA chat and types a message]
  → LINE POSTs message event to /webhook/line
  → Signature verified (X-Line-Signature)
  → DB lookup: line_links by LINE userId
  → State machine (src/line/flow.ts) called with current state
  → AI reply generated via OpenRouter (Qwen 3.6 Flash)
  → Bot replies via LINE Push/Reply API
  → conversation_state + selected_plot_id updated in line_links
```

**States:** `welcome` → `registration` → `documents` → `plot_selection` → `season_setup` → `photo_upload` → `calendar` → `results`

---

### Journey 4 — Farmer Takes Photo via LIFF Camera

```
[Farmer taps "ถ่ายรูป" in LINE chat]
  → Bot sends LIFF camera deep-link with step/plot/season context
  → Farmer opens /liff/camera?plot_id=...&season_id=...&step=SG-04
  → LIFF SDK initialized
  → Camera opens (getUserMedia) or file upload fallback
  → Farmer captures photo
  → POST /api/photo/upload (multipart/form-data)
  → Photo stored in R2 (evidence/{photoId}.jpg)
  → photo_evidence record created in D1
  → AI pre-verification triggered (admin review queue)
```

**Data written:** R2 `evidence/{photoId}.jpg`, `photo_evidence`

---

### Journey 5 — Admin Reviews Farmer Application

```
[Admin opens browser]
  → GET /login
  → Submits email + password + OTP (if enabled)
  → POST /login → session cookie set
  → GET /admin (redirected from /admin dashboard)
  → GET /admin/applications
  → Sees pending application from farmer
  → Clicks "อนุมัติ" (approve)
  → POST /api/admin/applications/:id/approve
  → Application status → 'verified'
  → CPA code generated
  → LINE push notification sent to farmer
```

**Auth:** Session cookie checked via `requireRole("admin", SECRET)`

---

### Journey 6 — Admin Reviews Photo Evidence

```
[Admin on /admin/review]
  → GET /api/admin/review
  → Sees photo queue (pending AI, pre-verified, flagged)
  → Clicks "✓ ผ่าน" or "✗ ตีกลับ"
  → POST /api/admin/review/:photoId { status: "verified"|"rejected", reason }
  → Decision written to automation_audit_log
  → LINE push notification sent to farmer
  → AI precision stats updated
```

**AI Pre-verification:** When photo uploaded, AI runs `pass`/`flag`/`reject` classification before human review.

---

### Journey 7 — Admin Creates Farmer Manually

```
[Admin on /admin/farmers]
  → POST /api/admin/farmers { full_name, phone, gender, address, ... }
  → Rate limited: 10 requests/minute per admin
  → Farmer + plot created in D1
  → Farmer appears in list
  → line_links created (unlinked to LINE yet)
```

---

### Journey 8 — Sponsor Views Carbon Impact

```
[Sponsor opens browser]
  → GET /sponsor/login
  → POST /sponsor/login → session cookie
  → GET /sponsor → dashboardPage()
  → KPIs loaded from D1 (area-scoped by assigned provinces)
  → GET /sponsor/farmers → area-filtered farmer list
  → GET /sponsor/season-credits → seasonal credit chart
  → GET /sponsor/ghg-sources → GHG breakdown
  → GET /sponsor/reports/EX-2042/download → CSV export
```

**Scope enforcement:** Every query filters by sponsor's assigned areas. CPA codes shown instead of farmer identities (PDPA).

---

### Journey 9 — LINE Postback (Flex Button Tap)

```
[Farmer taps a flex message button]
  → LINE POSTs postback event to /webhook/line
  → postback.data extracted (e.g., "action=show_calendar")
  → Routed through same state machine as text messages
  → State machine handles keyword → transition
  → Reply sent via replyMessage()
```

---

## State Machine (LINE Conversation Flow)

Defined in `src/line/flow.ts`, persisted in `line_links.conversation_state`.

```
welcome
  │ "สวัสดี" / "ช่วย" / follow event
  ↓
registration
  │ phone number submitted
  ↓
documents
  │ farmer uploads required docs
  ↓
plot_selection
  │ farmer selects their plot
  ↓
season_setup
  │ farmer sets season + rice variety
  ↓
photo_upload
  │ farmer submits photos per growth stage
  ↓
calendar
  │ farmer requests to see calendar
  ↓
results
  │ farmer asks for results / carbon estimate
```

**Special states:** `phone_number_entry` — for manual phone linking without registration.

---

## Data Storage Summary

| Store | Used For |
|-------|---------|
| **D1 (SQLite)** | Farmers, plots, seasons, photos, applications, documents, users, sessions, audit logs, LINE links |
| **R2** | Photo evidence (evidence/{id}.jpg), document files (docs/{farmerId}/{docCode}/{filename}) |
| **Session Cookie** | Admin + Sponsor auth (HttpOnly,Signed, SameSite=Lax) |
| **LINE Platform** | Farmer identity, push/reply messaging, LIFF deep-links |

---

## Route Mount Order (src/index.ts)

The order of `app.route()` calls matters because Hono matches first — this is the explicit order:

```
1. /register          (inline handler — must be before sub-routers)
2. /liff/*           ← liffRoutes
3. /                 ← authRoutes, healthRoutes, photoRoutes, seasonRoutes, farmerRoutes, adminRoutes, sponsorRoutes, exportRoutes, dashboardRoutes
4. /webhook/line     (inline handlers — GET for verification, POST for events)
5. /admin/*          ← adminRoutes (session-protected)
6. /sponsor/*        ← sponsorRoutes (session-protected)
7. /export/*         ← exportRoutes
8. /                 ← dashboardRoutes (catch-all admin/sponsor shells)
```

---

## Key Security Boundaries

1. **LINE webhook** — HMAC-SHA256 signature verified on every POST. Rejects requests with invalid signatures.
2. **Admin routes** — `requireRole("admin")` middleware on every `/admin/*` and `/api/admin/*` path. Session cookie verified.
3. **Sponsor routes** — `requireRole("sponsor")` middleware on every `/sponsor/*` path (except login/logout). Area-scope filter on every query.
4. **Season write endpoints** — Admin auth required for `/api/season` POST and `/api/season/approve`.
5. **Photo upload** — No auth on `/api/photo/upload` (intentional for LIFF-native upload from device). Rate-limited by context.
6. **CORS** — Allowlisted origins only: production Pages domains + `localhost:3000`.

---

## External Dependencies

| Service | Purpose | Config |
|---------|---------|--------|
| LINE Messaging API | Farmer chatbot | `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET` |
| LINE LIFF | In-app web views | `LIFF_ID` |
| OpenRouter | AI chat (Qwen 3.6 Flash) | `OPENROUTER_API_KEY` |
| 9router proxy | Local LLM routing (dev only) | `OPENROUTER_API_KEY` via localhost:8787 |
| Cloudflare D1 | Primary database | `DB` binding |
| Cloudflare R2 | Photo + document blob storage | `R2` binding |
| Google Fonts | UI typography | CDN (no key) |

---

## Environment Variables

```typescript
DB: D1Database          // Cloudflare D1
R2: R2Bucket            // Cloudflare R2
AI: Ai                  // Workers AI (unused in current flow)
ENVIRONMENT: string     // "production" | "development"
SECRET: string          // Session cookie signing key
LINE_CHANNEL_ACCESS_TOKEN: string
LINE_CHANNEL_SECRET: string
OPENROUTER_API_KEY: string
LIFF_ID: string         // e.g. "2011183008-7bEomfVF"
APP_URL: string          // e.g. "https://netzero-frontend.pages.dev"
LINE_WEBHOOK_ENABLED?: string
```
