# NetZero Carbon POC Constitution

## Core Principles

### I. Phone-Is-Identity
Farmer identity = phone number, not account. If phone matches, trust immediately. No verification gate. Farmer's nephew may enter data — that's fine.

### II. Production-First Testing
Tests must run against production URLs (workers.dev), not just localhost. Mock data hides migration gaps. TDD mandatory: tests written → fail → implement → pass. Red-Green-Refactor strictly enforced.

### III. YAGNI Extremist
Deletion before addition. No abstractions without 2+ implementations. No boilerplate "for later." Ship the one-liner and challenge the requirement. Stdlib over dependency. Native platform feature over custom code.

### IV. LINE-Native UX
LINE chat is primary interface, not LIFF standalone. Flex messages, postback buttons, rich menu. LIFF deep-links only when camera/file access required. Chat must feel like talking to a human, not a bot.

### V. Design Consistency
Modern web: neumorphism (white cards on gray `#f0f4f8`), glassmorphism, claymorphism. Material Symbols font via Google Fonts `<link>` (not `next/font/google` — breaks static build). No max-w constraints on upload/summary. Responsive sponsor sidebar.

## Technology Stack

- **Backend:** Cloudflare Workers (Hono), D1 (SQLite), R2 (images), KV (sessions)
- **Frontend:** Next.js 16.3 static export, Tailwind v4
- **LINE:** Messaging API, LIFF, flex messages, rich menu
- **AI:** OpenRouter (Qwen 3.6 Flash), 9router proxy on VPS
- **Testing:** Vitest (unit), Playwright (e2e), browser-use (manual QA)
- **Deploy:** Wrangler CLI, workers.dev domain

## Development Workflow

### Spec → Implement (speckit)
1. `/speckit-specify` — write spec
2. `/speckit-plan` — create plan
3. `/speckit-tasks` — break into tasks
4. `/speckit-implement` — implement tasks
5. `/speckit-converge` — repeat until converged

### Review → Verify (both systems)
1. `./scripts/check-spec-compliance.sh` — custom check (36 requirements)
2. `/speckit-converge` — speckit convergence report
3. Both must pass before merge
4. Visual regression: `npm run test:visual` (if UI feature)
5. Manual QA: browser-use against production

## Quality Gates

- **Pre-commit:** Mimosa security scan (rename `apiKey`/`token` fields to avoid false positives)
- **Pre-merge:** Both spec checkers pass, all tests green, visual QA (if UI)
- **Post-deploy:** Curl health check, browser verification of critical flows

## Known Pitfalls

- D1 concurrent writes to same row → mutex or batch transaction
- `node:crypto` HMAC broken in Workers → use Web Crypto API
- `ml-72`/`left-72` invalid in Tailwind v4 → use arbitrary values or custom CSS
- `next/font/google` breaks Next 16.3.2 static build → use `<link>` tags
- LINE replyToken single-use → batch all replies into one call
- Wrangler deploy hangs in sandbox → use `script -q /dev/null wrangler deploy`

## Governance

This constitution supersedes all other practices. Amendments require:
1. Document the change in `docs/adr/`
2. Update this constitution
3. Migrate existing code if needed
4. Commit message: `docs: amend constitution — [reason]`

**Version**: 1.0.0 | **Ratified**: 2026-09-14 | **Last Amended**: 2026-09-14
