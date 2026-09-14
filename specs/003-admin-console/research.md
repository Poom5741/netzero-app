# Research: Admin Console

**Date**: 2026-09-14
**Feature**: Admin Console (specs/003-admin-console)

## Research Tasks

### 1. Authentication Pattern

**Decision**: HMAC-signed session cookies with TOTP OTP

**Rationale**: Existing `src/auth/session.ts` implements HMAC-SHA256 signed cookies with 24h Max-Age. `src/auth/otp.ts` implements RFC 6238 TOTP. This pattern is already in use and tested.

**Alternatives considered**:
- JWT tokens — rejected because session cookies provide server-side revocation
- OAuth2 — rejected because admin users are internal, not external identity providers

### 2. Role-Based Access Control

**Decision**: Middleware-based role enforcement with granular permission matrix

**Rationale**: `src/auth/middleware.ts` provides `requireRole()` middleware that accepts single role or array. `src/admin/settings.ts` implements a 5-role × 15-permission matrix. This pattern is already enforced on all admin routes.

**Alternatives considered**:
- Attribute-based access control (ABAC) — rejected because role-based is simpler and sufficient for 5 roles
- Per-route permission checks — rejected because middleware is more maintainable

### 3. Audit Logging

**Decision**: Append-only audit log with actor, timestamp, action, before/after values

**Rationale**: `src/admin/audit-log.ts` implements automation audit log for machine decisions. For admin actions, the same pattern applies: log user, time, action, previous value, new value. This satisfies AD-AUTH-03.

**Alternatives considered**:
- Event sourcing — rejected because full event sourcing is overkill for audit requirements
- Database triggers — rejected because application-level logging is more flexible and portable

### 4. Photo Review Workflow

**Decision**: Two-tier review with AI pre-verification and admin override

**Rationale**: `src/vision/preverify.ts` implements confidence-based pre-verification. `src/admin/review.ts` allows admin override with audit logging. This satisfies AD-REV-01 through AD-REV-03.

**Alternatives considered**:
- Single-tier manual review — rejected because AI pre-verification reduces admin workload
- Fully automated review — rejected because human oversight is required for certification

### 5. Calculation Traceability

**Decision**: Store calculation inputs and outputs in `carbon_estimates` table with version history

**Rationale**: `src/calc/orchestrator.ts` produces `EstimationResult` with all inputs and outputs. `src/season/approve-estimate.ts` persists results to D1. `src/admin/farmer-detail.ts` displays CalcTrace tab. This satisfies AD-CALC-01 and AD-CALC-02.

**Alternatives considered**:
- Recalculate on demand — rejected because historical estimates must be preserved for audit
- External calculation service — rejected because Workers-native calculation is faster and simpler

### 6. Data Export

**Decision**: CSV and JSON export with role-based field filtering

**Rationale**: `src/routes/export.ts` implements export endpoints with role checks. `src/export/estimates.ts` generates CSV/JSON. Admin sees full data; sponsor sees CPA-coded data only. This satisfies AD-FAR-03 and SP-OV-10.

**Alternatives considered**:
- PDF export — rejected because CSV/JSON is more flexible for downstream analysis
- Excel export — rejected because CSV is simpler and universally supported

### 7. Frontend Rendering

**Decision**: Server-rendered HTML with inline CSS/JS for admin pages

**Rationale**: `src/routes/admin.ts` renders HTML directly from Hono routes. This avoids the complexity of a separate frontend build for admin pages while maintaining the neumorphic design system.

**Alternatives considered**:
- React SPA — rejected because admin pages are mostly read-only and don't benefit from client-side interactivity
- Next.js pages — rejected because admin pages are behind authentication and don't benefit from static export

## Best Practices Applied

1. **Web Crypto API**: All cryptographic operations use Web Crypto API (not node:crypto) per constitution
2. **Batch D1 queries**: Photo review queue uses batch queries to avoid N+1 problem
3. **Tailwind arbitrary values**: Custom spacing uses arbitrary values (e.g., `ml-[18rem]`) per Tailwind v4 constraints
4. **Material Symbols via <link>**: Font loaded via `<link>` tag, not `next/font/google`, per constitution
5. **Neumorphic design**: White cards on gray `#f0f4f8` background per design system

## Conclusion

All technical decisions align with the constitution and existing implementation patterns. No new dependencies or abstractions required. The research phase confirms that the existing architecture is sufficient for the Admin Console requirements.
