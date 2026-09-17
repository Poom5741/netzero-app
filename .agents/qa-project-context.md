# QA Project Context — NetZeroCarbon POC

> Last updated: 2026-09-17

## Application Overview

LINE-based chat app for carbon credit verification (AWD rice methodology). Farmers interact via LINE OA chatbot; admins review photo evidence; sponsors view aggregated impact. POC stage — not yet certified.

## Architecture

### Backend (Cloudflare Workers)
- **Runtime:** Cloudflare Workers (`src/index.ts`)
- **Database:** D1 (`netzero`, id: `a1d56ed-...`) — SQLite-compatible
- **Storage:** R2 bucket (`netzero-photos`) for photo evidence
- **AI:** Workers AI binding for vision model (photo screening)
- **Modules:** `src/{admin,auth,calc,chat,db,export,farmer,fertilizer,liff,line,photo,routes,season,sponsor,trust,vision}`

### Frontend (Next.js 16.3 Static Export)
- **Framework:** Next.js with `output: 'export'` → static HTML
- **Pages:** `frontend/src/app/{chat,admin,sponsor,summary,upload}`
- **Components:** `frontend/src/components/{ui,auth,dashboard,sponsor,admin-review,upload}`
- **Design:** Tailwind CSS v4, Material Symbols via Google Fonts `<link>`

### Three User Surfaces
1. **Farmer (LINE OA):** Chat interface → drafts → photo evidence via LIFF camera
2. **Admin Console:** Review queue, photo verification, farmer/plot/season management
3. **Sponsor Portal:** Aggregated impact dashboard, credential-based access

## Key Integration Points

| Integration | Risk Level | Notes |
|-------------|-----------|-------|
| LINE Messaging API | HIGH | Webhook signature (Base64 HMAC-SHA256), replyToken single-use, LIFF deep links |
| D1 Database | MEDIUM | SQLite semantics, FK constraints, migration safety |
| R2 Photo Storage | MEDIUM | Upload/download, GPS EXIF extraction |
| Workers AI (Vision) | MEDIUM | Photo screening (pass/flag/reject), never final authority |
| LIFF (LINE Front-end Framework) | HIGH | Camera access, context passing via URI params, cross-origin |
| OpenRouter AI (LLM) | MEDIUM | Chat drafting, Thai language understanding |

## Known Risk Areas

### Critical
- **Phone = Identity:** Farmer identified by phone number; no verification gate if phone matches
- **Photo Evidence Integrity:** GPS + timestamp required; AI screening is advisory only
- **LIFF Context Passing:** URI params for step/plot/season; easy to lose context
- **Static Export API Base:** `NEXT_PUBLIC_API_BASE` must be set at build time or calls break

### High
- **LINE replyToken:** Single-use; must batch all reply messages
- **Hono Sub-Router POST:** `app.route("/", subRouter)` silently drops POST handlers
- **node:crypto on Workers:** Broken; must use Web Crypto API
- **Tailwind v4:** `ml-72`/`left-72` invalid and silently no-op

### Medium
- **D1 Remote vs Local:** Schema drift between dev and prod
- **Cross-origin XHR:** Needs `withCredentials` for auth cookies
- **Material Symbols Font:** `next/font/google` breaks static build; use `<link>` instead

## Test Environment

### Local Development
```bash
npm run dev:all  # Backend :8787 + Frontend :3000 with API proxy
```

### Test Commands
```bash
bun run check:test     # Unit tests (bun test)
bun run check:lint     # Biome lint + format
bun run check:type     # TypeScript type check
bun run test:e2e       # Playwright E2E (requires running dev servers)
```

### Test Data
- `.env.test` — test environment variables
- Mock DB pattern in `tests/unit/` — bun MockDB for D1 simulation

## External Dependencies

| Service | Purpose | Auth |
|---------|---------|------|
| LINE Messaging API | Chatbot, push notifications | Channel secret + access token |
| LIFF | In-app camera, deep links | LIFF ID: `2011183008-7bEomfVF` |
| OpenRouter | LLM for chat drafting | API key |
| Cloudflare Workers | Compute + D1 + R2 + AI | Wrangler CLI |

## Current Test Inventory

### Unit Tests (117 files, 375 tests)
- Location: `tests/unit/`
- Coverage: calc, chat, admin, farmer, season, photo, consent, webhook, etc.
- Pattern: bun test with MockDB

### E2E Tests (6 spec files)
- Location: `frontend/e2e/`
- Files: `admin.spec.ts`, `sponsor.spec.ts`, `chat.spec.ts`, `full-qa.spec.ts`, `verify-journey.spec.ts`, `mobile-accessibility.spec.ts`
- Framework: Playwright

### Visual Tests
- Config: `tests/visual/playwright.config.ts`
- Snapshot tests for message rendering

## Current Status (2026-09-17)

### Test Results
- **Unit:** 374/375 pass (1 failing: `preverify-review.test.ts` — mock DB `.first()` not a function)
- **Lint:** 42 errors, 53 warnings (Biome)
- **E2E:** Not run (requires dev servers + browser)

### Known Issues
1. `tests/unit/preverify-review.test.ts` — mock DB chain `.bind().first()` returns undefined
2. 42 lint errors (need triage: real bugs vs style)
3. E2E tests not verified in this session

### Deployment
- Backend: `https://netzero-carbon-poc.poom-a1d.workers.dev`
- Frontend: static export deployed to Workers
- Latest deploy: `aedc01c` (2026-09-11)

## Previous QA Findings

### UX/UI Audit (2026-09)
- 16 issues identified
- Root cause: missing Material Symbols font (fixed)
- Other fixes: removed max-w constraints, responsive sidebar

### Integration Verification
- LINE full flow verified (onboarding → activation → calendar → results)
- Native photo action fix deployed (`e6944588`)
- Real-device LIFF/photo proof still open

### Security
- Mimosa scans run; SSRF false positives on client-side fetch
- No critical vulnerabilities found

## QA Decisions & Patterns

### Test Oracle Strategy
- **Unit:** Deterministic logic (calc, state transitions, validation)
- **Integration:** API contracts, DB migrations, webhook signatures
- **E2E:** User journeys (farmer onboarding, admin review, sponsor view)
- **Visual:** Snapshot regression for chat messages

### What We Don't Test (Yet)
- Performance/load testing
- Chaos engineering
- Cross-browser matrix (mobile Safari is critical but untested)
- Accessibility compliance (WCAG audit not done)

### Mocking Strategy
- D1: bun MockDB in `tests/unit/`
- LINE API: stubbed in webhook tests
- R2: in-memory mock for photo upload tests
- AI: deterministic fixtures for vision model responses
