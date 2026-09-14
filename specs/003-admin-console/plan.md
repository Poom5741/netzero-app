# Implementation Plan: Admin Console

**Branch**: `003-admin-console` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-admin-console/spec.md`

**Note**: This plan documents the existing implementation and identifies gaps for completion.

## Summary

The Admin Console provides privileged access for administrators, verifiers, field staff, sponsors, and auditors to manage farmer registration, review evidence, view credit calculations, and export reports. The implementation is largely complete with 29 requirements mapped to existing source files. This plan identifies the current state and any remaining gaps.

## Technical Context

**Language/Version**: TypeScript 5.x (Cloudflare Workers runtime)

**Primary Dependencies**: Hono (HTTP framework), D1 (SQLite), R2 (object storage), KV (sessions), Next.js 16.3 (static export frontend), Tailwind v4

**Storage**: D1 (SQLite) for relational data, R2 for photo evidence, KV for session cookies

**Testing**: Vitest (unit tests), Playwright (e2e tests), browser-use (manual QA against production)

**Target Platform**: Cloudflare Workers (serverless edge), static HTML served via Workers

**Project Type**: Web service (Hono backend) + static frontend (Next.js export)

**Performance Goals**: <200ms API response time for dashboard views, <500ms for photo review operations

**Constraints**: D1 concurrent writes require mutex or batch transactions; Web Crypto API required (node:crypto broken in Workers); Tailwind v4 arbitrary values needed for custom spacing

**Scale/Scope**: ~1000 farmers, ~5000 plots, ~20000 photo evidence records, 5 roles with granular permissions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Gate

✅ **Phone-Is-Identity**: Admin Console does not alter farmer identity flow. Phone-based linking remains the source of truth.

✅ **Production-First Testing**: All admin operations will be tested against production URLs (workers.dev) after deployment. TDD enforced for any new logic.

✅ **YAGNI Extremist**: No new abstractions introduced. Existing Hono routes, D1 queries, and HTML rendering patterns reused.

✅ **LINE-Native UX**: Admin Console is a separate web interface, not LINE-dependent. No conflict with LINE-Native principle.

✅ **Design Consistency**: Neumorphic design (white cards on gray `#f0f4f8`), Material Symbols via `<link>`, responsive layout. No `next/font/google` (breaks static build).

### Post-Design Gate (after Phase 1)

✅ All design decisions align with constitution. No violations identified.

## Project Structure

### Documentation (this feature)

```text
specs/003-admin-console/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
├── spec.md              # Feature specification
├── traceability.md      # Requirement-to-implementation mapping
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

```text
src/
├── routes/
│   └── admin.ts                    # Admin route group (HTML + API endpoints)
├── admin/
│   ├── overview.ts                 # Overview KPIs, work queue, credit charts
│   ├── review.ts                   # Photo review: approve/reject with audit
│   ├── applications.ts             # Application review: approve/reject/hold
│   ├── farmer-detail.ts            # 5-tab farmer detail panel
│   ├── queue.ts                    # Photo review queue logic
│   ├── queue-digest.ts             # Queue digest cron
│   ├── precision.ts                # Pre-verify precision stat
│   ├── audit-log.ts                # Automation audit log
│   ├── detail.ts                   # Single photo detail query
│   ├── reports.ts                  # 6-report catalogue
│   ├── settings.ts                 # 5-tab settings panel
│   └── sponsors.ts                 # Sponsor management
├── auth/
│   ├── middleware.ts               # requireRole middleware
│   ├── session.ts                  # HMAC-signed session cookies
│   ├── password.ts                 # PBKDF2 password hashing
│   └── otp.ts                      # TOTP implementation
└── db/
    └── migrate.sql                 # D1 schema (users, farmers, plots, etc.)
```

**Structure Decision**: Existing Hono route structure with admin-specific logic modules under `src/admin/`. No new directories required.

## Complexity Tracking

> No constitution violations. No complexity tracking required.

## Gap Analysis

Based on the traceability matrix, all 29 Admin Console requirements are mapped to implementation files. However, the following areas may need verification or enhancement:

1. **AD-AUTH-01**: Branded login page rendering — verify split layout with deep gradient, logo, Thai project title, methodology reference
2. **AD-OV-03**: Work queue urgency indicators — verify age/urgency display for pending items
3. **AD-FAR-02**: Personal data protection — verify role-based field access (names visible only to authorized admin)
4. **AD-APP-05**: Placeholder labeling — verify OCR/automation status markers are visible
5. **AD-CALC-02**: Traceable calculation inputs — verify CalcTrace tab shows all source values
6. **AD-ROLE-02**: Permission categories — verify all 15 permission categories are enforced

These gaps will be addressed in the implementation phase if testing reveals deficiencies.
