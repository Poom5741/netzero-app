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

# Environment topology — STAGING vs PRODUCTION (READ BEFORE ANY DEPLOY)

> Established 2026-10-02 (staging-isolation mission). Ownership: **Tech Lead deploys staging**; Dev lanes never deploy.

## ⛔ PRODUCTION — do not touch without explicit user order

| Resource | Identifier | Notes |
|---|---|---|
| Backend worker | `netzero-carbon-poc` | LINE OA webhooks, real farmer data, `ENVIRONMENT=development` |
| Database | D1 `netzero` = `9f9cb6c3-ef8b-4d10-9457-b92c63f68d64` | prod data (4 farmers, real LINE bindings) |
| Object storage | R2 `netzero-photos` | prod evidence bucket |
| Secrets | `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `OPENROUTER_API_KEY`, `SECRET`, `LIFF_ID` | prod values — never copy into public files |
| LINE integration | LINE OA `netzero-test` + LIFF app `2011183008-7bEomfVF` | webhook points at prod backend; LIFF pages are backend-hosted by design |

## 🧪 STAGING — client testing environment

| Resource | Identifier | Notes |
|---|---|---|
| Frontend worker | `netzero-frontend` (workers.dev) | fresh `main` assets + `proxy.js` + `BACKEND` service binding → **staging** backend; asset-layer contract `run_worker_first: ["/api/*","/login","/logout","/redirect","/sponsor-login","/evidence/*"]` (without it `POST /login` 405s — repo `frontend/wrangler.jsonc` is STALE, assets-only; true config lives in deploy metadata) |
| Backend worker | `netzero-carbon-poc-staging` | `ENVIRONMENT=staging` → `/health` reports `"environment":"staging"`; config in `wrangler.staging.toml` |
| Database | D1 `netzero-staging-db` = `b291686f-ce8c-470c-aeef-92fe08e89b56` | full clone of prod `netzero` (2026-10-02, all 17 tables row-identical at clone time) |
| Object storage | R2 `netzero-photos-staging` | fresh/empty; staging evidence lives here |
| Secrets | fresh `SECRET`; `LIFF_ID` = same public LIFF id; `LINE_CHANNEL_ACCESS_TOKEN` / `LINE_CHANNEL_SECRET` / `OPENROUTER_API_KEY` = `staging-disabled` | **no real LINE pushes from staging** (LINE-flow testing happens on the prod-linked OA); AI/vision features degrade gracefully |
| Build fingerprint | `/_staging-build.json` on the frontend host | byte-level proof of what's deployed |

### Staging test identities (rotated 2026-10-02 — NOT the public ClawTest2026!)
`admin@netzero.com`, `qa-admin@netzero.com` (admin) · `sponsor@netzero.com`, `qa-sponsor@netzero.com` (sponsor).
Password lives in the **local-only** `docs/handoff/STAGING-HANDOFF-clients-2026-10-02.md` (untracked) — never commit staging or prod passwords to this public repo.

## Deploy ownership & discipline
- **TL deploys staging** (frontend: assets-upload-session + multipart PUT preserving `proxy.js` verbatim; backend: `wrangler deploy --config wrangler.staging.toml`). Dev lanes: no deploys, no pushes, evidence to `qa/` only.
- Rollback points: frontend worker versions `cbbeea6d` / `149caab3` (pre-staging-r1); backend staging worker version `ab9b2dd6` (first staging deploy).
- Never `git add -A` (`.zcode/` not ignored). Merge to `main` requires human approval.

## Known issues at time of writing
- **F1**: 017 sponsor login posts JSON → backend `POST /sponsor/login` first handler does `formData()` → unhandled **500** (duplicate handlers, lines 57+92 of `src/routes/sponsor.ts` @ 4d3739d). Fix lane `netzero-017-impl-f1-maker-r1` in flight (content-type dispatch, auth.ts b8 pattern). Interim: legacy sponsor portal on the **staging backend** host (`/sponsor/login`, urlencoded) works.
- Legacy e2e suites (218-test default collection) target pre-017 architecture — 113 fails vs staging is drift, not regression. Canonical Tier-2 = 3 parity specs (`admin-shell-parity`, `controls-parity`, `data-chrome-parity`) with `TIER2_BASE_URL` set → 22 passed / 0 failed / 12 skipped.
- Admin rail displays `admin@netzerocarbon.com` (cosmetic; working identity is `admin@netzero.com`).
