# Contract: Document Upload API

**Feature**: 012-line-document-upload
**Endpoint**: `POST /liff/api/documents/upload`
**Date**: 2026-09-18

## Overview

This endpoint handles actual file uploads for farmer documents. It accepts multipart/form-data, validates the file, persists it to R2 storage, and creates/updates the application_documents record.

## Request

### Method
`POST`

### URL
`/liff/api/documents/upload`

### Headers
```
Content-Type: multipart/form-data
```

### Body (multipart/form-data)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | Document file (PDF, JPEG, or PNG) |
| `doc_type` | string | Yes | Document type: `chanote`, `id_copy`, or `power_of_attorney` |
| `farmer_id` | string | No | Farmer identifier (optional if LIFF profile available) |

### File Constraints

- **Size**: Maximum 10MB (10 * 1024 * 1024 bytes)
- **MIME Types**: `application/pdf`, `image/jpeg`, `image/png`
- **Extensions**: `.pdf`, `.jpg`, `.jpeg`, `.png`

## Response

### Success (200 OK)

```json
{
  "ok": true,
  "doc_type": "DOC-01",
  "r2_key": "documents/farmer_a37e7502/DOC-01/1726656000_550e8400-e29b-41d4-a716-446655440000.pdf",
  "document_count": 1,
  "all_required_attached": false
}
```

**Fields**:
- `ok` (boolean): Always `true` on success
- `doc_type` (string): Document type code (DOC-01, DOC-03, DOC-06)
- `r2_key` (string): R2 object key for the uploaded file
- `document_count` (number): Total number of documents uploaded by this farmer
- `all_required_attached` (boolean): `true` if all required documents (chanote + id_copy) are present

### Error Responses

#### 400 Bad Request — Missing file

```json
{
  "error": "กรุณาเลือกไฟล์"
}
```

#### 400 Bad Request — File too large

```json
{
  "error": "ไฟล์มีขนาดใหญ่เกิน 10MB"
}
```

#### 400 Bad Request — Invalid MIME type

```json
{
  "error": "รองรับเฉพาะไฟล์ PDF, JPEG, PNG"
}
```

#### 400 Bad Request — Invalid document type

```json
{
  "error": "ประเภทเอกสารไม่ถูกต้อง"
}
```

#### 401 Unauthorized — Farmer identity not resolved

```json
{
  "error": "ไม่พบข้อมูลเกษตรกร"
}
```

#### 500 Internal Server Error — R2 upload failed

```json
{
  "error": "ไม่สามารถอัปโหลดไฟล์ได้"
}
```

#### 500 Internal Server Error — Database error

```json
{
  "error": "ไม่สามารถบันทึกข้อมูลได้"
}
```

## Implementation Notes

### Identity Resolution

The endpoint resolves farmer identity in the following order:

1. **LIFF profile**: If the request includes a valid LIFF access token, extract `userId` from the profile and lookup `farmer_id` from `line_links` table.
2. **Query parameter**: If `farmer_id` is provided in the form data, use it directly (for testing without LIFF).
3. **Error**: If neither is available, return 401 Unauthorized.

### File Validation

The endpoint validates the file in the following order:

1. **Presence**: File must be present in multipart/form-data
2. **Size**: File size must be > 0 bytes and <= 10MB
3. **MIME type**: File type must be `application/pdf`, `image/jpeg`, or `image/png`
4. **Document type**: `doc_type` must be `chanote`, `id_copy`, or `power_of_attorney`

### R2 Object Key Generation

The endpoint generates the R2 object key using the following pattern:

```
documents/{farmer_id}/{doc_type}/{timestamp}_{uuid}.{ext}
```

Where:
- `farmer_id`: Farmer identifier from identity resolution
- `doc_type`: Document type code (DOC-01, DOC-03, DOC-06)
- `timestamp`: Unix timestamp in seconds
- `uuid`: UUID v4 for uniqueness
- `ext`: File extension (pdf, jpg, jpeg, png)

### Database Operation

The endpoint performs an upsert operation on the `application_documents` table:

```sql
INSERT INTO application_documents (id, farmer_id, doc_type, r2_key, submitted_at, review_status)
VALUES (?, ?, ?, ?, datetime('now'), 'pending')
ON CONFLICT(farmer_id, doc_type)
DO UPDATE SET
  r2_key = excluded.r2_key,
  submitted_at = datetime('now'),
  review_status = 'pending'
```

This ensures that re-uploading the same document type replaces the previous file.

### Document Count Calculation

After successful upload, the endpoint calculates the document count:

```sql
SELECT COUNT(*) as count FROM application_documents WHERE farmer_id = ?
```

And checks if all required documents are attached:

```sql
SELECT doc_type FROM application_documents WHERE farmer_id = ?
```

Required documents: DOC-01 (chanote), DOC-03 (id_copy)

If both are present, `all_required_attached = true`.

## Security Considerations

### Authentication
- LIFF profile provides authenticated user identity
- Query parameter fallback allows testing without LIFF
- Server validates farmer identity before accepting upload

### Authorization
- Farmer can only upload documents for their own farmer_id
- Server resolves farmer_id from LIFF profile (client cannot spoof)
- Query parameter fallback should be restricted to testing environments

### File Upload
- Server validates file presence, size, and MIME type
- Server generates R2 object key (client cannot specify path)
- R2 bucket access controlled by Worker binding
- No direct client access to R2

### Path Traversal Prevention
- R2 object key generated server-side
- No client-controlled path segments
- Filename sanitized (extension only, no directory separators)

## Testing

### Unit Tests

Test the following scenarios:

1. **Successful upload**: Valid file, valid doc_type, valid farmer_id → 200 OK
2. **Missing file**: No file in form data → 400 Bad Request
3. **File too large**: File > 10MB → 400 Bad Request
4. **Invalid MIME type**: File type not PDF/JPEG/PNG → 400 Bad Request
5. **Invalid doc_type**: doc_type not chanote/id_copy/power_of_attorney → 400 Bad Request
6. **Missing farmer_id**: No LIFF profile and no farmer_id → 401 Unauthorized
7. **R2 upload failure**: R2 put() throws error → 500 Internal Server Error
8. **Database error**: D1 prepare/run throws error → 500 Internal Server Error
9. **Duplicate upload**: Upload same doc_type twice → 200 OK (upsert)

### Integration Tests

Test the following scenarios:

1. **End-to-end upload**: Upload file via LIFF form, verify R2 object exists, verify application_documents record created
2. **Document count**: Upload multiple documents, verify count increases
3. **Required documents**: Upload chanote + id_copy, verify all_required_attached = true
4. **Conversation state**: Upload all required documents, verify conversation state advances to pending_review

### Production QA

Test the following scenarios:

1. **Real LINE OA**: Complete onboarding flow, upload documents via LIFF, verify admin view shows documents
2. **Admin review**: Login to admin console, verify document count and status, download files from R2
3. **Plain text upload**: Send "อัปโหลด" without uploading, verify bot re-displays upload link
4. **Incomplete documents**: Upload only chanote, verify conversation state stays in documents

## Example Usage

### Client (LIFF Form)

```javascript
async function uploadDocument(file, docType, farmerId) {
  const formData = new FormData();
  formData.append('file', file, file.name);
  formData.append('doc_type', docType);
  if (farmerId) {
    formData.append('farmer_id', farmerId);
  }
  
  const response = await fetch('/liff/api/documents/upload', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error);
  }
  
  return result;
}

// Usage
const fileInput = document.getElementById('chanote-file');
const file = fileInput.files[0];
const result = await uploadDocument(file, 'chanote', 'farmer_a37e7502');
console.log(`Uploaded: ${result.doc_type}, count: ${result.document_count}`);
```

### Server (Worker)

```typescript
liffRoutes.post('/api/documents/upload', async (c) => {
  try {
    const db = c.env.DB;
    const r2 = c.env.R2;
    
    // Parse multipart/form-data
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const docType = formData.get('doc_type') as string;
    const farmerIdParam = formData.get('farmer_id') as string;
    
    // Resolve farmer identity
    let farmerId = farmerIdParam;
    if (!farmerId) {
      // TODO: Resolve from LIFF profile
      return c.json({ error: 'ไม่พบข้อมูลเกษตรกร' }, 401);
    }
    
    // Validate file
    const validation = validateDocumentUpload(file);
    if (!validation.valid) {
      return c.json({ error: validation.error }, 400);
    }
    
    // Validate doc_type
    const docTypeValidation = validateDocumentSubmission({
      plot_id: farmerId,
      doc_type: docType
    });
    if (!docTypeValidation.valid) {
      return c.json({ error: docTypeValidation.error }, 400);
    }
    
    // Generate R2 object key
    const r2Key = generateObjectKey(farmerId, docType, file.name);
    
    // Upload to R2
    await r2.put(r2Key, file.stream(), {
      httpMetadata: {
        contentType: file.type
      }
    });
    
    // Map doc_type to code
    const docCodeMap: Record<string, string> = {
      chanote: 'DOC-01',
      id_copy: 'DOC-03',
      power_of_attorney: 'DOC-06'
    };
    const docCode = docCodeMap[docType] || docType;
    
    // Upsert document record
    const docId = `doc_${crypto.randomUUID()}`;
    await db.prepare(`
      INSERT INTO application_documents (id, farmer_id, doc_type, r2_key, submitted_at, review_status)
      VALUES (?, ?, ?, ?, datetime('now'), 'pending')
      ON CONFLICT(farmer_id, doc_type)
      DO UPDATE SET r2_key = excluded.r2_key, submitted_at = datetime('now'), review_status = 'pending'
    `).bind(docId, farmerId, docCode, r2Key).run();
    
    // Calculate document count
    const docs = await db.prepare(
      'SELECT doc_type FROM application_documents WHERE farmer_id = ?'
    ).bind(farmerId).all<{ doc_type: string }>();
    
    const submittedTypes = docs.results.map(d => d.doc_type);
    const required = REQUIRED_DOCUMENTS.filter(d => d.required);
    const allRequiredAttached = required.every(d => submittedTypes.includes(d.code));
    
    return c.json({
      ok: true,
      doc_type: docCode,
      r2_key: r2Key,
      document_count: docs.results.length,
      all_required_attached: allRequiredAttached
    });
  } catch (err) {
    console.error('Document upload error:', err);
    return c.json({ error: 'ไม่สามารถอัปโหลดไฟล์ได้' }, 500);
  }
});
```

## Changelog

- **2026-09-18**: Initial contract definition
