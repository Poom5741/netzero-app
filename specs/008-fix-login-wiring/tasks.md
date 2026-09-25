# Tasks: 008 — Fix login wiring

Maker: tech-lead · Definition of done per task = code + test/evidence + green local gates.

- [ ] T1 Backend `GET /session` in `src/routes/auth.ts` (200 `{authenticated,role,email}` / 401) — DoD: unit tests pass (valid, missing, tampered cookie).
- [ ] T2 `frontend/public/_redirects` (7 lines per plan) — DoD: file present; `STATIC_EXPORT=1` build emits `out/_redirects`.
- [ ] T3 `frontend/src/lib/api.ts` — API_BASE fallback `""`; remove Basic-auth block — DoD: grep shows no `setRequestHeader("Authorization"` and no workers.dev fallback in lib.
- [ ] T4 `frontend/src/app/admin/login/page.tsx` — relative `/login`, honest status handling, remove sessionStorage writes + bypass button — DoD: no `nzc_admin_pass` writes in file; error branches render messages.
- [ ] T5 `frontend/src/app/sponsor/login/page.tsx` — same for `/sponsor/login` — DoD: same greps.
- [ ] T6 `frontend/src/app/admin/page.tsx` — real session gate via `/api/auth/session` — DoD: no sessionStorage reads in file.
- [ ] T7 `frontend/src/lib/login-features.ts` — `forgotPassword: false` — DoD: default matches backend reality (documented).
- [ ] T8 Update `frontend/e2e/*.spec.ts` flows that used bypass/sessionStorage — DoD: grep clean; specs adjusted.
- [ ] T9 Deterministic gates: `bun run check:lint`, `bunx tsc --noEmit`, `bun test tests/unit/ tests/integration/` — DoD: all green, logs saved.
- [ ] T10 Commit candidate SHA in maker worktree `ss/feature/008-fix-login-wiring`; hand off to checker (chief) with matrix.

Checker lane (separate agent): QA worktree from candidate SHA, run J1–J6 + API assertions per plan, write QA artifacts under `.super-speckit/qa/`, classify failures, retest loop per config (2 reproductions).
