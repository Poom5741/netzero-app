# Sponsor portal real-browser test — 2026-10-05 (F2 verification → F3 found)

**Environment:** STAGING (client-facing original stack)
**Frontend:** `https://netzero-frontend.poom-a1d.workers.dev` (017 sponsor portal)
**Backend:** `https://netzero-carbon-poc.poom-a1d.workers.dev`
**Method:** ZCode in-app browser (browser-use), real Chromium, live network capture via fetch instrumentation persisted through navigations (sessionStorage).
**Credentials:** `sponsor@netzero.com` / `ClawTest2026!` (public staging handoff).

## Verdict

**F1/F2 fixes verified working; sponsor portal still unreachable — NEW defect F3 (session gate bounce).**
Login POST succeeds (200, cookie set on backend origin), but the sponsor session gate checks the
session **same-origin**, where the cookie can never exist by F2's design. Every successful login
hard-bounces back to `/sponsor/login`.

## Live capture (exact chain)

| # | Request | Mode | Status | Meaning |
|---|---------|------|--------|---------|
| 1 | `POST https://netzero-carbon-poc.poom-a1d.workers.dev/sponsor/login` | cross-origin, `credentials:"include"` | **200** | F1/F2 backend fix works; `nzc_session` set on backend host |
| 2 | `GET /sponsor.txt?_rsc=…` | same-origin (Next RSC prefetch) | 200 | client-side nav to `/sponsor` |
| 3 | `GET /api/auth/session` | same-origin (session gate, `use-session-gate.ts:9`) | **401** | proxy forwards to backend **without cookie** — cookie lives on backend host |
| 4 | `window.location.href = "/sponsor/login"` (gate catch) | hard nav | — | bounce back to login |

Screenshot after a successful login: `qa/sponsor-f3-bounce-back-to-login-2026-10-05.png` (login page again, no error shown).

## Isolation tests (same browser session, after the 200 login)

| Probe | Result |
|---|---|
| `GET ${apiBase}/sponsor/summary` cross-origin, credentials:include | **200** — real data (`totalFarmers: 2`) ✅ |
| `GET ${apiBase}/session` cross-origin, credentials:include | **200** `{"authenticated":true,"role":"sponsor","email":"sponsor@netzero.com"}` ✅ |
| `GET ${apiBase}/api/auth/session` cross-origin | 404 — backend has no `/api` prefix (proxy-only path) |
| `GET ${apiBase}/auth/session` cross-origin | 404 — same |

Backend route facts: `src/index.ts:81` mounts `authRoutes` at root → session endpoint is **`/session`**.
Frontend proxy `frontend/functions/_worker.js:12` maps `/^\/api\/auth\/(.*)$/ → /$1`, so same-origin
`/api/auth/session` ≡ backend `/session`. CORS on the backend already permits the frontend origin
(probes 1–2 succeeded from the browser).

## Root cause

`frontend/src/lib/use-session-gate.ts:9` — `const SESSION_PATH = "/api/auth/session"` fetched with
default (same-origin) credentials. F2 moved the sponsor cookie to the **backend origin**
(cross-origin login, PR #172). The gate's same-origin proxied check can never carry that cookie →
`authenticated:false` → unconditional bounce. The gate is mounted in `frontend/src/app/sponsor/layout.tsx:15`
for all `/sponsor/*` pages (disabled on the login page itself).

**Why admin is unaffected:** admin login posts same-origin `/login` (proxy) → cookie lands on the
**frontend** host → same-origin gate check works. The two portals now have opposite cookie hosts;
a naive global change to the gate would break admin.

## Fix direction (validated, not yet implemented)

Make the session-gate fetch role/origin-aware: for `role === "sponsor"`, fetch
`${apiBase}/session` (backend origin, `credentials:"include"` — probe above proves 200 + CORS OK);
admin keeps the same-origin `/api/auth/session` proxy path. Alternative: unify both logins on the
cross-origin backend pattern and point the gate at the backend for both (larger blast radius).

## Testing notes (non-defects)

- First automated fill appeared to "do nothing" on click: React hydration completed after the
  programmatic fill and reset the controlled inputs; the submit was blocked by native `required`
  validation (invisible in ARIA snapshots). Re-filling after hydration works. Real users are unaffected.
- `/_staging-build.json` returns a Next SPA shell (asset missing from current deploy) — the
  documented build fingerprint can no longer be checked. Side finding, worth restoring on next deploy.

## Test step timeline (browser)

1. Open `/sponsor/login` → 017 design renders (two-panel, Thai copy, OTP + remember-device fields).
2. Fill credentials → click เข้าสู่ระบบ → POST login 200 → soft-nav `/sponsor` → gate 401 → hard bounce to `/sponsor/login` (fields cleared, no error message shown to the user).
3. Cross-origin probes confirm cookie validity and the fix path (tables above).
