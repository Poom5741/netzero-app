# Data Model: LINE Document Upload Flow

**Feature**: 012-line-document-upload
**Date**: 2026-09-18
**Status**: Complete

## Overview

This feature extends the existing data model to support actual file uploads for farmer documents. The core entities (farmers, plots, line_links, application_documents) already exist. This feature adds file persistence to R2 and enhances the application_documents table with file references.

## Existing Entities (No Schema Changes Required)

### farmers
Represents a farmer participating in the project.

**Key Fields**:
- `id` (TEXT, PRIMARY KEY): Farmer identifier
- `full_name` (TEXT): Farmer's full name
- `phone` (TEXT): Phone number (identity)
- `national_id_enc` (TEXT): Encrypted national ID
- `addr_province`, `addr_district`, `addr_subdistrict`, `addr_village` (TEXT): Address fields
- `created_at`, `updated_at` (TEXT): Timestamps

**Relationships**:
- One farmer has many plots
- One farmer has many line_links
- One farmer has many application_documents

### plots
Represents a land parcel registered to a farmer.

**Key Fields**:
- `id` (TEXT, PRIMARY KEY): Plot identifier
- `farmer_id` (TEXT, FOREIGN KEY → farmers.id): Owner farmer
- `plot_code` (TEXT): Human-readable plot code
- `deed_no` (TEXT): Land deed number
- `doc_type` (TEXT): Document type (chanote, ns3k, spk, rental)
- `tenure` (TEXT): Holding status (owner, tenant, proxy, renter)
- `area_rai` (REAL): Area in rai
- `created_at`, `updated_at` (TEXT): Timestamps

**Relationships**:
- Many plots belong to one farmer
- One plot has many season_inputs

### line_links
Represents the binding between a LINE user and a farmer.

**Key Fields**:
- `id` (TEXT, PRIMARY KEY): Link identifier
- `farmer_id` (TEXT, FOREIGN KEY → farmers.id): Linked farmer
- `line_user_id` (TEXT): LINE user ID
- `status` (TEXT): Link status (pending, active, inactive)
- `conversation_state` (TEXT): Current conversation state (welcome, consent, phone, identity_confirm, conditions, registration, documents, pending_review, activation, season_setup, calendar, chat, confirm_draft, photo_report, results)
- `selected_plot_id` (TEXT, FOREIGN KEY → plots.id): Currently selected plot
- `created_at`, `updated_at` (TEXT): Timestamps

**Relationships**:
- Many line_links belong to one farmer
- One line_link has one selected plot

### application_documents
Represents a document uploaded by a farmer as part of the application.

**Key Fields**:
- `id` (TEXT, PRIMARY KEY): Document identifier
- `farmer_id` (TEXT, FOREIGN KEY → farmers.id): Owner farmer
- `doc_type` (TEXT): Document type code (DOC-01, DOC-03, DOC-06)
- `r2_key` (TEXT): R2 object key (file reference)
- `submitted_at` (TEXT): Submission timestamp
- `review_status` (TEXT): Review status (pending, approved, rejected)
- `reviewed_at` (TEXT): Review timestamp
- `reviewed_by` (TEXT): Reviewer identifier
- `photo_evidence_id` (TEXT, NULLABLE): Related photo evidence (if applicable)

**Relationships**:
- Many application_documents belong to one farmer
- One application_document may reference one photo_evidence

**Constraints**:
- UNIQUE(farmer_id, doc_type): One document per type per farmer (upsert on duplicate)

## New Behavior (No Schema Changes)

### Document Upload Flow

1. **Farmer opens LIFF document form**
   - LIFF form loads with farmer_id from query parameter or LIFF profile
   - Form displays three file inputs: land deed (DOC-01), national ID copy (DOC-03), power of attorney (DOC-06)
   - Form shows current upload status for each document type

2. **Farmer selects and submits files**
   - Client validates file presence, size (<10MB), and MIME type (PDF/JPEG/PNG)
   - Client sends multipart/form-data POST to `/liff/api/documents/upload`
   - Request includes: file (binary), doc_type (string), farmer_id (string)

3. **Server validates and persists**
   - Server resolves farmer_id from LIFF profile or query parameter
   - Server validates file presence, size, and MIME type
   - Server generates safe R2 object key: `documents/{farmer_id}/{doc_type}/{timestamp}_{uuid}.{ext}`
   - Server uploads file to R2 bucket
   - Server creates/updates application_documents record with r2_key
   - Server returns success response with document count

4. **Admin reviews documents**
   - Admin applications page shows document count (e.g., "เอกสาร: 2/3")
   - Admin farmer detail view shows document list with type, timestamp, and file reference
   - Admin can download files from R2 using r2_key
   - Admin approves or rejects application based on document authenticity

### Document Validation Rules

**File Presence**:
- File must be present in multipart/form-data
- File size must be > 0 bytes

**File Size**:
- Maximum size: 10MB (10 * 1024 * 1024 bytes)
- Error message (Thai): "ไฟล์มีขนาดใหญ่เกิน 10MB"

**MIME Type**:
- Allowed types: application/pdf, image/jpeg, image/png
- Error message (Thai): "รองรับเฉพาะไฟล์ PDF, JPEG, PNG"

**Document Type**:
- Must be one of: chanote (DOC-01), id_copy (DOC-03), power_of_attorney (DOC-06)
- Error message (Thai): "ประเภทเอกสารไม่ถูกต้อง"

### Document Count and Status

**Document Count**:
- Count = number of application_documents records for farmer
- Required count = 2 (chanote + id_copy)
- Optional count = 1 (power_of_attorney)
- Total count = 3

**Document Status**:
- Incomplete: count < 2 (missing required documents)
- Complete: count >= 2 (all required documents present)
- Full: count = 3 (all required + optional documents present)

**Conversation State Transition**:
- documents → pending_review: Only when count >= 2
- documents → documents: When count < 2 (re-display upload link)

### R2 Object Key Structure

**Pattern**: `documents/{farmer_id}/{doc_type}/{timestamp}_{uuid}.{ext}`

**Components**:
- `documents/`: Root prefix for all document files
- `{farmer_id}/`: Farmer identifier (prevents cross-farmer access)
- `{doc_type}/`: Document type code (DOC-01, DOC-03, DOC-06)
- `{timestamp}_{uuid}.{ext}`: Unique filename with extension

**Examples**:
- `documents/farmer_a37e7502/DOC-01/1726656000_550e8400-e29b-41d4-a716-446655440000.pdf`
- `documents/farmer_a37e7502/DOC-03/1726656100_6ba7b810-9dad-11d1-80b4-00c04fd430c8.jpg`
- `documents/farmer_a37e7502/DOC-06/1726656200_7c9e6679-7425-40de-944b-e07fc1f90ae7.png`

**Security Properties**:
- No client-controlled path segments (prevents path traversal)
- Unique filenames (prevents overwrites)
- Organized by farmer and document type (easy retrieval)
- Extension preserved (correct MIME type on download)

## State Transitions

### Conversation State Machine (documents state)

```
documents
  ├─ User uploads all required documents → pending_review
  ├─ User uploads some documents → documents (stay, show progress)
  ├─ User types "อัปโหลด" without uploading → documents (re-display upload link)
  └─ User types other text → documents (show upload link)
```

### Document Review State Machine

```
application_documents.review_status
  ├─ pending → approved (admin approves)
  ├─ pending → rejected (admin rejects)
  └─ rejected → pending (farmer re-uploads)
```

## Validation Rules

### Upload Validation

**Pre-upload (client-side)**:
- File selected: yes/no
- File size: <= 10MB
- File type: PDF/JPEG/PNG

**Post-upload (server-side)**:
- File present: yes/no
- File size: > 0 bytes and <= 10MB
- File MIME type: application/pdf, image/jpeg, image/png
- Document type: chanote, id_copy, power_of_attorney
- Farmer identity: resolved from LIFF profile or query parameter
- R2 upload: success/failure

### Database Constraints

**application_documents**:
- UNIQUE(farmer_id, doc_type): One document per type per farmer
- ON CONFLICT DO UPDATE: Upsert on duplicate (replace r2_key, update submitted_at)

**line_links**:
- conversation_state: Must be one of the defined states
- farmer_id: Must reference existing farmer

## Security Considerations

### Identity Resolution
- Farmer identity resolved server-side from LIFF profile or query parameter
- Client cannot specify farmer_id for another farmer
- line_links table enforces one LINE user per farmer

### File Upload
- Server validates file presence, size, and MIME type
- Server generates R2 object key (client cannot specify path)
- R2 bucket access controlled by Worker binding
- No direct client access to R2

### Path Traversal Prevention
- R2 object key generated server-side
- No client-controlled path segments
- Filename sanitized (extension only, no directory separators)

### Audit Trail
- Document uploads create application_documents records
- Records include farmer_id, doc_type, r2_key, submitted_at
- Admin review decisions create audit records (future enhancement)

## Performance Considerations

### Upload Performance
- File size limit: 10MB (prevents large file uploads)
- R2 upload: synchronous (wait for completion before creating DB record)
- Expected upload time: <5s for 10MB file on 4G network

### Query Performance
- Document count query: SELECT COUNT(*) FROM application_documents WHERE farmer_id = ?
- Document list query: SELECT * FROM application_documents WHERE farmer_id = ?
- Both queries use indexed farmer_id column

### Caching
- No caching required for POC
- Document count computed on each request
- Future enhancement: cache document count in KV

## Migration Strategy

**No schema migration required**. The application_documents table already exists with the required fields. The feature adds file persistence to R2 and enhances the upload flow.

**Existing data**: Farmers with existing application_documents records (metadata-only) will have NULL r2_key values. The new flow will populate r2_key on re-upload.

**Backward compatibility**: The existing `/liff/api/documents/submit` endpoint (metadata-only) remains functional for backward compatibility. The new `/liff/api/documents/upload` endpoint (file upload) is the recommended path.

## Summary

The data model extends the existing schema without requiring migrations. The feature adds file persistence to R2, enhances the upload flow with validation, and provides admin visibility into uploaded documents. All security, performance, and validation requirements are addressed through existing patterns and constraints.
