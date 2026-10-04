# AGENTS.md

Instructions for coding agents working in this repository.

## Agent skills

### Issue tracker

Issues and specs live as GitHub issues for this repo, driven through the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the default five canonical labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` at the repo root; ADRs in `docs/adr/`. See `docs/agents/domain.md`.

### Browser testing

**Always use browser-use skill** (control-browser MCP via `mcp__node_repl__js`) for any browser/web-UI tasks. Do NOT use Playwright MCP tools (`mcp__plugin_playwright_playwright__*`) — they are a different system. When the user says "test", "browse", "open", "screenshot", or any browser interaction, invoke the `browser-use:control-browser` skill first.

---

# Environment topology — DEV vs STAGING (READ BEFORE ANY DEPLOY)

> Established 2026-10-02 (staging-isolation mission). **Corrected 2026-10-02 by Poom:** the ORIGINAL stack is **STAGING** (client-facing) and the new isolated stack is **DEV**. **There is NO production environment yet** — production will be provisioned separately at launch. Beware: resource names are misleading — the worker suffixed `-staging` is the **DEV** backend; the un-suffixed `netzero-carbon-poc` is the **STAGING** backend. Ownership: **Tech Lead deploys both staging and dev**; Dev lanes never deploy.

## 🧪 STAGING — client testing environment (ORIGINAL stack; real LINE lives here)

| Resource | Identifier | Notes |
|---|---|---|
| Backend worker | `netzero-carbon-poc` | LINE OA webhooks, staging farmer data, `ENVIRONMENT=development` (stale label only) |
| Database | D1 `netzero` = `9f9cb6c3-ef8b-4d10-9457-b92c63f68d64` | staging data (4 farmers, real LINE bindings) — test data, not real production data |
| Object storage | R2 `netzero-photos` | staging evidence bucket |
| Secrets | `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `OPENROUTER_API_KEY`, `SECRET`, `LIFF_ID` | real values — never copy into public files |
| LINE integration | LINE OA `netzero-test` + LIFF app `2011183008-7bEomfVF` | webhook points at staging backend; LIFF pages are backend-hosted by design |
| Frontend worker | `netzero-frontend` (workers.dev) | fresh `main` assets + `functions/_worker.js`; **CORRECTED 2026-10-05**: the 2026-10-02 record was wrong — the live `BACKEND` binding pointed at `netzero-carbon-poc-staging` (DEV), redeployed `8691178b` with `BACKEND` → `netzero-carbon-poc` (staging). Repo `frontend/wrangler.jsonc` is now authoritative (main + ASSETS binding + `run_worker_first: ["/api/*","/login","/logout","/redirect","/sponsor-login","/evidence/*"]`); Pages-era `public/_redirects` deleted (invalid in Workers-assets mode) |

## 🛠 DEV — isolated development environment (new stack; no real LINE)

| Resource | Identifier | Notes |
|---|---|---|
| Backend worker | `netzero-carbon-poc-staging` | `ENVIRONMENT=staging` → `/health` reports `"environment":"staging"`; config in `wrangler.staging.toml` |
| Database | D1 `netzero-staging-db` = `b291686f-ce8c-470c-aeef-92fe08e89b56` | full clone of staging `netzero` (2026-10-02, all 17 tables row-identical at clone time) |
| Object storage | R2 `netzero-photos-staging` | fresh/empty; dev evidence lives here |
| Secrets | fresh `SECRET`; `LIFF_ID` = same public LIFF id; `LINE_CHANNEL_ACCESS_TOKEN` / `LINE_CHANNEL_SECRET` / `OPENROUTER_API_KEY` = `staging-disabled` (verified real placeholders 2026-10-02 ~14:10Z — see D1 RESOLVED) | means **no real LINE pushes from dev** (LINE-flow testing happens on staging); AI/vision features degrade gracefully |
| Build fingerprint | `/_staging-build.json` on the frontend host | byte-level proof of what's deployed |

## 🚫 PRODUCTION — does not exist yet

Will be provisioned fresh at launch (own worker / D1 / R2 / secrets / production LINE OA). Do not treat any current environment as production, and do not promote staging data to production implicitly.

### Test identities
`admin@netzero.com`, `qa-admin@netzero.com` (admin) · `sponsor@netzero.com`, `qa-sponsor@netzero.com` (sponsor) — accounts exist in both DBs (dev is a staging clone). Passwords: the client-facing staging password is in the committed client handoff; a rotated non-public set (2026-10-02) applies to the DEV stack and lives in local-only material. **Never commit staging or dev passwords to this public repo.** TL to confirm which password is valid against which stack before client sessions.

## Deploy ownership & discipline
- **TL deploys staging and dev** (frontend: assets-upload-session + multipart PUT preserving `proxy.js` verbatim; dev backend: `wrangler deploy --config wrangler.staging.toml`). Dev lanes: no deploys, no pushes, evidence to `qa/` only.
- Rollback points: frontend worker versions `cbbeea6d` / `149caab3` (pre-staging-r1); staging backend worker version `9c7ca9c0` (D3 fix, 2026-10-02); dev backend worker version `38c0f198` (first code-upload deploy, D3 fix, 2026-10-02).
- Never `git add -A` (`.zcode/` not ignored). Merge to `main` requires human approval.

## Known issues at time of writing
- **F3 — OPEN 2026-10-05** (found by real-browser test after F2): sponsor login **succeeds** (POST `${apiBase}/sponsor/login` → 200, cookie on backend origin) but the sponsor session gate (`frontend/src/lib/use-session-gate.ts:9`, mounted in `sponsor/layout.tsx`) still checks `GET /api/auth/session` **same-origin**, which can never carry the backend-host cookie → 401 → hard `window.location` bounce back to `/sponsor/login`. Portal unreachable in UI despite valid session. Fix (validated live): make the gate fetch origin-aware — sponsor role → `${apiBase}/session` (backend root-mounted route; NOT `/api/auth/session`, which only exists via the proxy rewrite) with `credentials:"include"`; admin keeps the same-origin proxy path (admin cookie lives on the frontend host — a global switch would break admin). Evidence: `qa/sponsor-portal-browser-test-2026-10-05.md` (live netlog chain + cross-origin probes). Side finding: `/_staging-build.json` missing from the current frontend deploy (returns SPA shell) — restore on next deploy.
- **D1 — RESOLVED 2026-10-02 ~14:10Z** (was: dev worker held a REAL LINE access token). All three dev secrets (`LINE_CHANNEL_ACCESS_TOKEN` / `LINE_CHANNEL_SECRET` / `OPENROUTER_API_KEY`) re-put as `staging-disabled` on `netzero-carbon-poc-staging`; verified via worker tail: signed probe → LINE API now answers **401 Authentication failed**. Dev can no longer push real LINE messages. Tracked in issue #166 (closed).
- **D2 (dev test passwords rotated, undocumented)**: `admin@netzero.com` and `sponsor@netzero.com` both return 401 with the public `ClawTest2026!` on dev (accounts exist in dev DB; verified 2026-10-02). Rotated 2026-10-02; rotated password not present in any tracked file. TL to record in local-only material.
- **D3 — RESOLVED 2026-10-02** (was: `POST /webhook/line` verified `X-Line-Signature` only when the header was present; unsigned POSTs were fully processed on the LIVE staging webhook). Fixed in commit `1478fae` / PR #168 (merged `bb3bb4f`): missing signature → 401, unset secret → 500 (fail closed), always verified before processing. Regression tests: `tests/unit/line-webhook-route.test.ts` (4/4). Deployed: staging `9c7ca9c0`, dev `38c0f198`; unsigned POST verified 401 on both. Tracked in issue #167 (closed).
- **D4 — RESOLVED 2026-10-02**: dev worker `netzero-carbon-poc-staging` now has a code-upload deployment (`38c0f198`, built from PR #168 @ `bb3bb4f`), supersedes the undocumented secret-only state. New rollback point: `38c0f198`.
- **F2 — RESOLVED 2026-10-05**: 017 sponsor portal login chain broken beyond F1 — (a) frontend `BACKEND` binding → DEV worker (500 on every JSON login; PR #172 + deploy `8691178b`), (b) `/sponsor-login` proxy cookie lands on the frontend host while dashboard XHRs authenticate directly against the backend origin — login page now posts cross-origin to `${apiBase}/sponsor/login` (PR #172), (c) login page accepted only 302, now also 200 `{success:true}`. Verified live 2026-10-05: SPA 200, login 200 + `SameSite=None` cookie, summary/me/farmers 200 with cookie.
- **F1 — RESOLVED 2026-10-05** (was: `POST /sponsor/login` duplicate handlers; JSON logins from the 017 portal hit an unhandled 500). Fixed in PR #170 (merged `e2ed44f`): single content-type dispatcher (JSON → 200 + `SameSite=None`; form → 302 + `Lax`), mirroring auth.ts b8. Regression tests: `tests/unit/sponsor-login-content-type.test.ts` (3/3). Deployed to staging backend `144f0607`; live-verified JSON 200 + form 302 on `netzero-carbon-poc` 2026-10-05.
- Legacy e2e suites (218-test default collection) target pre-017 architecture — 113 fails vs staging is drift, not regression. Canonical Tier-2 = 3 parity specs (`admin-shell-parity`, `controls-parity`, `data-chrome-parity`) with `TIER2_BASE_URL` set → 22 passed / 0 failed / 12 skipped.
- Admin rail displays `admin@netzerocarbon.com` (cosmetic; working identity is `admin@netzero.com`).
