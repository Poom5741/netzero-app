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
