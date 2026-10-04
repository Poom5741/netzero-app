# ADR-001: Provision production as a fresh, isolated stack at launch

- **Status**: Proposed (2026-10-05)
- **Context**: The project has two environments — STAGING (original stack, client-facing, real LINE OA `netzero-test`) and DEV (isolated clone). **No production environment exists.** Everything in AGENTS.md's topology section establishes that neither current environment may be implicitly treated as production.
- **Decision**: Production will be provisioned as a brand-new stack with zero inherited state, mirroring the DEV-isolation pattern that proved itself on 2026-10-02 (D1–D4 findings). Staging data is never promoted.

## Resources (all new, all suffixed `-prod`)

| Resource | Identifier | Notes |
|---|---|---|
| Backend worker | `netzero-carbon-poc-prod` | `ENVIRONMENT=production`; config `wrangler.prod.toml` (clone of staging config, renamed bindings) |
| Database | D1 `netzero-prod` | Empty schema from `src/db/migrate.sql`; seed ONLY admin/sponsor identities via explicit script |
| Object storage | R2 `netzero-photos-prod` | Empty; production evidence bucket |
| Secrets | Fresh values | `SECRET` (new), `LINE_CHANNEL_ACCESS_TOKEN`/`SECRET` from the **production LINE OA**, `OPENROUTER_API_KEY`, `LIFF_ID` of the production LIFF app |
| Frontend worker | `netzero-frontend-prod` | Fresh `main` assets + `proxy.js` verbatim; `BACKEND` service binding → prod backend; `run_worker_first` asset-layer contract per AGENTS.md (else `POST /login` 405s) |
| Build fingerprint | `/_prod-build.json` | Byte-level proof of deployed assets |

## LINE OA (separate channel, not `netzero-test`)

1. Create the production LINE OA + Messaging API channel; enable the webhook pointed at the prod backend `/webhook/line`.
2. Configure the production LIFF app; set `LIFF_ID` secret on the prod worker.
3. Register the rich menu on the production channel (`scripts/register-rich-menu.ts --apply` with prod token) — see the T-208 decision record first (menu `selected` state is a product decision).
4. Never reuse the `netzero-test` channel token in prod.

## Promotion discipline (non-negotiable)

- Schema travels by migration file (`src/db/migrate.sql` and successors), never by data clone.
- No row data moves from staging/dev to production except through an explicit, reviewed seed script.
- Secrets are entered once, by hand, at provision time; they are never copied between stacks or into tracked files.
- Rollback: record the worker version id at first prod deploy; each subsequent deploy updates the rollback point in AGENTS.md.

## Launch gates (go/no-go)

1. Full `bun run check` green on the release commit.
2. Staging client session completed with no open critical defects.
3. Prod worker `/health` reports `"environment":"production"`.
4. Signed-webhook probe → 200; unsigned probe → 401 (D3 regression check on prod).
5. Admin + sponsor login round-trip on prod with fresh identities.
6. Farmer onboarding through LIFF registration on the production LINE OA.

## Consequences

- Two existing stacks stay untouched; staging remains the client test bed.
- A third stack to deploy means the TL deploy discipline (frontend assets-upload-session, backend `wrangler deploy --config wrangler.prod.toml`) applies to prod too.
- Cost: one more D1/R2/worker set (negligible) vs. the risk of contaminated launch data (high).
