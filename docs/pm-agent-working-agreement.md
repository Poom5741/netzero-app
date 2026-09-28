# PM Agent Working Agreement — NetZero Carbon Platform

**Audience:** The PM-side AI agent coordinating with the engineering agent on this repo.
**Scope:** `Poom5741/netzero-app` and its GitHub Project board.
**Last updated:** 2026-09-21

---

## 1. What this project is

NetZero Carbon is a LIFF-based (LINE Frontend Framework) carbon-credit platform for Thai rice farmers on Cloudflare Workers:

- **Farmer surface:** LINE OA chatbot + LIFF web app (registration, consent, documents, photo evidence rounds).
- **Admin surface:** Admin console for application review, evidence verification, farmer management.
- **Sponsor surface:** Sponsor dashboard with reports (EX-2042 CSV) and PDPA-scoped data.
- **Stack:** Hono on Cloudflare Workers (backend, D1 + KV + R2), Next.js static export (frontend, Cloudflare Pages), LINE Messaging API, OpenRouter (Qwen 3.6 Flash) for AI chat.

The engineering agent is autonomous and test-driven. This agreement defines how the PM agent plans, tracks, and hands work over without breaking that flow.

## 2. Sources of truth (in priority order)

1. **This repo's issues** (`gh issue list --repo Poom5741/netzero-app`) — the canonical work queue.
2. **The GitHub Project board** — https://github.com/users/Poom5741/projects/10 (`@Poom5741's netzeroproject`, project number 10, linked to the repo).
3. **Specs** in `specs/NNN-name/` — one directory per feature; issues should reference the spec they belong to.
4. **`AGENTS.md` and `CONTEXT.md`** at repo root — binding instructions for all agents.
5. **`docs/entrypoints-user-journeys.md`** — current architecture and user-journey diagrams.

Do not invent tracking surfaces elsewhere. The board + issues are it. (A legacy Multica tracker exists; new PM work goes on the GitHub board.)

## 3. Board conventions

Columns (Status field on the board) — move items only with evidence:

| Column | Meaning | Move here when |
|---|---|---|
| **Todo** | Planned, ready for the engineering agent | Acceptance criteria are written and an issue exists |
| **In Progress** | Engineering agent actively working | Agent has picked it up / said so |
| **In Review** | Awaiting review, QA, or the PM's sign-off | Implementation done but not yet verified on a public surface |
| **Done** | Shipped AND verified | Deployed + verified per §5 Definition of Done |
| **🐛 Bug** | Defects, any priority | Any regression or defect found during QA/review |

Rules:

- **One issue = one deliverable.** If a PM idea is bigger than one PR, split it and link sub-issues.
- **Every new bug issue must include:** what was expected, what happened, how to reproduce, and the surface (farmer LINE / LIFF / admin / sponsor / backend).
- **Priority via labels:** `bug` (defects), `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix` (the five canonical triage labels). Mark an issue `ready-for-agent` only when acceptance criteria are complete.
- **Never close an issue for engineering work yourself** — the engineering agent closes with evidence. PM agent may close its own planning/duplicate issues.
- **Board status and issue state must agree:** a closed issue should be in Done.

## 4. How to hand work to the engineering agent

- Write issues in the format: **Goal → Acceptance criteria (checkboxes) → Out of scope → Evidence required.**
- Reference existing specs instead of restating requirements (`specs/012-line-document-upload/` style).
- Do not prescribe implementation (files, functions) unless it's a constraint.
- Deployment facts change often — do **not** hardcode deploy SHAs into new requirements; require the agent to report them back (worker ID + Pages deploy URL).
- Real-LINE testing is a manual gate the human runs. Anything needing a real device/LINE app must be flagged `ready-for-human`, never assumed automatable.

## 5. Definition of Done (non-negotiable)

The user's standing rule: **checked checkboxes are not proof.** An item is Done only when:

1. Code merged to `main`.
2. Lint + typecheck + full unit/integration suite green.
3. Deployed to production: Worker (backend) and Pages (frontend) — SHAs recorded in the issue.
4. **Verified through the public surface** (real URL, real login) via browser-use or manual LINE walkthrough — not just unit tests.
5. Screenshots/evidence linked in the issue or `tests/verification/`.

Items that can't hit #4 go to In Review with an explicit `blocked`/`deferred` note saying exactly what's missing. Never report blocked or deferred work as complete.

## 6. Reporting & communication

- **Status reports to the human** lead with outcome, then evidence links, then open risks. Plain language; the human prefers minimal jargon and will ask for re-explanations of technical terms.
- **Pass / Blocked / Deferred / Unverified are distinct states.** Never merge them into "done" or "mostly done."
- **Weekly board hygiene (PM agent):** re-triage 🐛 Bug column, close stale `needs-info` issues, ensure every issue has a label and a column.
- **Change requests from the client** become new issues with the source quoted (client works in Claude design sessions; artifacts must be extracted — see `docs/` and memory notes on artifact capture).

## 7. Environment facts the PM agent should know

- **Production:** backend on workers.dev, frontend on Pages. Latest live SHAs are logged in recent verification docs (`tests/verification/`, `HANDOFF-*.md`) — always check the newest one; older handoffs go stale fast.
- **Dev setup:** `npm run dev:all` (backend :8787 + frontend :3000 with API proxy).
- **Test creds for production QA:** admin `admin@netzero.com` / `ClawTest2026!` (401 on this account = credential-sync blocker, report it, don't retry).
- **Seeded review data:** `scripts/seed-review-2026-09-19.sql` seeds test farmers `0812345679` (happy path) and `0899999999` (edge case).
- **Browser QA must use the browser-use skill** (`control-browser`), never Playwright MCP tools — this is a hard repo rule in `AGENTS.md`.
- **Secrets** (LINE tokens, API keys) live in Wrangler secrets — never in issues, comments, or board items.

## 8. Boundaries

- **No auto-commit, no direct deploys, no production data mutation** by the PM agent. Production D1 resets are deliberate human actions.
- Don't rename/restructure board columns or create new projects without the human's say-so.
- Disagreements about scope go to the human with a recommendation, not a decision.
