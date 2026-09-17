# Implementation Plan: Claude Multi-Page Design Parity

**Branch**: `010-claude-design-parity` | **Date**: 2026-09-17 | **Spec**: [spec.md](../spec.md)

**Input**: Feature specification from `/specs/010-claude-design-parity/spec.md`

## Summary

Apply the Claude multi-page design artifacts to existing Admin and Sponsor routes by establishing one authoritative artifact map, generating trustworthy source-reference captures for 11 in-scope routes, applying shared Claude visual tokens (232px sidebar, navy-900, teal-600, Fira Sans), and verifying visual parity with evidence. Preserve all existing behavior, privacy, audit, and accessibility constraints. Defer missing routes and native LINE parity.

## Technical Context

**Language/Version**: TypeScript 5.7, React 19, Next.js 16.3.2

**Primary Dependencies**: 
- Frontend: Next.js, Tailwind v4, Playwright for visual captures
- Backend: Hono, Cloudflare Workers, D1
- Visual: Existing `tests/visual/lib/capture.ts`, reference-harness, provenance utilities

**Storage**: N/A (no new database tables)

**Testing**: 
- Playwright for E2E validation
- Existing unit/integration tests
- New visual comparison scripts

**Target Platform**: Cloudflare Workers (backend), static-export Next.js (frontend), browser UI

**Project Type**: web-service (Next.js frontend + Hono backend)

**Performance Goals**: 
- Source captures render deterministically in <5s
- Implementation pages maintain existing load times
- Visual comparison completes in <30s per route

**Constraints**: 
- Thai readability: 1.6 line-height minimum
- Touch targets: 44px minimum
- No `next/font/google` (breaks static build)
- Claude bundles remain reference-only

**Scale/Scope**: 11 Admin/Sponsor routes, 3 surfaces (admin/sponsor/line-oa), 2 desktop viewports, 1 mobile viewport

## Constitution Check

**GATES PASSED** — All constitution principles satisfied:

- **Phone-Is-Identity**: Preserved (no changes to identity logic)
- **Production-First Testing**: Visual captures include deployed surfaces where possible
- **YAGNI Extremist**: No new dependencies; reuse existing visual infrastructure
- **LINE-Native UX**: Preserved (no changes to LINE chat behavior)
- **Evidence-Driven Accounting**: Preserved (no changes to credit calculation)
- **Privacy and Least Privilege**: Preserved (no changes to sponsor data scope)
- **Auditability and Safe Decisions**: Preserved (no changes to audit records)
- **Design Consistency**: Primary goal (align to Claude source tokens)

## Project Structure

### Documentation (this feature)

```text
specs/010-claude-design-parity/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── reference-capture-manifest.schema.json
│   └── route-parity-matrix.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── sponsor/
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── dashboard/
│   │       ├── dashboard-sidebar.tsx
│   │       └── dashboard-header.tsx
│   └── lib/
└── tests/
    └── visual/
        ├── lib/
        ├── reference-harness/
        └── scripts/
```

**Structure Decision**: Web application with shared visual foundation. Claude design references are external and used only for capture generation; no artifact runtime dependencies are introduced.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [None] | [All gates passed] | [No violations require justification] |