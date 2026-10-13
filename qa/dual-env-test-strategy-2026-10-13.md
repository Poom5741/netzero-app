# Dual-environment E2E test strategy — 2026-10-13 (candidate 69af6d8)

Candidate `69af6d86d8d71c6c83b6871b20535419c7940ce6` is deployed to BOTH backend workers. FE assets unchanged (`3a92cb9`-era deploy, BACKEND bindings unchanged).

| | STAGING (client-facing) | DEV |
|---|---|---|
| Worker | `netzero-carbon-poc` | `netzero-carbon-poc-staging` |
| URL | https://netzero-carbon-poc.poom-a1d.workers.dev | https://netzero-carbon-poc-staging.poom-a1d.workers.dev |
| D1 | `netzero` (client accounts + farmer-edge/CPA0003/SPB-0001 4.5 ไร่) | `netzero-staging-db` (staging-mirrored; reconciled 2026-10-13) |
| BUILD_ID | `69af6d8…` ✓ | `69af6d8…` ✓ |
| LINE OA webhook | **LIVE here** (netzero-test @489xulzz → this worker) | not wired — no real LINE leg |
| Identities | admin@netzero.com · sponsor@netzero.com · farmer = phone identity via LINE (ClawTest2026! per handoff doc) | same emails/passwords; linked LIFF farmers: U1234567890abcdef→farmer-001, UTESTFARMER000001→farmer-003, UEDGEFARMER0000001→farmer-edge(CPA0003) |
| Destroy-safe | **NO destructive D1 ops** — test data only via product flows | disposable; reseed allowed |

## Environment roles
- **STAGING = truth for the LINE leg and client acceptance.** Real LINE OA → webhook → LIFF (backend-hosted) → admin → sponsor. This is where "from LINE to everything" runs end-to-end.
- **DEV = fast/parallel surface for API/UI depth without touching the client-facing stack.** All HTTP surfaces identical (same candidate). LINE leg is **simulated or bypassed**: (a) LIFF pages hit directly for linked farmers (`/liff/summary`, `/liff/fields`, `/liff/calendar`, `/liff/baseline`); (b) optionally a signed webhook POST (`POST /webhook` with LINE signature) — if `LINE_CHANNEL_SECRET` is absent/mismatched on the dev worker, record as environment-limitation and continue with (a); never fail the round on it.

## Journey matrix
| Journey | STAGING | DEV |
|---|---|---|
| J0 fingerprints + /health | ✓ both BUILD_IDs | ✓ |
| J1 farmer LINE→LIFF full (fresh identity, 4 photo rounds, results) | ✓ (native capture in scope) | LIFF-direct walk for linked farmers only (no real LINE) |
| J2 admin console (login→approve→evidence→logout) | ✓ | ✓ (same flows, dev data) |
| J3 sponsor portal (login→ภาพรวม→พื้นที่→รายงาน EX-2042→reload→logout bounce) | ✓ | ✓ |
| J4 scoping + PDPA (CPA-only, area-only, reconcile) | ✓ | ✓ |
| **018 regression** CSV จำนวนเกษตรกร = farmers-list count | ✓ (currently 1=1) | ✓ (currently 1=1) |
| D-5 regression: no silent empty states on credentialed pages | ✓ | ✓ |

## Pass criteria
- Every declared journey per env: passed, with URL + actions + observed-vs-expected + sanitized evidence.
- Reconciliation invariant on BOTH envs: CSV = summary = farmers list = households for the same session/filters.
- Any out-of-scope sponsor data leak = security defect (blocks).
- Final round status `passed` only when all declared journeys pass on BOTH envs and no confirmed defect remains.

## Evidence + return
- Write ONLY under `.super-speckit/qa/2026-10-13-dual-env-e2e/` (r6 staging + r7 dev appendices).
- Findings: exact repro, classification (defect/cosmetic/data-state/security), severity.
- Known non-blockers to not re-file: GPS 0,0 caveat; ENVIRONMENT label on dev /health reads "staging" (config var name, cosmetic); CSV filter-ignoring (documented pre-existing).

## Data provisioning (done 2026-10-13, reproducible via `scripts/seed-dev-test-2026-10-13.sql` on dev)
- dev: schema migrated; seed applied; farmer-edge ↔ CPA0003 ↔ SPB-0001 (4.5 ไร่, สุพรรณบุรี); sponsor@netzero.com areas=`["สุพรรณบุรี"]`, sponsor_id repoint; all four portal accounts password-unified to the handoff identity.
- staging: verified intact read-only (client accounts + seed + 018 state untouched).
