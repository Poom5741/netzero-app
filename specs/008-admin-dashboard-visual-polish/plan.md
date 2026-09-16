# Implementation Plan: Admin Dashboard Visual Polish

**Branch**: `008-admin-dashboard-visual-polish` | **Date**: 2026-09-16 | **Spec**: [spec.md](./spec.md)

## Summary

Refresh the existing Admin Console visual layer to match the approved admin baseline while preserving all existing workflows and data behavior. Enhance shared shell and evidence-review components in place, add the missing overview visualization treatments with lightweight existing primitives, and verify desktop/tablet visual states plus regression behavior. No new business workflow or data model is required.

## Technical Context

**Language/Version**: TypeScript, Next.js 16.3 static export

**Primary Dependencies**: Existing React components, Tailwind CSS v4, project design tokens, Material Symbols via Google Fonts link

**Storage**: Existing Cloudflare Worker/D1/R2/KV services; unchanged

**Testing**: Existing unit/integration tests, project compliance script, browser-use manual QA, visual capture/comparison

**Target Platform**: Desktop browsers at 1280×800; tablet browsers at 768–1024px

**Project Type**: Web application with frontend and backend

**Performance Goals**: Overview usable with visualizations within 3 seconds on a throttled 10 Mbps run; interaction feedback begins within 100ms and transitions complete within 300ms

**Constraints**: Preserve authentication, role-based privacy, evidence decisions, retake reasons, review history, audit records, loading/error states, and static-export compatibility. Avoid new heavy chart or map dependencies.

**Scale/Scope**: Seven existing admin routes plus shared dashboard shell; visual changes only.

## Constitution Check

- **Phone-Is-Identity**: PASS — no farmer identity model or LINE flow changes.
- **Production-First Testing**: PASS — quickstart includes deployed-surface/browser verification where credentials permit.
- **YAGNI Extremist**: PASS — enhance existing components; use existing CSS/SVG primitives rather than add chart/map libraries.
- **LINE-Native UX**: PASS — farmer LINE interface is out of scope and unchanged.
- **Evidence-Driven Carbon Accounting**: PASS — displayed values and verification distinctions remain unchanged.
- **Privacy and Least Privilege**: PASS — role visibility remains unchanged and is regression-tested.
- **Auditability and Safe Decisions**: PASS — approve/reject/retake reasons and history remain unchanged and are regression-tested.
- **Design Consistency**: PASS — use existing tokens, white cards on `#f0f4f8`, and preserve Material Symbols link loading.

## Project Structure

```text
specs/008-admin-dashboard-visual-polish/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/ui-regression.md
└── tasks.md

frontend/src/app/admin/
├── page.tsx
├── applications/page.tsx
├── evidence/page.tsx
├── farmers/page.tsx
├── sponsors/page.tsx
├── reports/page.tsx
├── settings/page.tsx
└── layout.tsx

frontend/src/components/dashboard/
├── dashboard-shell.tsx
├── dashboard-sidebar.tsx
└── dashboard-header.tsx

frontend/src/components/admin-review/
├── review-card.tsx
├── review-detail-panel.tsx
├── filter-tabs.tsx
└── precision-card.tsx

frontend/src/app/globals.css
visual-qa-screenshots/design-admin-full.png
stitch_netzerocarbon_platform/admin_review_dashboard/screen.png
```

**Structure Decision**: This is a frontend-only visual refinement across existing admin route pages and shared dashboard/admin-review components. Backend, schema, authentication, and domain data files remain unchanged.

## Implementation Phases

### Phase 0 — Research and baseline

- Inventory current component styles and existing visual QA tooling.
- Confirm the approved baseline and supplemental Stitch reference roles.
- Identify existing chart, map, image-fallback, responsive, and reduced-motion patterns.

### Phase 1 — Visual implementation

- Refine shared shell/sidebar/header and table hover/focus treatments.
- Refine evidence cards, filter tabs, detail panel, action buttons, map fallback, and responsive states.
- Refine overview KPI/chart/table treatments with existing primitives.
- Preserve all existing data, action, audit, and privacy behavior.

### Phase 2 — Verification

- Run focused tests and project compliance checks.
- Run browser-use checks at desktop and tablet viewports, including regression workflows.
- Capture and compare the 10-region evidence-page inventory against the approved baseline.
- Run lint, typecheck, build, and security gates.

## Complexity Tracking

No constitution violations. No new abstraction, dependency, data entity, endpoint, or workflow is justified by this feature.
