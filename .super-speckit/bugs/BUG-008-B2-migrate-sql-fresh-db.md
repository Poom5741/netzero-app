# BUG-008-B2 — `npm run db:init` fails on a fresh local D1 (invalid SQL in migrate.sql)

- Status: `confirmed`
- Found in: QA run 008-fix-login-wiring-qa1 (candidate SHA cc08022e165045169a6e60136e8eff554b1cc119); pre-existing, not introduced by 008 diff
- Affected requirement: environment setup for R1–R7 runtime QA (not a matrix row itself)
- Severity: `medium` (blocks local env bring-up; remote/CI unaffected)
- Reproduction: `2/2` deterministic

## Expected / actual

Expected: `wrangler d1 execute netzero --local --file=src/db/migrate.sql` initializes a fresh
local D1 (per `package.json` `db:init` and DEV_SETUP.md).
Actual: Two independent failures, sequentially:
1. `src/db/migrate.sql:294` — `ALTER TABLE farmers ADD COLUMN cpa_code TEXT UNIQUE;`
   → SQLite rejects: `Cannot add a UNIQUE column: SQLITE_ERROR` (UNIQUE is not allowed in ADD COLUMN).
2. If (1) is bypassed, a later `ALTER TABLE users ADD COLUMN otp_secret ...` duplicates the
   `otp_secret` column already present in `CREATE TABLE users` (line 168) →
   `duplicate column name: otp_secret: SQLITE_ERROR`.
Net effect: `npm run db:init` can NEVER succeed on a fresh database.

## Minimal reproduction

1. Fresh QA worktree (no `.wrangler/` state), node ≥22, `bun install`.
2. `node_modules/.bin/wrangler d1 execute netzero --local --file=src/db/migrate.sql`
   → error 1 above (see `d1-migrate.log`).
3. Run again after removing only statement (1) → error 2 (see `d1-migrate-stmt-failures.log`, tolerated=15).

## QA workaround (no repo changes)

`.super-speckit/qa/008-fix-login-wiring-qa1/migrate-qa-local.sql` — repo migrate.sql with
(1) replaced by `ALTER TABLE farmers ADD COLUMN cpa_code TEXT;` plus
`CREATE UNIQUE INDEX idx_farmers_cpa_code ON farmers(cpa_code);`, applied statement-by-statement
tolerating duplicate-column errors (`seed-users.ts` via bun:sqlite).

## Evidence

- `.super-speckit/qa/008-fix-login-wiring-qa1/d1-migrate.log` (failure 1, run 1)
- `.super-speckit/qa/008-fix-login-wiring-qa1/d1-migrate-fail-repro2.log` (failure 1, run 2)
- `.super-speckit/qa/008-fix-login-wiring-qa1/d1-migrate-workaround.log` (failure 2: duplicate otp_secret)
- `.super-speckit/qa/008-fix-login-wiring-qa1/d1-migrate-stmt-failures.log` (tolerated statement list)
- Sanitization completed: yes

## Fix and regression obligation

- Bug-fix worktree/commit: (maker lane) make migrate.sql fresh-DB-runnable
  (drop UNIQUE from ADD COLUMN + unique index; drop the duplicate otp_secret ALTER or
  make statements idempotent).
- Regression test: CI step that applies migrate.sql to a fresh temp D1 and asserts success.
- Independent retest run: after fix, `db:init` on clean state must succeed.
