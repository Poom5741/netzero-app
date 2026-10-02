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
| Frontend worker | `netzero-frontend` (workers.dev) | fresh `main` assets + `proxy.js`; per the 2026-10-02 deploy record, `BACKEND` service binding → `netzero-carbon-poc` (staging); asset-layer contract `run_worker_first: ["/api/*","/login","/logout","/redirect","/sponsor-login","/evidence/*"]` (without it `POST /login` 405s — repo `frontend/wrangler.jsonc` is STALE, assets-only; true config lives in deploy metadata) |

## 🛠 DEV — isolated development environment (new stack; no real LINE)

| Resource | Identifier | Notes |
|---|---|---|
| Backend worker | `netzero-carbon-poc-staging` | `ENVIRONMENT=staging` → `/health` reports `"environment":"staging"`; config in `wrangler.staging.toml` |
| Database | D1 `netzero-staging-db` = `b291686f-ce8c-470c-aeef-92fe08e89b56` | full clone of staging `netzero` (2026-10-02, all 17 tables row-identical at clone time) |
| Object storage | R2 `netzero-photos-staging` | fresh/empty; dev evidence lives here |
| Secrets | fresh `SECRET`; `LIFF_ID` = same public LIFF id; `LINE_CHANNEL_ACCESS_TOKEN` / `LINE_CHANNEL_SECRET` / `OPENROUTER_API_KEY` = `staging-disabled` ⚠️ **DOCUMENTED BUT NOT TRUE — see known issues D1** | supposed to mean **no real LINE pushes from dev** (LINE-flow testing happens on staging); AI/vision features degrade gracefully |
| Build fingerprint | `/_staging-build.json` on the frontend host | byte-level proof of what's deployed |

## 🚫 PRODUCTION — does not exist yet

Will be provisioned fresh at launch (own worker / D1 / R2 / secrets / production LINE OA). Do not treat any current environment as production, and do not promote staging data to production implicitly.

### Test identities
`admin@netzero.com`, `qa-admin@netzero.com` (admin) · `sponsor@netzero.com`, `qa-sponsor@netzero.com` (sponsor) — accounts exist in both DBs (dev is a staging clone). Passwords: the client-facing staging password is in the committed client handoff; a rotated non-public set (2026-10-02) applies to the DEV stack and lives in local-only material. **Never commit staging or dev passwords to this public repo.** TL to confirm which password is valid against which stack before client sessions.

## Deploy ownership & discipline
- **TL deploys staging and dev** (frontend: assets-upload-session + multipart PUT preserving `proxy.js` verbatim; dev backend: `wrangler deploy --config wrangler.staging.toml`). Dev lanes: no deploys, no pushes, evidence to `qa/` only.
- Rollback points: frontend worker versions `cbbeea6d` / `149caab3` (pre-staging-r1); dev backend worker version `ab9b2dd6` (first deploy of `netzero-carbon-poc-staging`).
- Never `git add -A` (`.zcode/` not ignored). Merge to `main` requires human approval.

## Known issues at time of writing
- **D1 (dev isolation broken — verified 2026-10-02 ~13:05Z)**: the dev worker holds a **REAL LINE access token**, not `staging-disabled`. Probe: unsigned webhook event → handler pushed via LINE API → API answered **400 "property 'to' invalid"** (body validation = token authenticated; a fake token gets 401). Dev DB also holds 5 real `line_links` bindings, so dev CAN push real LINE messages to real farmers. LINE_CHANNEL_SECRET likewise is not `staging-disabled` (signed probe → 401). Worker secret-change deployments: 10 on 2026-10-02, latest 10:54Z (after docs were written). **Fix: `wrangler secret put` placeholders on `netzero-carbon-poc-staging`, then re-probe until LINE API returns 401.**
- **D2 (dev test passwords rotated, undocumented)**: `admin@netzero.com` and `sponsor@netzero.com` both return 401 with the public `ClawTest2026!` on dev (accounts exist in dev DB; verified 2026-10-02). Rotated 2026-10-02; rotated password not present in any tracked file. TL to record in local-only material.
- **D3 (webhook signature bypass — same code family on staging backend)**: `POST /webhook/line` only verifies `X-Line-Signature` **when the header is present** ("Always accept" comment, `src/index.ts:125-156`); unsigned POSTs are fully processed (verified: unsigned event → `{"processed":1}`). Anyone can forge farmer events on the LIVE webhook. Fix: reject unsigned/non-empty-event POSTs (or 401 like `src/line/webhook.ts` already does).
- **D4**: no code-upload deployment exists for the dev worker (10 secret-change deployments only) — provenance of the running code is undocumented; the `ab9b2dd6` rollback reference did not appear in the visible deployment list.
- **F1**: 017 sponsor login posts JSON → backend `POST /sponsor/login` first handler does `formData()` → unhandled **500** (duplicate handlers, lines 57+92 of `src/routes/sponsor.ts` @ 4d3739d). Fix lane `netzero-017-impl-f1-maker-r1` in flight (content-type dispatch, auth.ts b8 pattern). Interim: legacy sponsor portal on the **staging backend** host (`/sponsor/login`, urlencoded) works.
- Legacy e2e suites (218-test default collection) target pre-017 architecture — 113 fails vs staging is drift, not regression. Canonical Tier-2 = 3 parity specs (`admin-shell-parity`, `controls-parity`, `data-chrome-parity`) with `TIER2_BASE_URL` set → 22 passed / 0 failed / 12 skipped.
- Admin rail displays `admin@netzerocarbon.com` (cosmetic; working identity is `admin@netzero.com`).
