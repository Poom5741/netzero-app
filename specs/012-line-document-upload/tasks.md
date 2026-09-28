# Tasks: LINE Document Upload Flow

**Input**: Design documents from `/specs/012-line-document-upload/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included based on the feature specification requirements for unit tests, integration tests, and production QA.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `src/` at repository root (Cloudflare Workers)
- **Frontend**: `frontend/src/` (Next.js static export)
- **Tests**: `tests/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create document upload validation utilities in src/liff/document-upload-validation.ts
- [x] T002 [P] Create R2 object key generation helper in src/liff/r2-key-generator.ts
- [x] T003 [P] Create identity resolution helper in src/liff/identity-resolver.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Implement file validation function in src/liff/document-upload-validation.ts (validate presence, size <10MB, MIME type PDF/JPEG/PNG)
- [x] T005 [P] Implement R2 object key generator in src/liff/r2-key-generator.ts (pattern: documents/{farmer_id}/{doc_type}/{timestamp}_{uuid}.{ext})
- [x] T006 [P] Implement identity resolver in src/liff/identity-resolver.ts (resolve farmer_id from LIFF profile or query parameter)
- [x] T007 Create document type mapping in src/liff/documents-api.ts (map chanote→DOC-01, id_copy→DOC-03, power_of_attorney→DOC-06)
- [x] T008 Add R2 bucket binding to wrangler.toml if not present

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Farmer uploads required documents via LIFF (Priority: P1) 🎯 MVP

**Goal**: Implement real file upload flow where farmers can upload land deed and national ID copy through LIFF form, with files persisted to R2 and document records created in database.

**Independent Test**: Complete LINE onboarding through registration, open LIFF document form, upload land deed file, verify document appears in admin view with non-zero count. Upload national ID copy, verify count increases to 2/3.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T009 [P] [US1] Unit test for file validation in tests/unit/document-upload-validation.test.ts (test missing file, file too large, invalid MIME type, valid file)
- [ ] T010 [P] [US1] Unit test for R2 key generation in tests/unit/r2-key-generator.test.ts (test key format, uniqueness, path traversal prevention)
- [ ] T011 [P] [US1] Unit test for identity resolution in tests/unit/identity-resolver.test.ts (test LIFF profile resolution, query parameter fallback, missing identity)
- [ ] T012 [P] [US1] Integration test for upload endpoint in tests/integration/document-upload-flow.test.ts (test end-to-end upload with mock R2 and D1)

### Implementation for User Story 1

- [x] T013 [US1] Implement POST /liff/api/documents/upload endpoint in src/routes/liff.ts (accept multipart/form-data, validate file, resolve identity, generate R2 key, upload to R2, create application_documents record)
- [x] T014 [US1] Implement document count calculation in src/routes/liff.ts (query application_documents, check if all required documents attached)
- [x] T015 [US1] Create LIFF document upload form HTML in src/routes/liff.ts (server-rendered form with file inputs for chanote, id_copy, power_of_attorney, following camera page pattern)
- [x] T016 [US1] Add GET /liff/documents route in src/routes/liff.ts (serve document upload form with farmer_id from query parameter)
- [x] T017 [US1] Add error handling and Thai error messages in src/routes/liff.ts (กรุณาเลือกไฟล์, ไฟล์มีขนาดใหญ่เกิน 10MB, รองรับเฉพาะไฟล์ PDF JPEG PNG, ประเภทเอกสารไม่ถูกต้อง, ไม่พบข้อมูลเกษตรกร)
- [x] T018 [US1] Add success response with document metadata in src/routes/liff.ts (return ok, doc_type, r2_key, document_count, all_required_attached)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Plain text upload command does not falsely complete the flow (Priority: P1)

**Goal**: Fix handleDocuments() to check actual document count before advancing to pending_review, and re-display LIFF upload action when plain text "อัปโหลด" is received without uploaded files.

**Independent Test**: Enter documents state in LINE chat, send text "อัปโหลด" alone, verify bot does NOT respond with "✅ ได้รับเอกสารแล้วค่ะ" and does NOT move to pending_review. Verify bot re-displays LIFF upload action.

### Tests for User Story 2 ⚠️

- [x] T019 [P] [US2] Unit test for handleDocuments() in tests/unit/line-flow-documents.test.ts (test plain text rejection with 0 documents, 1 document, 2 documents, state transitions)

### Implementation for User Story 2

- [x] T020 [US2] Modify handleDocuments() in src/line/flow.ts to check actual document count before advancing (query application_documents, count records, only advance if count >= 2)
- [x] T021 [US2] Update handleDocuments() in src/line/flow.ts to re-display LIFF upload link when plain text "อัปโหลด" received without sufficient documents (build LIFF URL with farmer_id, send document upload action message)
- [x] T022 [US2] Update handleDocuments() in src/line/flow.ts to show progress message when some documents uploaded but not all (e.g., "อัปโหลดแล้ว 1/3 รายการ กรุณาอัปโหลดให้ครบถ้วน")
- [x] T023 [US2] Ensure handleDocuments() in src/line/flow.ts advances to pending_review only when all required documents persisted (count >= 2, send confirmation message "✅ ได้รับเอกสารแล้วค่ะ")

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Admin reviews uploaded documents (Priority: P2)

**Goal**: Extend admin applications page and farmer detail view to show uploaded documents with file references, timestamps, and document counts.

**Independent Test**: After farmer uploads both required documents via LIFF, login to admin console, navigate to Applications, verify farmer's application shows 2/3 documents and status is "เอกสารครบ". Open farmer detail view, verify document records include type, timestamp, and file reference.

### Tests for User Story 3 ⚠️

- [x] T024 [P] [US3] Integration test for admin document view in tests/integration/admin-document-view.test.ts (test document count display, document list, file reference)

### Implementation for User Story 3

- [x] T025 [US3] Extend admin applications page in frontend/src/app/admin/applications/page.tsx to show document count (query application_documents, display "เอกสาร: X/3", update status badge to "เอกสารครบ" when count >= 2)
- [x] T026 [US3] Add documents tab to farmer detail view in frontend/src/app/admin/farmers/[id]/page.tsx (display list of uploaded documents with doc_type, submitted_at, r2_key)
- [x] T027 [US3] Implement document download link in frontend/src/app/admin/farmers/[id]/page.tsx (generate R2 presigned URL or proxy download through Worker)
- [x] T028 [US3] Add API endpoint GET /api/admin/farmers/:id/documents in src/routes/admin.ts (query application_documents for farmer, return document list with metadata)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: User Story 4 - Optional power of attorney document is handled correctly (Priority: P3)

**Goal**: Handle optional power of attorney document according to farmer's ownership status. Application is complete with 2 required documents (chanote + id_copy), and power of attorney is optional.

**Independent Test**: Complete document upload as farmer who is not owner, upload land deed and national ID copy, verify application shows 2/3 documents and status is complete. Optionally upload power of attorney, verify count increases to 3/3.

### Tests for User Story 4 ⚠️

- [x] T029 [P] [US4] Unit test for optional document handling in tests/unit/optional-document-handling.test.ts (test 2 required documents = complete, 3 documents with power of attorney = full)

### Implementation for User Story 4

- [x] T030 [US4] Update document count logic in src/routes/liff.ts to distinguish required vs optional documents (required: DOC-01 + DOC-03, optional: DOC-06, all_required_attached = true when count >= 2)
- [x] T031 [US4] Update admin view in frontend/src/app/admin/applications/page.tsx to show "เอกสารครบ" when required documents present (count >= 2), not requiring power of attorney
- [x] T032 [US4] Add optional document indicator in LIFF form in src/routes/liff.ts (mark power of attorney as "ถ้าไม่ใช่เจ้าของ", allow upload but not required)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T033 [P] Add comprehensive error logging in src/routes/liff.ts (log R2 upload errors, D1 errors, validation failures with context)
- [x] T034 [P] Add audit trail for document uploads in src/routes/liff.ts (log farmer_id, doc_type, r2_key, timestamp to console or audit table)
- [x] T035 [P] Security review: verify R2 object key generation prevents path traversal in src/liff/r2-key-generator.ts
- [x] T036 [P] Security review: verify identity resolution prevents cross-farmer uploads in src/liff/identity-resolver.ts
- [x] T037 Run quickstart.md validation scenarios in tests/verification/line-document-upload-verification-2026-09-18.md (unit tests, integration tests, production QA via real LINE OA)
- [x] T038 Update documentation in specs/012-line-document-upload/ (add implementation notes, known issues, deployment checklist)
- [x] T039 Code cleanup and refactoring (remove duplicate code, extract shared utilities, ensure consistent error handling)
- [x] T040 Performance optimization: verify R2 upload and D1 queries complete within 500ms target

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P1): Can start after Foundational - May integrate with US1 but independently testable
  - User Story 3 (P2): Can start after Foundational - May integrate with US1/US2 but independently testable
  - User Story 4 (P3): Can start after Foundational - May integrate with US1/US2/US3 but independently testable
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 upload endpoint but independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 upload endpoint creating documents, but admin view is independently testable
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Extends US1/US3 logic but independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models/utilities before services/endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002, T003)
- All Foundational tasks marked [P] can run in parallel (T005, T006)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for file validation in tests/unit/document-upload-validation.test.ts"
Task: "Unit test for R2 key generation in tests/unit/r2-key-generator.test.ts"
Task: "Unit test for identity resolution in tests/unit/identity-resolver.test.ts"
Task: "Integration test for upload endpoint in tests/integration/document-upload-flow.test.ts"

# After tests fail, implement endpoint:
Task: "Implement POST /liff/api/documents/upload endpoint in src/routes/liff.ts"
Task: "Create LIFF document upload form HTML in src/routes/liff.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently (upload document via LIFF, verify R2 persistence, verify database record)
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (fix false completion)
4. Add User Story 3 → Test independently → Deploy/Demo (admin visibility)
5. Add User Story 4 → Test independently → Deploy/Demo (optional document handling)
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (upload endpoint + LIFF form)
   - Developer B: User Story 2 (conversation state fix)
   - Developer C: User Story 3 (admin view extension)
   - Developer D: User Story 4 (optional document handling)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Summary

**Total Tasks**: 40

**By Phase**:
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 5 tasks
- Phase 3 (US1 - Farmer uploads): 10 tasks (4 tests + 6 implementation)
- Phase 4 (US2 - Fix conversation state): 5 tasks (1 test + 4 implementation)
- Phase 5 (US3 - Admin reviews): 5 tasks (1 test + 4 implementation)
- Phase 6 (US4 - Optional document): 4 tasks (1 test + 3 implementation)
- Phase 7 (Polish): 8 tasks

**By User Story**:
- User Story 1 (P1): 10 tasks
- User Story 2 (P1): 5 tasks
- User Story 3 (P2): 5 tasks
- User Story 4 (P3): 4 tasks

**Parallel Opportunities**: 15 tasks marked [P] can run in parallel

**MVP Scope**: User Story 1 (10 tasks) delivers the core file upload functionality
