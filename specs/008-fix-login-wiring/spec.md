# Spec: 008 — Fix login wiring (admin/sponsor)

**Date:** 2026-09-25 · **Risk:** HIGH (auth paths) · **Maker:** tech-lead · **Checker:** chief
**Repo:** netzero-app @ main `b83c626`

## Problem (observed evidence, 2026-09-25 code review)

1. **Failure treated as success.** `frontend/src/app/admin/login/page.tsx` redirects to `/admin` on any response that is not a literal 401 — including `status === 0` (opaque redirect, also the signature of a CORS failure) and 5xx. Sponsor login page has the same pattern.
2. **Plaintext credentials in the browser.** Both login pages write `nzc_admin_email` / `nzc_admin_pass` (raw password) into `sessionStorage`. `frontend/src/app/admin/page.tsx` gates on these keys existing, and `frontend/src/lib/api.ts` builds an HTTP **Basic** header from them. Backend `requireRole` (`src/auth/middleware.ts`) is **cookie-only** — the Basic header is never read.
3. **Unguarded dev bypass in production.** "Admin (Bypass)" button writes fake credentials and navigates to `/admin` — no environment guard.
4. **Cross-origin cookie fragility.** Login POSTs to `https://netzero-carbon-poc.poom-a1d.workers.dev` with `credentials: "include"`. The `nzc_session` cookie is third-party from the Pages origin; modern browsers reject/partition it → in production the session never sticks and every admin API returns 401 while the page shell renders.

## Goal

Login actually authenticates against the existing backend session (signed HttpOnly `nzc_session` cookie); failures visibly fail; no credentials persist client-side; one source of truth.

## Requirements (testable)

- **R1 Honest status handling (admin + sponsor login):** success **only** on backend 302 / opaque-redirect from a same-origin POST. 401 → visible Thai invalid-credentials error, stay on page. Any other status or network error → visible generic error, stay on page.
- **R2 No client-side credential persistence:** zero writes of email/password to `sessionStorage`/`localStorage` anywhere in the frontend; after login, no `nzc_admin_pass` exists.
- **R3 No Authorization header:** `lib/api.ts` sends no Basic auth; backend stays cookie-only (no backend auth-model change).
- **R4 Same-origin transport:** (a) dev — login pages POST to relative `/login` and `/sponsor/login` (existing Next rewrites); (b) prod static export — new `frontend/public/_redirects` proxies `/login`, `/logout`, `/redirect`, `/api/auth/*`, `/api/*`, `/sponsor/*`, `/evidence/*` to the Worker; `lib/api.ts` `API_BASE` fallback becomes `""` (same-origin).
- **R5 Real session gate:** new backend `GET /session` → 200 `{authenticated:true, role, email}` with valid `nzc_session`, else 401. Admin overview gates on it: invalid session → redirect `/admin/login`; valid → render data.
- **R6 Bypass button removed** from admin login page (sponsor→login nav link may stay).
- **R7 Feature flags truthfulness:** `forgotPassword` default **false** (no `/forgot-password` route exists — dead link today); `otp` and `rememberDevice` remain **true** (backend-confirmed in `src/routes/auth.ts`: OTP verified when `otp_secret` set; remember = 30-day session, T090).
- **R8 Gates stay green:** biome lint, tsc, bun unit + integration pass; new `/session` endpoint has unit tests; existing tests referencing removed behavior are updated.

## Non-goals

OTP enrollment UI · password reset flow · sponsor subpage gating (follow-up ticket) · production deploy · LIFF chat login · API route redesign · LINE client verification (parked by user decision 2026-09-25).

## Deployment dependency

Production Pages deploys must ship `public/_redirects` (Next static export copies `public/` → `out/`). Acceptance: `out/_redirects` exists after `STATIC_EXPORT=1 npm run build`.

## Risks

- `_redirects` changes production API topology for `lib/api.ts` consumers — mitigated by R4b acceptance check and dev-mode rewrite equivalence.
- Removing Basic-auth sends: no behavior loss (backend never read it) — verified by R3.
