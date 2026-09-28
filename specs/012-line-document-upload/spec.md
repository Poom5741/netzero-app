# Feature Specification: LINE Document Upload Flow

**Feature Branch**: `012-line-document-upload`

**Created**: 2026-09-18

**Status**: Draft

**Input**: User description: "Implement a real LINE/LIFF farmer document-upload flow that replaces the false text-only upload completion behavior, persists actual required documents, and gates pending review on complete evidence."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Farmer uploads required documents via LIFF (Priority: P1)

As a farmer in the LINE onboarding flow, I want to upload my land deed and national ID copy through a visible LIFF upload form so that my application can be reviewed and approved.

**Why this priority**: Without a real document-upload surface, the farmer cannot complete registration and the entire downstream flow (admin review, activation, photo evidence) is blocked. This is the P0 release blocker identified in manual review.

**Independent Test**: Complete the LINE onboarding flow through consent and registration, then verify that a document-upload LIFF action is presented. Open the form, upload a land deed file, and verify the document appears in the admin application view with a non-zero document count. Upload the national ID copy and verify the count increases to 2/3. The application status changes from incomplete to complete only after both required documents are persisted.

**Acceptance Scenarios**:

1. **Given** a farmer has completed registration and entered the documents state, **When** the farmer interacts with the LINE bot, **Then** a visible LIFF document-upload action or link is presented.
2. **Given** the farmer opens the LIFF document form, **When** the form loads, **Then** it displays the required documents (land deed, national ID copy) and their current upload status.
3. **Given** the farmer selects a land deed file and submits, **When** the upload completes, **Then** the document record is persisted and the admin application view shows 1/3 documents.
4. **Given** the farmer selects a national ID copy and submits, **When** the upload completes, **Then** the admin application view shows 2/3 documents.
5. **Given** both required documents are persisted, **When** the farmer attempts to advance, **Then** the conversation state moves to pending_review and the bot confirms receipt.

---

### User Story 2 - Plain text upload command does not falsely complete the flow (Priority: P1)

As a farmer, I want the bot to guide me to the actual upload form when I type "อัปโหลด" so that I understand how to submit real documents instead of receiving false confirmation.

**Why this priority**: The current behavior treats the text `อัปโหลด` as a completion signal without verifying any uploaded file. This creates a false sense of progress and blocks the farmer at admin review with 0/3 documents. The flow must not advance without evidence.

**Independent Test**: Enter the documents state in LINE chat. Send the text `อัปโหลด` alone. Verify the bot does NOT respond with "✅ ได้รับเอกสารแล้วค่ะ" and does NOT move the conversation to pending_review. Instead, the bot re-displays the LIFF upload action and explains that documents must be uploaded through the form.

**Acceptance Scenarios**:

1. **Given** the farmer is in the documents state, **When** the farmer sends the text `อัปโหลด` without uploading any file, **Then** the bot does NOT advance to pending_review and does NOT claim documents were received.
2. **Given** the farmer sends `อัปโหลด` as plain text, **When** the bot responds, **Then** the response includes the LIFF document-upload action and explains that documents must be uploaded through the form.
3. **Given** the farmer sends `อัปโหลด` without uploading, **When** the admin application view is checked, **Then** the document count remains 0/3 and the status remains incomplete.

---

### User Story 3 - Admin reviews uploaded documents (Priority: P2)

As an admin reviewer, I want to see the actual uploaded documents in the application view so that I can verify their authenticity and approve or reject the application.

**Why this priority**: Admin review is the final authority. Without visible documents, the admin cannot make an informed decision. The document count and status must reflect actual persisted files, not text signals.

**Independent Test**: After a farmer uploads both required documents via LIFF, log in to the admin console and navigate to Applications. Verify the farmer's application shows 2/3 documents (or 3/3 if power of attorney was uploaded) and the status is "เอกสารครบ" or equivalent. Open the farmer detail view and verify the document records include file references and submission timestamps.

**Acceptance Scenarios**:

1. **Given** a farmer has uploaded both required documents, **When** the admin opens Applications, **Then** the farmer's application shows a non-zero document count and the status reflects complete documents.
2. **Given** the admin opens the farmer detail view, **When** the documents tab is selected, **Then** the uploaded documents are listed with their type, submission timestamp, and file reference.
3. **Given** the farmer has not uploaded any documents, **When** the admin opens Applications, **Then** the document count is 0/3 and the status remains incomplete.

---

### User Story 4 - Optional power of attorney document is handled correctly (Priority: P3)

As a farmer who is not the land owner, I want to upload a power of attorney document so that my application is complete and can be approved.

**Why this priority**: The power of attorney is required only when the farmer is not the owner. The system must handle this optional document without blocking the flow for owners.

**Independent Test**: Complete the document upload flow as a farmer who is not the owner. Upload the land deed and national ID copy. Verify the application shows 2/3 documents and the status is complete. Optionally upload the power of attorney and verify the count increases to 3/3. Verify the admin can review and approve the application.

**Acceptance Scenarios**:

1. **Given** a farmer is not the land owner, **When** the farmer uploads the land deed and national ID copy, **Then** the application shows 2/3 documents and the status is complete.
2. **Given** the farmer optionally uploads the power of attorney, **When** the upload completes, **Then** the application shows 3/3 documents.
3. **Given** the farmer is the land owner, **When** the farmer uploads the land deed and national ID copy, **Then** the application shows 2/3 documents and the status is complete without requiring the power of attorney.

---

### Edge Cases

- What happens when a farmer uploads a file that exceeds the size limit? The system rejects the upload and displays a clear error message in Thai explaining the limit.
- What happens when a farmer uploads a file with an unsupported MIME type? The system rejects the upload and displays a clear error message listing the allowed types.
- What happens when a farmer attempts to upload a document for a different farmer? The system rejects the upload and returns an authentication/authorization error.
- What happens when the LIFF form cannot resolve the farmer identity? The form displays an error and does not allow upload until identity is resolved.
- What happens when a farmer uploads the same document type twice? The system upserts the document record, replacing the previous file reference and updating the timestamp.
- What happens when the storage backend is unavailable? The system returns an error and does not create a document record. The farmer can retry.
- What happens when a farmer attempts to advance to pending_review without all required documents? The system blocks the transition and displays the missing document types.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a visible LIFF document-upload action or link when the farmer enters the documents state in the LINE onboarding flow.
- **FR-002**: The LIFF document form MUST display the required documents (land deed, national ID copy) and their current upload status.
- **FR-003**: The LIFF document form MUST allow the farmer to select or capture a file for each required document.
- **FR-004**: The system MUST upload actual file bytes to the server and persist them in storage. Metadata-only submissions without file content MUST NOT be accepted.
- **FR-005**: The system MUST validate the uploaded file for presence, size limit, and allowed MIME types at the upload boundary.
- **FR-006**: The system MUST generate a safe, server-controlled object key for each uploaded file. The farmer MUST NOT be able to specify an arbitrary object key.
- **FR-007**: The system MUST create or update the document record in the database only after successful file persistence.
- **FR-008**: The system MUST resolve the farmer identity server-side from the LIFF context or authenticated session. The farmer MUST NOT be able to upload documents for a different farmer.
- **FR-009**: The system MUST update the document count and status in the admin application view after each successful upload.
- **FR-010**: The system MUST allow the farmer to move to pending_review only when all required documents are persisted.
- **FR-011**: The system MUST NOT treat the text `อัปโหลด` as a completion signal without verifying that all required documents are persisted.
- **FR-012**: The system MUST re-display the LIFF document-upload action when the farmer sends `อัปโหลด` as plain text without uploading files.
- **FR-013**: The system MUST handle the optional power of attorney document according to the farmer's ownership status.
- **FR-014**: The system MUST prevent path traversal and arbitrary object writes in the storage backend.
- **FR-015**: The system MUST accept only HTTP and HTTPS URLs for any server-side request. The system MUST validate request hosts and reject localhost, loopback, private, and reserved addresses.

### Key Entities *(include if feature involves data)*

- **Document**: A file uploaded by a farmer as part of the application. Attributes: document type (land deed, national ID copy, power of attorney), file reference, submission timestamp, review status.
- **Application**: A farmer's registration and document submission. Attributes: farmer identity, document count, document completion status, review status.
- **Farmer**: A person participating in the project. Identified by phone number. May hold one or more plots.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of farmers who complete the document upload flow have at least two persisted document records (land deed and national ID copy) visible in the admin application view.
- **SC-002**: 0% of farmers can advance to pending_review by sending the text `อัปโหลด` alone without uploading actual files.
- **SC-003**: 100% of uploaded files are validated for presence, size, and MIME type before persistence.
- **SC-004**: 100% of uploaded files are stored with server-generated object keys. No client-controlled keys are accepted.
- **SC-005**: 100% of document uploads are authenticated and authorized. A farmer cannot upload documents for a different farmer.
- **SC-006**: Admin reviewers can see the actual uploaded documents and their metadata in the application view within 5 seconds of upload.
- **SC-007**: The document count in the admin application view matches the number of persisted document records for each farmer.
- **SC-008**: The conversation state moves to pending_review only when all required documents are persisted.

## Assumptions

- The existing three document types (land deed, national ID copy, power of attorney) and their validation logic are reused. No new document taxonomy is introduced.
- The existing LIFF camera and photo upload patterns are followed for the document upload form.
- The existing admin application view and farmer detail view are extended to display uploaded documents. No new admin surfaces are created.
- The existing farmer identity resolution (phone number = identity) is used. No additional verification gate is introduced.
- The existing admin review and approval flow is preserved. Admin review remains the final authority.
- The existing storage backend (R2) is used for file persistence. No new storage system is introduced.
- The existing database schema (application_documents table) is used. No schema migration is required beyond the existing nullable photo_evidence_id fix.
- The existing LINE webhook and LIFF deep-link patterns are used. No new LINE API integration is required.
- The existing test fixtures and mock database are used for unit and integration tests. Production testing uses real LINE and LIFF.
- The existing security constraints (SSRF prevention, path traversal prevention, authentication) are enforced. No new security model is introduced.
- The existing Thai-language user interface is used. All user-facing messages are in Thai.
- The existing design tokens and visual foundation are used for the LIFF document form. No new visual design is introduced.
