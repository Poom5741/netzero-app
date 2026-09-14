# Research: Sponsor Dashboard

**Date**: 2026-09-14
**Feature**: Sponsor Dashboard (specs/004-sponsor-dashboard)

## Research Tasks

### 1. Scope Isolation Pattern

**Decision**: Area-scoped queries with `getAreasForRequest` helper

**Rationale**: `src/routes/sponsor.ts` implements `getAreasForRequest` that filters all queries by the sponsor's configured `supported_areas` from the `users` table. This ensures sponsors can only see their own data. A 403 is returned if the area list is empty.

**Alternatives considered**:
- Row-level security in D1 — rejected because D1 (SQLite) doesn't support RLS; application-level filtering is the correct approach
- Separate database per sponsor — rejected because data sharing and cross-sponsor reporting would be impossible

### 2. Privacy Enforcement

**Decision**: CPA-code-only data shape at the route layer

**Rationale**: `src/routes/sponsor.ts` returns data with CPA codes and subplot codes only. Names, phone numbers, identity numbers, and deed numbers are never included in sponsor responses. This satisfies SP-BR-03 and SP-BR-04.

**Alternatives considered**:
- Field-level masking in a shared service — rejected because it's easier to enforce at the route boundary with a dedicated sponsor data shape
- Separate read-only views — rejected because the existing query layer can filter fields directly

### 3. Credit Visualization

**Decision**: Separate verified and estimated credits with visual distinction

**Rationale**: `src/sponsor/dashboard.ts` `getSeasonCredits` returns verified and estimated credits separately. The frontend renders them with distinct visual styles (deep-gradient card for verified, lighter treatment for estimates). This satisfies SP-OV-03 and SP-BR-05.

**Alternatives considered**:
- Single combined credit number — rejected because sponsors need to distinguish certified from estimated
- Percentage-based confidence — rejected because the binary verified/estimated distinction is clearer for reporting

### 4. Estimate Transparency

**Decision**: Explicit uncertainty note and credit-difference table

**Rationale**: The sponsor overview page includes a note explaining that estimates may change when evidence is incomplete and a conservative water-management factor (SF_w = 0.71) is used. The credit-difference table from `getGhgSourceBreakdown` explains baseline/project difference, methane contribution, and fertilizer parity. This satisfies SP-OV-07 and SP-OV-08.

**Alternatives considered**:
- Hide estimates entirely — rejected because sponsors need visibility into projected impact
- Complex statistical confidence intervals — rejected because the simple note is sufficient for the audience

### 5. Export with Privacy

**Decision**: CSV/JSON export with CPA-code-only fields and area filtering

**Rationale**: `src/routes/export.ts` checks the sponsor role and filters by supported areas. `src/export/estimates.ts` generates CSV/JSON with CPA codes only. This satisfies SP-OV-10 and SP-BR-04.

**Alternatives considered**:
- PDF export — rejected because CSV/JSON is more flexible for downstream analysis
- Excel export — rejected because CSV is simpler and universally supported

### 6. Frontend Rendering

**Decision**: Server-rendered HTML with inline CSS/JS for sponsor pages

**Rationale**: `src/routes/sponsor.ts` renders HTML directly from Hono routes. This avoids the complexity of a separate frontend build for sponsor pages while maintaining the neumorphic design system.

**Alternatives considered**:
- React SPA — rejected because sponsor pages are mostly read-only and don't benefit from client-side interactivity
- Next.js pages — rejected because sponsor pages are behind authentication and don't benefit from static export

## Best Practices Applied

1. **Web Crypto API**: All cryptographic operations use Web Crypto API (not node:crypto) per constitution
2. **Batch D1 queries**: Sponsor dashboard uses batch queries (`getPlotsByProvince` with 2 batch queries) to avoid N+1 problem
3. **Tailwind arbitrary values**: Custom spacing uses arbitrary values (e.g., `ml-[18rem]`) per Tailwind v4 constraints
4. **Material Symbols via <link>**: Font loaded via `<link>` tag, not `next/font/google`, per constitution
5. **Neumorphic design**: White cards on gray `#f0f4f8` background per design system
6. **Deep-gradient cards**: Used for certified credits prominence per design reference

## Conclusion

All technical decisions align with the constitution and existing implementation patterns. No new dependencies or abstractions required. The research phase confirms that the existing architecture is sufficient for the Sponsor Dashboard requirements.
