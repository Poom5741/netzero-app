# E2E Manual Test: LINE OA → Admin → Sponsor

## Context

Verify the full three-surface flow end-to-end on production. The backend auth (`src/auth/middleware.ts`) only accepts `nzc_session` cookies — the frontend dev bypass buttons set `sessionStorage` but produce no cookie, so **real login with valid DB credentials is required**.

**Production URLs**: Backend `https://netzero-carbon-poc.poom-a1d.workers.dev`, Frontend `https://netzero-frontend.poom-a1d.workers.dev`

---

## Phase 0: Pre-flight — Ensure Accounts Exist

1. Query production D1 for existing users:
   ```
   npx wrangler d1 execute netzero --remote --command "SELECT id, email, role, password_hash FROM users"
   ```
2. If `admin@netzero.com` or `sponsor@netzero.com` don't exist or have `placeholder-hash`, generate real PBKDF2 hash via Node.js and insert/update in D1
3. Verify backend health: `curl -s https://netzero-carbon-poc.poom-a1d.workers.dev/health`

## Phase 1: Admin Console (Browser via Playwright MCP)

Navigate to `/admin/login`, login with `admin@netzero.com` / `ClawTest2026!`, verify:
- Dashboard renders with KPI cards
- Evidence/review page loads with photo queue
- Farmers page, applications page render
- If photos exist: approve/reject action works

## Phase 2: Sponsor Portal (Browser via Playwright MCP)

Navigate to `/sponsor/login`, login with `sponsor@netzero.com` / `ClawTest2026!`, verify:
- Dashboard KPI cards show integers (not NaN/undefined)
- Farmer list visible
- Responsive layout at mobile width

## Phase 3: LINE OA — Three-tier Strategy

**Why tiered**: LINE desktop on macOS has unreliable accessibility (documented in project memory). We use a fallback chain.

### Tier 1 — Web equivalent (always works, proves backend)
- Farmer chat at `/chat`: consent → phone → AI question
- Photo upload at `/upload`: select type → upload test photo → verify verdict

### Tier 2 — Webhook simulation via curl (proves LINE webhook logic)
- Generate signed webhook payload using LINE channel secret
- POST to `/webhook/line` — exercises the same `handleFlow()` state machine
- Simulate: follow event, text messages, postback actions

### Tier 3 — LINE desktop app (best-effort)
- Open LINE app via computer-use `open_application`
- Attempt to find NetZeroCarbon bot and send message
- If accessibility tree is empty (known issue): document and rely on Tier 1+2

## Phase 4: Cross-surface Data Flow

- Photo uploaded in Phase 3 appears in admin review queue (Phase 1)
- Admin approval reflects in sponsor dashboard counts (Phase 2)
- farmer-004 data consistent across all surfaces

## Files to check/modify

| File | Action |
|------|--------|
| Production D1 `users` table | INSERT/UPDATE for valid credentials if needed |
| `src/auth/password.ts` | Read-only — PBKDF2 format reference |
| `src/auth/middleware.ts` | Read-only — cookie-only auth |
| `frontend/src/lib/api.ts` | Read-only — Basic Auth header for admin |

## Verification

- ✅ Admin login → dashboard → review queue → approve/reject
- ✅ Sponsor login → dashboard → KPI cards → farmer list
- ✅ Farmer chat flow works (web or LINE)
- ✅ Photo upload → appears in admin queue
- ✅ Cross-surface data consistency
