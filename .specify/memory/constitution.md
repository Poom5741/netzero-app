<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0
- Modified principles: expanded Production-First Testing, LINE-Native UX, and Design Consistency
- Added principles: Evidence-Driven Accounting, Privacy and Least Privilege, Auditability and Safe Decisions, Simplicity and Existing Patterns
- Added sections: Technical and Compliance Constraints
- Removed sections: none; existing technology, workflow, quality gates, and pitfalls preserved
- Follow-up TODOs: none
-->

# NetZero Carbon POC Constitution

## Core Principles

### I. Phone-Is-Identity
Farmer identity MUST be treated as the phone number, not an account. If the phone matches a
registered farmer, the system MUST trust the identity link without an unnecessary verification
gate. A farmer's authorized family representative may enter data on the farmer's behalf.

### II. Production-First Testing
Tests MUST include the deployed workers.dev surface where credentials and environment access
permit; localhost-only tests are insufficient for integration claims. New business logic MUST
follow test-first development: write a failing test, implement the smallest change, then refactor.
Mock data MUST NOT be treated as evidence that migrations or deployed bindings work.

### III. YAGNI Extremist
Deletion comes before addition. The project MUST prefer the standard library, native platform
features, and existing dependencies and patterns over new abstractions. An abstraction without
at least two concrete implementations requires explicit justification. Code MUST NOT be added
"for later" without a current acceptance criterion.

### IV. LINE-Native UX
LINE chat MUST remain the primary farmer interface. Farmer workflows MUST use Flex messages,
postbacks, and rich-menu actions where appropriate. LIFF deep links MUST be reserved for camera
or file access and other capabilities unavailable in chat. Ordinary LINE chat photos MUST NOT be
classified as project evidence.

### V. Evidence-Driven Carbon Accounting
Carbon estimates MUST be traceable to plot-season inputs and required evidence. Estimates MUST
remain distinct from verified credits, and displayed results MUST expose methodology treatment,
source inputs, and verification status. Farmer-entered fertilizer quantities MUST NOT be silently
changed.

### VI. Privacy and Least Privilege
Personally identifiable farmer data MUST be limited to authorized administrative contexts.
Sponsor-facing APIs, pages, and exports MUST use CPA codes and assigned-area scope. Each role
MUST receive only the data and capabilities required for its work.

### VII. Auditability and Safe Decisions
Privileged reads and writes, automated decisions, and human overrides MUST produce append-only
audit records with actor, timestamp, action, and applicable previous and new values. Reject,
hold, and retake decisions MUST preserve a farmer-communicable reason. Missing or invalid
evidence MUST remain visibly unresolved.

### VIII. Design Consistency
Modern web surfaces MUST use the project design tokens: neumorphic cards are white on gray
`#f0f4f8`, and Material Symbols MUST load through a Google Fonts `<link>` rather than
`next/font/google`, which breaks the static build. Upload and summary pages MUST remain usable
without restrictive max-width containers, and the sponsor sidebar MUST be responsive.

## Technical and Compliance Constraints

- Backend runs on Cloudflare Workers with Hono, D1, R2, and KV; the frontend uses Next.js static
  export and Tailwind v4.
- Workers cryptography MUST use Web Crypto APIs rather than `node:crypto`.
- D1 operations that must be atomic MUST use a transaction or batch strategy.
- Static-export builds MUST receive public API configuration at build time.
- Thai is the primary user-facing language; controls MUST have accessible labels and usable touch
  targets.
- AI features MUST use the approved OpenRouter/Qwen integration pattern and preserve safe fallback
  behavior when the model or proxy is unavailable.

## Development Workflow

### Spec → Implement (speckit)
1. `/speckit-specify` — write the specification.
2. `/speckit-plan` — create the implementation plan.
3. `/speckit-tasks` — break the plan into traceable tasks.
4. `/speckit-implement` — implement tasks in dependency order.
5. `/speckit-converge` — reassess and repeat until no gaps remain.

### Review → Verify (both systems)
1. Run `./scripts/check-spec-compliance.sh` for the custom requirement check.
2. Run `/speckit-converge` for the specification-to-code assessment.
3. Both checks MUST pass before merge.
4. Run visual regression for UI features.
5. Run browser-use manual QA against production for critical flows.

## Quality Gates

- **Pre-commit:** Run the Mimosa security scan and resolve genuine findings; rename misleading
  fixture fields only when a finding is demonstrably a scanner false positive.
- **Pre-merge:** Both specification checkers pass, all tests are green, and visual QA is complete
  for UI changes.
- **Post-deploy:** Run a health check and browser verification of critical public flows.
- **Security:** No secrets, credentials, or personal data may be committed to source or fixtures.

## Known Pitfalls

- D1 concurrent writes to the same row require a mutex or batch transaction.
- `node:crypto` HMAC is broken in Workers; use Web Crypto API.
- `ml-72` and `left-72` are invalid in Tailwind v4; use arbitrary values or custom CSS.
- `next/font/google` breaks the Next.js 16.3.2 static build; use `<link>` tags.
- LINE `replyToken` is single-use; batch replies into one call.
- Wrangler deploy may hang in the sandbox; use `script -q /dev/null wrangler deploy` when needed.

## Governance

This constitution supersedes conflicting project practices. Amendments MUST be made through the
Spec Kit constitution workflow, include a sync impact report, preserve applicable existing
constraints, and increment the semantic version. Major changes remove or redefine a principle;
minor changes add or materially expand a principle or section; patch changes clarify wording
without changing governance intent.

Every plan, task list, convergence pass, code review, and release review MUST check applicable
principles. Any exception MUST document its scope, rationale, risk, and upgrade or removal
condition. Amendments also require an ADR when they materially alter architecture or workflow.

**Version**: 1.1.0 | **Ratified**: 2026-09-14 | **Last Amended**: 2026-09-14
