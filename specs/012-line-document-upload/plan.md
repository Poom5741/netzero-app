# Implementation Plan: LINE Document Upload Flow

**Branch**: `012-line-document-upload` | **Date**: 2026-09-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/012-line-document-upload/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Implement a real LINE/LIFF farmer document-upload flow that replaces the false text-only upload completion behavior, persists actual required documents to R2 storage, and gates pending review on complete evidence. The flow must provide a visible LIFF upload form, validate file uploads server-side, generate safe object keys, update document counts in the admin view, and prevent plain-text `อัปโหลด` from falsely advancing the conversation state.

## Technical Context

**Language/Version**: TypeScript 5.x (Cloudflare Workers runtime)

**Primary Dependencies**: Hono (web framework), D1 (SQLite database), R2 (object storage), KV (key-value store), LINE Messaging API, LIFF SDK

**Storage**: D1 (application_documents table, farmers, plots, line_links), R2 (document files), KV (session/state)

**Testing**: Vitest (unit/integration), browser-use (production QA), LINE OA (manual verification)

**Target Platform**: Cloudflare Workers (backend), Cloudflare Pages (frontend), LINE mobile app (LIFF)

**Project Type**: Web service (LINE bot + LIFF application)

**Performance Goals**: <500ms upload response time, <2s LIFF form load, 100% file validation before persistence

**Constraints**: <10MB file size limit, PDF/JPEG/PNG MIME types only, server-generated object keys only, Thai language UI, offline-capable LIFF form

**Scale/Scope**: POC for ~100 farmers, 3 document types per farmer, admin review workflow

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**I. Phone-Is-Identity**: ✅ PASS — Reusing existing farmer identity resolution from LIFF context. No additional verification gate introduced.

**II. Production-First Testing**: ✅ PASS — Plan includes production verification via real LINE OA and LIFF. Unit/integration tests use mock DB but production QA uses deployed workers.dev surface.

**III. YAGNI Extremist**: ✅ PASS — Reusing existing LIFF camera pattern, existing admin application view, existing document taxonomy (3 types). No new abstractions, no general file-management system.

**IV. LINE-Native UX**: ✅ PASS — LIFF deep link reserved for file upload (appropriate use case: camera/file access unavailable in chat). LINE chat remains primary interface for navigation.

**V. Evidence-Driven Accounting**: ✅ PASS — Documents are evidence, will be traceable to farmer, persisted with timestamps, visible in admin review. No silent changes.

**VI. Privacy and Least Privilege**: ✅ PASS — Documents limited to admin review context. Farmer can only upload their own documents (server-side identity resolution). No sponsor access to raw documents.

**VII. Auditability and Safe Decisions**: ✅ PASS — Document uploads will create audit records (farmer_id, doc_type, timestamp, file reference). Admin review decisions preserved. Missing documents remain visibly unresolved.

**VIII. Design Consistency**: ✅ PASS — LIFF document form will use existing design tokens (LINE green #06c755, white cards, Thai language). No new visual design introduced.

**Technical Constraints**: ✅ PASS
- Cloudflare Workers with Hono, D1, R2: using existing bindings
- Web Crypto API: not needed for document upload (no HMAC/signature)
- D1 transactions: will use for atomic document record creation
- Thai language: all user-facing messages in Thai
- LINE replyToken single-use: batch replies in flow handler

**All gates pass. Proceeding to Phase 0.**

### Post-Design Constitution Re-Check

*Re-evaluating after Phase 1 design artifacts complete.*

**I. Phone-Is-Identity**: ✅ PASS — Design preserves existing identity resolution. LIFF form uses farmer_id from query parameter or LIFF profile, no new verification gates.

**II. Production-First Testing**: ✅ PASS — Quickstart includes production QA via real LINE OA. Unit/integration tests use mock DB, but production verification uses deployed workers.dev.

**III. YAGNI Extremist**: ✅ PASS — Design reuses existing patterns:
- LIFF form follows camera page pattern (src/routes/liff.ts)
- File validation follows photo upload pattern (src/routes/photo.ts)
- Admin view extends existing applications page
- No new abstractions or general file-management system

**IV. LINE-Native UX**: ✅ PASS — LIFF deep link used appropriately for file upload (file access unavailable in chat). LINE chat remains primary interface for navigation and state transitions.

**V. Evidence-Driven Accounting**: ✅ PASS — Documents persisted to R2 with timestamps, visible in admin review. Document count and status computed from actual records, not text signals.

**VI. Privacy and Least Privilege**: ✅ PASS — Server-side identity resolution prevents cross-farmer uploads. Documents limited to admin context. No sponsor access to raw files.

**VII. Auditability and Safe Decisions**: ✅ PASS — application_documents records include farmer_id, doc_type, r2_key, submitted_at. Admin review decisions preserved. Missing documents remain visibly unresolved (0/3 count).

**VIII. Design Consistency**: ✅ PASS — LIFF form uses existing design tokens (LINE green #06c755, white cards, Thai language). Matches camera page visual style.

**Technical Constraints**: ✅ PASS
- Cloudflare Workers with Hono, D1, R2: using existing bindings
- Multipart/form-data upload: standard web pattern
- R2 object key generation: server-controlled, prevents path traversal
- D1 upsert: atomic document record creation
- Thai language: all user-facing messages in Thai

**All gates pass post-design. No violations detected.**

## Project Structure

### Documentation (this feature)

```text
specs/012-line-document-upload/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── line/
│   ├── flow.ts                    # Conversation state machine (handleDocuments fix)
│   └── flex-buildlers.ts          # LINE message builders (document upload action)
├── liff/
│   ├── documents-api.ts           # Document validation and taxonomy (existing)
│   └── document-upload-api.ts     # NEW: File upload handler with R2 integration
├── routes/
│   ├── liff.ts                    # LIFF routes (add /documents form + /api/documents/upload)
│   └── photo.ts                   # Existing photo upload pattern (reference)
├── db/
│   └── migrate.sql                # Schema (application_documents table exists)
└── admin/
    └── applications.ts            # Admin application view (extend to show documents)

frontend/src/app/admin/
├── applications/
│   └── page.tsx                   # Admin applications page (show document count)
└── farmers/
    └── [id]/
        └── page.tsx               # Farmer detail view (show uploaded documents)

tests/
├── unit/
│   ├── line-flow-documents.test.ts    # NEW: Test plain-text upload rejection
│   └── document-upload-api.test.ts    # NEW: Test file validation and R2 persistence
├── integration/
│   └── document-upload-flow.test.ts   # NEW: Test end-to-end upload flow
└── verification/
    └── line-document-upload-verification-2026-09-18.md  # NEW: Production QA log
```

**Structure Decision**: Web application structure (backend + frontend). Backend runs on Cloudflare Workers with Hono. Frontend uses Next.js static export. LIFF forms are server-rendered HTML pages served from Worker routes. All new code follows existing patterns in src/line/flow.ts, src/liff/documents-api.ts, and src/routes/liff.ts.

## Complexity Tracking

> **No violations. All constitution gates pass.**

No complexity tracking required. The implementation reuses existing patterns and introduces no new abstractions.
