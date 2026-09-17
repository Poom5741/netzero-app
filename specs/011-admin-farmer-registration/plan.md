# Implementation Plan: Admin Farmer Registration

**Branch**: `011-admin-farmer-registration` | **Date**: 2026-09-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-admin-farmer-registration/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Enable admins to register new farmers via the admin dashboard by implementing a farmer creation form in the frontend and a corresponding API endpoint in the backend. The feature will integrate with the existing LINE flow so farmers created by admins can immediately register via LINE using their phone number.

## Technical Context

**Language/Version**: TypeScript 5.5, Next.js 14.2, Cloudflare Workers environment

**Primary Dependencies**: Hono (web framework), D1 (database), Tailwind CSS, React 18, Cloudflare Workers runtime

**Storage**: D1 SQL database with existing `farmers` table schema

**Testing**: Vitest for unit tests, Playwright for e2e tests, existing test suite patterns

**Target Platform**: Cloudflare Workers (backend), Web browser (frontend dashboard)

**Project Type**: Web-service with admin dashboard frontend

**Performance Goals**: Form submission under 2 seconds, API response under 500ms

**Constraints**: Must follow existing authentication patterns, integrate with LINE flow, maintain Thai language support

**Scale/Scope**: Support hundreds of farmers, admin dashboard UI integration, audit logging requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

1. **Phone-Is-Identity**: ✅ The feature supports the principle by ensuring farmers created via admin can immediately register via LINE using their phone number as identity.
2. **Production-First Testing**: ✅ Will include integration tests that verify the admin-created farmer can register via the deployed LINE flow.
3. **YAGNI Extremist**: ✅ Focused only on essential farmer creation functionality without adding unnecessary features.
4. **LINE-Native UX**: ✅ Ensures integration with existing LINE flow without requiring changes to the primary farmer interface.
5. **Evidence-Driven Carbon Accounting**: N/A - This is an admin feature, not directly related to carbon accounting.
6. **Privacy and Least Privilege**: ✅ Admin authentication required; follows existing privilege patterns.
7. **Auditability and Safe Decisions**: ✅ Includes requirement for audit logging of farmer creation activities.
8. **Design Consistency**: ✅ Will use existing design tokens and UI patterns from the admin dashboard.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
# Web application structure
backend/
├── src/
│   ├── routes/
│   │   └── admin.ts           # New POST /api/admin/farmers endpoint
│   ├── db/
│   │   └── migrate.sql        # Schema (no changes needed)
│   ├── farmer/
│   │   └── create.ts          # Farmer creation logic (reuse/reference)
│   └── line/
│       └── flow.ts            # Existing LINE flow (no changes)

frontend/
├── src/
│   ├── app/
│   │   └── admin/
│   │       └── farmers/
│   │           └── page.tsx   # Add farmer button and modal/form
│   ├── components/
│   │   └── ui/                # Reusable form components
│   └── lib/
│       └── api.ts             # API client for farmer creation

tests/
├── unit/
│   └── farmer/
│       └── create.test.ts     # Farmer creation tests
├── integration/
│   └── upload-screening.test.ts  # API endpoint tests
└── e2e/
    └── admin.spec.ts          # Admin dashboard tests
```

**Structure Decision**: This is a web application with separate frontend and backend components. The feature extends the existing admin dashboard UI and adds a new API endpoint to the backend. The structure follows the existing project layout with new files added to appropriate locations.

