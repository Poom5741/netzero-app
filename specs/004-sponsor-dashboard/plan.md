# Implementation Plan: Sponsor Dashboard

**Branch**: `004-sponsor-dashboard` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-sponsor-dashboard/spec.md`

**Note**: This plan documents the existing implementation and identifies gaps for completion.

## Summary

The Sponsor Dashboard provides restricted access for supporting companies to view their configured areas, certified credits, households benefited, and credit-by-season data. The implementation enforces strict scope isolation (sponsors see only their areas), privacy rules (CPA codes only, no PII), and visual distinction between verified and estimated credits. The implementation is largely complete with 18 requirements mapped to existing source files. This plan identifies the current state and any remaining gaps.

## Technical Context

**Language/Version**: TypeScript 5.x (Cloudflare Workers runtime)

**Primary Dependencies**: Hono (HTTP framework), D1 (SQLite), R2 (object storage), KV (sessions), Next.js 16.3 (static export frontend), Tailwind v4

**Storage**: D1 (SQLite) for relational data, R2 for photo evidence, KV for session cookies

**Testing**: Vitest (unit tests), Playwright (e2e tests), browser-use (manual QA against production)

**Target Platform**: Cloudflare Workers (serverless edge), static HTML served via Workers

**Project Type**: Web service (Hono backend) + static frontend (Next.js export)

**Performance Goals**: <200ms API response time for dashboard views, <500ms for credit calculations

**Constraints**: D1 concurrent writes require mutex or batch transactions; Web Crypto API required (node:crypto broken in Workers); Tailwind v4 arbitrary values needed for custom spacing

**Scale/Scope**: ~50 sponsor accounts, ~200 supported areas, ~1000 farmers per sponsor, ~5000 plots per sponsor

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Gate

✅ **Phone-Is-Identity**: Sponsor Dashboard does not alter farmer identity flow. Phone-based linking remains the source of truth for farmers.

✅ **Production-First Testing**: All sponsor operations will be tested against production URLs (workers.dev) after deployment. TDD enforced for any new logic.

✅ **YAGNI Extremist**: No new abstractions introduced. Existing Hono routes, D1 queries, and HTML rendering patterns reused.

✅ **LINE-Native UX**: Sponsor Dashboard is a separate web interface, not LINE-dependent. No conflict with LINE-Native principle.

✅ **Design Consistency**: Neumorphic design (white cards on gray `#f0f4f8`), Material Symbols via `<link>`, responsive layout. No `next/font/google` (breaks static build).

### Post-Design Gate (after Phase 1)

✅ All design decisions align with constitution. No violations identified.

## Project Structure

### Documentation (this feature)

```text
specs/004-sponsor-dashboard/
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
│   └── sponsor.ts                    # Sponsor route group (HTML + API endpoints)
├── sponsor/
│   └── dashboard.ts                  # Core sponsor logic: PlotSummary, PlotDetail, getPlotsByProvince, getSponsorSummary, getSponsorFarmers, getSponsorAreas, getCertificates, getGhgSourceBreakdown, getSeasonCredits
├── auth/
│   ├── middleware.ts                 # requireRole middleware (sponsor role enforcement)
│   ├── session.ts                    # HMAC-signed session cookies
│   ├── password.ts                   # PBKDF2 password hashing
│   └── otp.ts                        # TOTP implementation
├── export/
│   └── estimates.ts                  # Carbon estimate export (CSV/JSON, sponsor role check)
└── db/
    └── migrate.sql                   # D1 schema (users with supported_areas, farmers, plots, carbon_estimates)
```

**Structure Decision**: Existing Hono route structure with sponsor-specific logic modules under `src/sponsor/`. No new directories required.

## Complexity Tracking

> No constitution violations. No complexity tracking required.

## Gap Analysis

Based on the traceability matrix, all 18 Sponsor Dashboard requirements are mapped to implementation files. However, the following areas may need verification or enhancement:

1. **SP-AUTH-01**: Branded login page rendering — verify split layout with Sponsor Portal eyebrow, NetZeroCarbon logo, supported-area title, scoped-access explanation, methodology reference, audit notice
2. **SP-OV-02**: PDPA/data boundary notice — verify notice explains CPA codes and no PII exposure
3. **SP-OV-03**: Certified credits card — verify deep-gradient card shows verified credits in tCO₂eq with certification period and estimate caveat
4. **SP-OV-07**: Estimate uncertainty note — verify note explains estimates can change when evidence is incomplete and conservative SF_w is used
5. **SP-OV-08**: Credit difference source table — verify table explains baseline/project difference, methane contribution, fertilizer parity
6. **SP-BR-01 through SP-BR-05**: Privacy rules — verify sponsor cannot access other sponsors' areas, cannot see PII, exports use CPA codes only

These gaps will be addressed in the implementation phase if testing reveals deficiencies.
