# BUG-008-B1 — Login pages crash: `useEffect` used but never imported (admin + sponsor)

- Status: `confirmed`
- Found in: feature 008-fix-login-wiring / candidate SHA cc08022e165045169a6e60136e8eff554b1cc119 / QA run 008-fix-login-wiring-qa1
- Affected requirement: R1 (J1/J2/J5), R4/R6 (runtime legs), J6 (build-time prerender)
- Severity: `critical`
- Reproduction: `3/3` (2× runtime via Playwright, 1× static-export build prerender)

## Expected / actual

Expected: `http://localhost:3000/admin/login` and `/sponsor/login` render the split-panel
login form (spec 006 visuals) with email/password inputs and Thai error handling.
Actual: Both pages throw `ReferenceError: useEffect is not defined` during client render
and Next.js dev shows "This page couldn't load. Reload to try again". No form is rendered;
all UI journeys (J1, J2, J5) are blocked. The same error also aborts
`STATIC_EXPORT=1 next build` during prerendering of `/admin/login`.

## Minimal reproduction

1. `cd frontend && npm run dev` (from QA worktree at candidate SHA), open
   `http://localhost:3000/admin/login` → error page, `pageerror: ReferenceError: useEffect is not defined`.
2. Same for `http://localhost:3000/sponsor/login`.
3. `STATIC_EXPORT=1 NEXT_TELEMETRY_DISABLED=1 npx next build --webpack` →
   `ReferenceError: useEffect is not defined at AdminLoginPage` → `Export encountered an error on /admin/login/page`.

## Root cause

- `frontend/src/app/admin/login/page.tsx` line 2 imports only `useState` from `react`,
  but line 7 calls `useEffect(...)` (sessionStorage cleanup of `nzc_admin_email`/`nzc_admin_pass`).
- `frontend/src/app/sponsor/login/page.tsx` line 3 imports `useState` (+`useRouter`), line 8 calls `useEffect(...)`.
- `frontend/tsc` evidence: `error TS2304: Cannot find name 'useEffect'` in both files
  (see `.super-speckit/qa/008-fix-login-wiring-qa1/frontend-tsc.log`).
- Gate gap: root `bun run check` (biome + root tsc + bun tests) does not cover `frontend/`;
  frontend has no typecheck script (only `lint: eslint`), so TS2304 was never caught.

## Evidence

- `.super-speckit/qa/008-fix-login-wiring-qa1/shots/B1-admin-login-crash.png`, `B1-sponsor-login-crash.png`
- `.super-speckit/qa/008-fix-login-wiring-qa1/network-j1.json`, `network-j2.json`, `network-j5.json` (pageerror entries)
- `.super-speckit/qa/008-fix-login-wiring-qa1/journeys-results.json` (2 runs: identical failures)
- `.super-speckit/qa/008-fix-login-wiring-qa1/journeys-run2.log` (reproduction 2)
- `.super-speckit/qa/008-fix-login-wiring-qa1/j6-build-webpack-diagnostic.log` (build-time reproduction)
- `.super-speckit/qa/008-fix-login-wiring-qa1/frontend-tsc.log` (TS2304 ×2)
- `.super-speckit/qa/008-fix-login-wiring-qa1/b1-sessionstorage-crashed-page.json`
- Sanitization completed: yes (no credentials/tokens in any artifact; test accounts are QA-local seeds)

## Fix and regression obligation

- Bug-fix worktree/commit: (maker lane) add `useEffect` to the `react` import in both login pages.
- Regression test: Playwright spec asserting `#email` input visible on both login pages
  (would fail today); plus wire a frontend typecheck gate (frontend tsc currently uncovered).
- Independent retest run: required before merge; re-run J1–J6 after fix.
