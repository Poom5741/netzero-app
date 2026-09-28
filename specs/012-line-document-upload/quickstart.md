# Quickstart: LINE Document Upload Validation

**Feature**: 012-line-document-upload
**Date**: 2026-09-18
**Status**: Ready for validation

## Overview

This quickstart guide provides runnable validation scenarios to prove the LINE document upload feature works end-to-end. It covers unit tests, integration tests, and production QA via real LINE OA.

## Prerequisites

### Development Environment

- Node.js 18+ and npm
- Wrangler CLI installed (`npm install -g wrangler`)
- Cloudflare account with Workers, D1, and R2 bindings configured
- LINE Developers account with LIFF app configured
- LINE OA channel with webhook enabled

### Test Data

- Test farmer with phone number (e.g., `0812345679`)
- Test LINE user ID (from LINE Developers Console)
- Sample document files (PDF, JPEG, PNG) < 10MB

### Configuration

Ensure the following environment variables are set in `wrangler.toml`:

```toml
[vars]
LIFF_ID = "your-liff-id"
LINE_CHANNEL_ACCESS_TOKEN = "your-channel-access-token"
LINE_CHANNEL_SECRET = "your-channel-secret"

[[d1_databases]]
binding = "DB"
database_name = "netzero-db"
database_id = "your-d1-database-id"

[[r2_buckets]]
binding = "R2"
bucket_name = "netzero-documents"
```

## Validation Scenarios

### Scenario 1: Unit Tests — File Validation

**Goal**: Verify file validation logic rejects invalid uploads.

**Steps**:

1. Run unit tests:
   ```bash
   npm test -- tests/unit/document-upload-api.test.ts
   ```

2. Expected results:
   - ✅ Missing file → 400 Bad Request with error "กรุณาเลือกไฟล์"
   - ✅ File too large (>10MB) → 400 Bad Request with error "ไฟล์มีขนาดใหญ่เกิน 10MB"
   - ✅ Invalid MIME type → 400 Bad Request with error "รองรับเฉพาะไฟล์ PDF, JPEG, PNG"
   - ✅ Invalid doc_type → 400 Bad Request with error "ประเภทเอกสารไม่ถูกต้อง"
   - ✅ Valid file → 200 OK with document metadata

**Evidence**: Test output showing all assertions pass.

### Scenario 2: Unit Tests — Conversation State Fix

**Goal**: Verify `handleDocuments()` rejects plain-text `อัปโหลด` without uploaded files.

**Steps**:

1. Run unit tests:
   ```bash
   npm test -- tests/unit/line-flow-documents.test.ts
   ```

2. Expected results:
   - ✅ Send "อัปโหลด" with 0 documents → state stays in `documents`, bot re-displays upload link
   - ✅ Send "อัปโหลด" with 1 document → state stays in `documents`, bot shows progress
   - ✅ Send "อัปโหลด" with 2 documents → state advances to `pending_review`, bot confirms receipt
   - ✅ Send other text → state stays in `documents`, bot shows upload link

**Evidence**: Test output showing all state transitions are correct.

### Scenario 3: Integration Tests — End-to-End Upload

**Goal**: Verify file upload persists to R2 and creates database record.

**Steps**:

1. Start local development server:
   ```bash
   npm run dev
   ```

2. Run integration tests:
   ```bash
   npm test -- tests/integration/document-upload-flow.test.ts
   ```

3. Expected results:
   - ✅ Upload file via POST `/liff/api/documents/upload` → 200 OK
   - ✅ R2 bucket contains object at generated key
   - ✅ `application_documents` table contains record with `r2_key`
   - ✅ Document count increases after each upload
   - ✅ `all_required_attached` becomes `true` after uploading chanote + id_copy

**Evidence**: Test output showing R2 objects and database records created.

### Scenario 4: Production QA — Real LINE OA Flow

**Goal**: Verify the complete document upload flow via real LINE OA and LIFF.

**Prerequisites**:

- Deployed Worker to workers.dev
- Deployed frontend to pages.dev
- LINE OA webhook enabled
- LIFF app configured with correct endpoint

**Steps**:

1. **Complete onboarding flow**:
   - Open LINE OA chat
   - Send "ลงทะเบียน" to start registration
   - Accept consent (ยอมรับ)
   - Enter phone number (e.g., `0812345679`)
   - Confirm identity (ใช่)
   - Accept conditions (ยอมรับ)
   - Complete LIFF registration form

2. **Verify document upload prompt**:
   - After registration, bot should prompt for document upload
   - Bot should provide LIFF document upload link
   - Expected message: "กรุณาอัปโหลดเอกสารสิทธิ์ (สำเนาบัตรประชาชน / สำเนาเอกสารสิทธิ์ที่ดิน)"

3. **Open LIFF document form**:
   - Click the upload link in LINE chat
   - LIFF form should open in LINE in-app browser
   - Form should display three file inputs:
     - DOC-01: โฉนดที่ดิน (Land deed)
     - DOC-03: สำเนาบัตรประชาชน (ID card copy)
     - DOC-06: หนังสือมอบอำนาจ (Power of attorney, optional)

4. **Upload land deed (DOC-01)**:
   - Select a PDF or image file < 10MB
   - Submit the form
   - Expected: Success message, form shows 1/3 documents uploaded

5. **Upload national ID copy (DOC-03)**:
   - Select a PDF or image file < 10MB
   - Submit the form
   - Expected: Success message, form shows 2/3 documents uploaded

6. **Verify admin view**:
   - Login to admin console: `https://<pages-url>/admin/login`
   - Navigate to Applications page
   - Find the test farmer's application
   - Expected: Document count shows "2/3" or "เอกสารครบ"
   - Click farmer detail view
   - Navigate to "เอกสาร" tab
   - Expected: List shows 2 documents with type, timestamp, and file reference

7. **Test plain-text upload rejection**:
   - Return to LINE OA chat
   - Send "อัปโหลด" as plain text (without uploading files)
   - Expected: Bot does NOT say "✅ ได้รับเอกสารแล้วค่ะ"
   - Expected: Bot re-displays LIFF upload link
   - Expected: Admin view still shows 2/3 documents (not advanced to pending_review)

8. **Advance to pending_review**:
   - In LINE chat, send "อัปโหลด" after uploading all required documents
   - Expected: Bot says "✅ ได้รับเอกสารแล้วค่ะ"
   - Expected: Bot says "⏳ บัญชีอยู่ระหว่างรอการตรวจสอบจากเจ้าหน้าที่"
   - Expected: Conversation state advances to `pending_review`

9. **Admin approval**:
   - In admin console, navigate to Applications page
   - Find the test farmer's application
   - Click "อนุมัติ" (Approve)
   - Expected: Application status changes to "อนุมัติแล้ว"
   - Expected: Farmer can now proceed to photo upload flow

**Evidence**: Screenshots of LINE chat, LIFF form, admin view, and conversation state transitions.

### Scenario 5: Edge Cases — File Validation

**Goal**: Verify edge cases are handled correctly.

**Steps**:

1. **Upload file > 10MB**:
   - Select a file > 10MB
   - Submit the form
   - Expected: Error message "ไฟล์มีขนาดใหญ่เกิน 10MB"

2. **Upload unsupported file type**:
   - Select a .docx or .txt file
   - Submit the form
   - Expected: Error message "รองรับเฉพาะไฟล์ PDF, JPEG, PNG"

3. **Upload same document type twice**:
   - Upload chanote document
   - Upload another chanote document (different file)
   - Expected: Success, previous file replaced, timestamp updated

4. **Upload without farmer identity**:
   - Open LIFF form without LINE login
   - Attempt to upload file
   - Expected: Error message "ไม่พบข้อมูลเกษตรกร"

**Evidence**: Screenshots of error messages and edge case handling.

## Validation Checklist

Use this checklist to track validation progress:

- [ ] **Unit tests pass**: File validation logic
- [ ] **Unit tests pass**: Conversation state fix
- [ ] **Integration tests pass**: End-to-end upload flow
- [ ] **Production QA pass**: Real LINE OA flow
- [ ] **Production QA pass**: Admin view shows documents
- [ ] **Production QA pass**: Plain-text upload rejection
- [ ] **Production QA pass**: Conversation state advances correctly
- [ ] **Edge cases pass**: File size validation
- [ ] **Edge cases pass**: MIME type validation
- [ ] **Edge cases pass**: Duplicate upload handling
- [ ] **Edge cases pass**: Identity resolution failure

## Troubleshooting

### Issue: LIFF form does not open

**Symptoms**: Clicking upload link in LINE chat does not open LIFF form.

**Solution**:
- Verify LIFF_ID is set correctly in `wrangler.toml`
- Verify LIFF endpoint URL is configured in LINE Developers Console
- Check browser console for errors in LINE in-app browser

### Issue: File upload fails with 500 error

**Symptoms**: Upload returns 500 Internal Server Error.

**Solution**:
- Check Worker logs for R2 upload errors
- Verify R2 bucket binding is configured in `wrangler.toml`
- Verify R2 bucket exists in Cloudflare dashboard
- Check D1 database binding and schema

### Issue: Document count does not update

**Symptoms**: Admin view shows 0/3 documents after upload.

**Solution**:
- Check `application_documents` table for records
- Verify `farmer_id` matches between upload and admin query
- Check R2 bucket for uploaded files
- Refresh admin page (may be cached)

### Issue: Plain-text "อัปโหลด" still advances state

**Symptoms**: Sending "อัปโหลด" without uploading files advances to pending_review.

**Solution**:
- Verify `handleDocuments()` in `src/line/flow.ts` checks document count
- Check database for `application_documents` records
- Verify conversation state update logic
- Restart Worker to pick up code changes

## Success Criteria

The feature is considered validated when:

1. ✅ All unit tests pass (file validation, conversation state)
2. ✅ All integration tests pass (end-to-end upload)
3. ✅ Production QA passes (real LINE OA flow)
4. ✅ Admin view shows uploaded documents
5. ✅ Plain-text upload rejection works
6. ✅ Conversation state advances only after required documents uploaded
7. ✅ Edge cases handled correctly (file size, MIME type, duplicates)

## Next Steps

After validation:

1. Run `/speckit-tasks` to generate implementation tasks
2. Run `/speckit-implement` to implement the feature
3. Run `/speckit-converge` to verify implementation matches spec
4. Deploy to production and repeat production QA
5. Run browser-use manual QA for visual verification

## References

- **Specification**: [spec.md](./spec.md)
- **Implementation Plan**: [plan.md](./plan.md)
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **API Contract**: [contracts/document-upload-api.md](./contracts/document-upload-api.md)
- **Handoff Document**: [HANDOFF-LINE-DOCUMENT-UPLOAD.md](../../../HANDOFF-LINE-DOCUMENT-UPLOAD.md)
