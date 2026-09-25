# BUG-008-B3 — `STATIC_EXPORT=1 npm run build` fails under Next 16 (Turbopack default vs webpack-only config)

- Status: `confirmed`
- Found in: feature 008-fix-login-wiring / candidate SHA cc08022e165045169a6e60136e8eff554b1cc119 / QA run 008-fix-login-wiring-qa1
- Affected requirement: R4 (production topology via `out/_redirects`, journey J6)
- Severity: `high` (production deploy topology cannot be produced)
- Reproduction: `2/2` deterministic (mandated env: `STATIC_EXPORT=1 NODE_OPTIONS=--max-old-space-size=450 NEXT_TELEMETRY_DISABLED=1`)

## Expected / actual

Expected: `frontend/` builds to `out/` (static export) and `out/_redirects` exists containing
the 7 proxy lines from `frontend/public/_redirects`.
Actual: `next build` exits 1 before emitting `out/`:
`⨯ ERROR: This build is using Turbopack, with a 'webpack' config and no 'turbopack' config.`
followed by `Error: Call retries were exceeded { type: 'WorkerError' }`.
`out/_redirects` MISSING.

## Minimal reproduction

1. `cd frontend`
2. `STATIC_EXPORT=1 NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS=--max-old-space-size=450 npm run build`
3. Observe build failure; `out/_redirects` absent. (Reproduced twice, logs below.)

## Root cause

- `frontend/package.json` pins `next: ^16.3.2` → Next.js 16 uses **Turbopack by default** for builds.
- `next.config.ts` static-export branch sets a custom `webpack(c){...}` config and no `turbopack`
  config → Next 16 hard-errors this combination.
- Additional note: even with the diagnostic `--webpack` flag, the build then fails for a second,
  independent reason — BUG-008-B1 (`ReferenceError: useEffect is not defined` prerendering
  `/admin/login`). J6 therefore has two deterministic blockers; B3 covers the config conflict,
  B1 covers the prerender crash.

## Evidence

- `.super-speckit/qa/008-fix-login-wiring-qa1/j6-build.log` (run 1)
- `.super-speckit/qa/008-fix-login-wiring-qa1/j6-build-repro2.log` (run 2)
- `.super-speckit/qa/008-fix-login-wiring-qa1/j6-build-webpack-diagnostic.log` (B1 blocker behind `--webpack`)
- `frontend/public/_redirects` (the 7 expected lines — file itself is correct)
- Sanitization completed: yes

## Fix and regression obligation

- Bug-fix worktree/commit: (maker lane) either add `turbopack: {}` / use `--turbopack`/`--webpack`
  explicitly in the static-export build path, or move the webpack memory options to a turbopack
  equivalent; then B1 must also be fixed for prerender to pass.
- Regression test: CI job running the mandated J6 command and asserting `out/_redirects`
  exists with the 7 lines (diff against `frontend/public/_redirects`).
- Independent retest run: required.
