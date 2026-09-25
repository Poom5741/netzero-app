# Plan: 008 — Fix login wiring

**Ponytail ladder applied:** rung 1 (YAGNI): no auth library, no new endpoints beyond one 10-line JSON sibling of existing `/redirect`. Rung 2 (reuse): backend session auth, OTP, remember-device, audit log, Next dev rewrites — all exist. Rung 4 (native platform): Cloudflare Pages `_redirects` proxy for production instead of new code. Rung 7 (minimum): smallest change set below.

## Changes by file

### Backend
1. `src/routes/auth.ts` — add `GET /session`: read `nzc_session` cookie, `parseSessionCookie(...)`; valid → `{ authenticated: true, role, email }` 200; else 401 `{ authenticated: false }`. Mirrors existing `/redirect` handler.
2. `tests/unit/auth-session-route.test.ts` — new: 200 with valid signed cookie; 401 without; 401 with tampered cookie. Pattern: existing `tests/unit/liff-register-route.test.ts`.

### Frontend
3. `frontend/public/_redirects` — new (order matters, specific first):
   ```
   /api/auth/*   https://netzero-carbon-poc.poom-a1d.workers.dev/:splat  200
   /api/*        https://netzero-carbon-poc.poom-a1d.workers.dev/api/:splat  200
   /login        https://netzero-carbon-poc.poom-a1d.workers.dev/login  200
   /logout       https://netzero-carbon-poc.poom-a1d.workers.dev/logout  200
   /redirect     https://netzero-carbon-poc.poom-a1d.workers.dev/redirect  200
   /sponsor/*    https://netzero-carbon-poc.poom-a1d.workers.dev/sponsor/:splat  200
   /evidence/*   https://netzero-carbon-poc.poom-a1d.workers.dev/evidence/:splat  200
   ```
   Mirrors `frontend/next.config.ts` dev rewrites 1:1.
4. `frontend/src/lib/api.ts` — `API_BASE` fallback `""` (was workers.dev URL); delete the Basic-auth block (sessionStorage reads + `setRequestHeader("Authorization", ...)`). Keep `withCredentials = true` (harmless same-origin; still sends cookie).
5. `frontend/src/app/admin/login/page.tsx` — POST to relative `/login`; success ⇔ `res.status === 0 || res.status === 302` (same-origin opaque redirect / 302); 401 → Thai invalid-credentials error; else → generic connection error; **never** redirect on error. Delete sessionStorage writes. Delete "Admin (Bypass)" button; keep sponsor-login nav link. Keep spec-006 split-panel visuals untouched.
6. `frontend/src/app/sponsor/login/page.tsx` — same treatment, POST relative `/sponsor/login`, success → `/sponsor`.
7. `frontend/src/app/admin/page.tsx` — replace sessionStorage gate with `fetch("/api/auth/session")`: 401/network-fail → `window.location.href = "/admin/login"`; 200 → render (data fetches continue to fail soft as today if APIs error).
8. `frontend/src/lib/login-features.ts` — `forgotPassword: false` default (dead `/forgot-password` route); otp/rememberDevice stay `!== 'false'`.

### Test updates
9. `frontend/e2e/*.spec.ts` — update any flows relying on bypass/sessionStorage login (grep `nzc_admin`, `Bypass`).

## QA journeys (checker lane, from candidate SHA in clean worktree)

- J1 happy path admin: login `admin@netzero.local` / `ClawTest2026!` → lands `/admin`, KPI numbers visible, `nzc_session` cookie present, **no** `nzc_admin_pass` in sessionStorage, **no** Authorization header on API calls (network capture).
- J2 negative admin: wrong password → Thai error visible, URL still `/admin/login`, no navigation.
- J3 server error: stop backend → submit → generic error, stay on page (covers the old "failure=success" hole).
- J4 gate: fresh context → `/admin` directly → redirected to `/admin/login`.
- J5 sponsor: happy + negative on `/sponsor/login`.
- J6 build topology: `STATIC_EXPORT=1 npm run --prefix frontend build` → `out/_redirects` exists with expected lines.
- API assertions: unauth `GET /api/admin/review` → 401; with cookie → 200; `GET /api/auth/session` both ways.

## Out of scope / known follow-ups

Sponsor dashboard subpage gating; npm audit findings (3) in frontend; production deploy + real-device pass.
