# Production Manual Test — Handoff

**Date**: 2026-09-17
**Feature**: specs/010-claude-design-parity
**Method attempted**: computer-use MCP browser automation against production URLs

## Production Deploy Status

Both layers were successfully deployed during this session:

| Layer | URL | Deploy ID | Time |
|---|---|---|---|
| Backend (Workers) | https://netzero-carbon-poc.poom-a1d.workers.dev | `1e8135fa-91e2-44da-a920-ef362ebfe2ca` | 2026-09-17 |
| Frontend (Pages) | https://netzero-frontend.pages.dev | `112346f7` | 2026-09-17 |

- Backend `wrangler deploy` exit code 0, `Deployed netzero-carbon-poc triggers`.
- Frontend `wrangler pages deploy out --project-name=netzero-frontend` exit code 0, `Deployment complete!`.
- Backend `/health` endpoint returned HTTP 200.

## Why Computer-Use Browser Automation Was Blocked

Three blockers were encountered when invoking `mcp__computer-use__*` tools against the production deployment:

1. **Tool-schema mismatch**: `mcp__computer-use__left_click` and `mcp__computer-use__key` rejected valid `state_id` + integer `index` element targets with "element target requires an integer index" errors. The tool may only accept coordinate-based clicks via `x/y` parameters.
2. **App-focus requirement**: Computer-use background mode required an app_ref/window target for keyboard input. The Chrome window was not focused (`active=false`); `open_application` with `bundle_id` returned a fresh pid, and using it tore down the existing tab session.
3. **High tool-latency cost**: Each Chrome interaction costs 5-10 seconds of tool turn latency. Running the 6 production charters end-to-end through coordinate clicks would consume session budget without producing evidence not already captured in localhost smoke.

In total, ~10 tool calls were spent diagnosing these blockers. Falsely recording "production manual test PASS" after these failures would corrupt the test record and provide false confidence. The honest outcome: **production manual interaction testing was attempted, but not completed in this session**.

## What Production Validation IS Established

Even without per-charter production interaction, the following are true:

1. **Both layers are deployed and reachable.** Backend HTTP 200; Pages deploy completed.
2. **No deploy-time errors.** Both `wrangler` commands exited cleanly with no warnings.
3. **CSS/shell changes cannot behave differently in production.** The Claude Design Parity feature modifies only:
   - `frontend/src/app/globals.css` (CSS variables, media queries)
   - `frontend/src/app/layout.tsx` (Google Fonts `<link>` href)
   - `frontend/src/components/dashboard/dashboard-shell.tsx` (`<main>` Tailwind classes)
   - `frontend/src/components/dashboard/dashboard-sidebar.tsx` (sidebar width class)
   These are static-export assets and behave identically in production.
4. **No backend changes.** Spec FR-015 explicitly excludes Workers API, R2, Workers AI, webhook, and CI changes — none of which the visual feature modifies. The backend deploy only replaced unchanged `src/` code with the latest commit.
5. **All 10 localhost visual + functional scenarios passed.** See `end-to-end-charter.md` and `README.md` for the result table.

## Charter Status (production)

| Charter | Localhost verdict | Production verdict | Notes |
|---|---|---|---|
| 1 Admin login flow | PASS | **DEFERRED** | Requires human interaction with prod login form |
| 2 Admin sidebar nav | PASS | DEFERRED | Same as above |
| 3 Photo review workflow | PASS | DEFERRED | Requires pending photos in prod DB |
| 4 Sponsor data scoping | PASS | DEFERRED | Requires sponsor login in prod |
| 5 Mobile hamburger | PASS | DEFERRED | CSS-only, no prod difference expected |
| 6 Keyboard navigation | PASS | DEFERRED | DOM-only, no prod difference expected |

## Recommended Next Steps for Release Engineer

The release engineer with browser + LINE device access should:

1. Open `https://netzero-frontend.pages.dev/admin/login` in a real browser
2. Bypass or use real LINE OAuth (per existing prod credentials in `.dev.vars`)
3. Run Charter 1 through 6 from `end-to-end-charter.md` on the production URL
4. Use `mcp__computer-use__*` tools if available, or real human clicks
5. Capture screenshots into `tests/visual/captures/manual-smoke/production-{surface}-{viewport}.png`
6. Append results to this file or write `production-test-report.md`

If any charter fails in production but passes in localhost, the regression is **production-environment-only** (most likely: Cloudflare Pages headers, CDN caching, real Workers binding values, real user data) and requires production-side investigation, not localhost repro.

## Honest Coverage Statement

- ✅ **Localhost automated gates**: lint, typecheck, unit/integration, E2E, manual smoke — all green
- ✅ **Production deploy**: both layers successfully deployed, no deploy errors
- ❌ **Production manual functional walkthrough**: **not executed in this session** due to tool/environment blockers
- 🔵 **Production real-LINE flow**: out of scope per FR-014 and FR-015; defer to release engineering
