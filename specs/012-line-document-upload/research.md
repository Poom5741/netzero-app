# Research: LINE Document Upload Flow

**Feature**: 012-line-document-upload
**Date**: 2026-09-18
**Status**: Complete

## Research Tasks

### 1. File Upload Mechanism

**Decision**: Use multipart/form-data for file uploads via LIFF form POST to Worker endpoint.

**Rationale**:
- Multipart/form-data is the standard for file uploads in web forms
- Cloudflare Workers natively supports FormData parsing via `request.formData()`
- Avoids base64 encoding overhead (33% size increase)
- Matches existing photo upload pattern in `src/routes/photo.ts`
- LIFF SDK supports standard HTML form submission

**Alternatives Considered**:
- Base64 encoding in JSON: Rejected due to 33% size overhead and complexity
- Direct R2 upload from client: Rejected because it bypasses server-side validation and identity resolution
- Chunked upload: Rejected as unnecessary for <10MB document files

**Implementation Pattern**:
```typescript
// Client (LIFF form)
const formData = new FormData();
formData.append('file', fileBlob, filename);
formData.append('doc_type', 'chanote');
const response = await fetch('/liff/api/documents/upload', {
  method: 'POST',
  body: formData
});

// Server (Worker)
const formData = await request.formData();
const file = formData.get('file') as File;
const docType = formData.get('doc_type') as string;
```

### 2. R2 Object Key Generation

**Decision**: Server generates object keys using pattern: `documents/{farmer_id}/{doc_type}/{timestamp}_{uuid}.{ext}`

**Rationale**:
- Prevents path traversal (no client-controlled path segments)
- Ensures uniqueness (timestamp + UUID)
- Organizes files by farmer and document type for easy retrieval
- Hides implementation details from client
- Matches existing photo upload pattern

**Alternatives Considered**:
- Client-provided key: Rejected due to security risk (path traversal, arbitrary writes)
- Simple UUID: Rejected because it makes file organization difficult
- Sequential numbering: Rejected due to race condition risk

**Implementation Pattern**:
```typescript
function generateObjectKey(farmerId: string, docType: string, filename: string): string {
  const ext = filename.split('.').pop() || 'pdf';
  const timestamp = Date.now();
  const uuid = crypto.randomUUID();
  return `documents/${farmerId}/${docType}/${timestamp}_${uuid}.${ext}`;
}
```

### 3. LIFF Document Form Implementation

**Decision**: Server-rendered HTML form served from Worker route `/liff/documents`, following existing camera page pattern.

**Rationale**:
- Matches existing LIFF camera page pattern in `src/routes/liff.ts`
- No build step required (static HTML)
- LIFF SDK loaded from CDN
- Simple form with file inputs for each document type
- Resolves farmer identity from LIFF profile or query parameter

**Alternatives Considered**:
- React/Next.js page: Rejected because it requires build step and adds complexity
- Single file input with multiple uploads: Rejected because it's harder to track which document type is which
- Separate form per document: Rejected because it requires multiple page loads

**Implementation Pattern**:
```typescript
// src/routes/liff.ts
liffRoutes.get('/documents', (c) => {
  const farmerId = c.req.query('farmer_id');
  const html = renderDocumentUploadForm(farmerId, c.env.LIFF_ID || '');
  return c.html(html);
});

function renderDocumentUploadForm(farmerId: string, liffId: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <script src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
  </head>
  <body>
    <form id="uploadForm">
      <input type="file" name="chanote" accept=".pdf,.jpg,.jpeg,.png">
      <input type="file" name="id_copy" accept=".pdf,.jpg,.jpeg,.png">
      <input type="file" name="power_of_attorney" accept=".pdf,.jpg,.jpeg,.png">
      <button type="submit">อัปโหลดเอกสาร</button>
    </form>
    <script>
      // LIFF init + form submission
    </script>
  </body>
</html>`;
}
```

### 4. Document Validation Strategy

**Decision**: Validate file presence, size (<10MB), and MIME type (PDF/JPEG/PNG) at upload boundary before R2 persistence.

**Rationale**:
- Prevents storage of invalid files
- Matches existing photo upload validation
- Simple and fast (no need to read file content)
- Clear error messages in Thai for user feedback

**Alternatives Considered**:
- Virus scanning: Rejected as unnecessary for POC (admin review provides human verification)
- PDF content validation: Rejected as overly complex for POC
- File size limit per document type: Rejected as unnecessary complexity

**Implementation Pattern**:
```typescript
function validateDocumentUpload(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
  
  if (!file || file.size === 0) {
    return { valid: false, error: 'กรุณาเลือกไฟล์' };
  }
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'ไฟล์มีขนาดใหญ่เกิน 10MB' };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'รองรับเฉพาะไฟล์ PDF, JPEG, PNG' };
  }
  return { valid: true };
}
```

### 5. Identity Resolution Approach

**Decision**: Resolve farmer identity from LIFF profile userId, then lookup farmer_id from line_links table. Fall back to query parameter if LIFF unavailable.

**Rationale**:
- Matches existing chat API pattern in `src/routes/liff.ts`
- Prevents farmer from uploading documents for another farmer
- LIFF profile is authenticated by LINE
- Query parameter fallback allows testing without LIFF

**Alternatives Considered**:
- Client-provided farmer_id: Rejected due to security risk (farmer could upload for another farmer)
- Session-based identity: Rejected because LIFF doesn't maintain sessions
- Phone number verification: Rejected because it adds unnecessary friction

**Implementation Pattern**:
```typescript
// Resolve from LIFF profile
const liffProfile = await liff.getProfile();
const userId = liffProfile.userId;

// Lookup farmer_id from line_links
const link = await db.prepare(
  'SELECT farmer_id FROM line_links WHERE line_user_id = ?'
).bind(userId).first();

if (!link) {
  return { error: 'ไม่พบข้อมูลเกษตรกร' };
}

const farmerId = link.farmer_id;
```

### 6. Admin View Extension Approach

**Decision**: Extend existing admin applications page to show document count and status. Add document list to farmer detail view.

**Rationale**:
- Reuses existing admin UI components
- No new admin surfaces required
- Document count already computed in `/liff/api/documents/:farmerId` endpoint
- Farmer detail view already has tabs for different data sections

**Alternatives Considered**:
- Separate document review page: Rejected as unnecessary complexity
- Document preview in admin: Rejected for POC (admin can download files if needed)
- Real-time document status updates: Rejected as unnecessary for POC

**Implementation Pattern**:
```typescript
// frontend/src/app/admin/applications/page.tsx
// Extend existing application card to show document count
<div className="document-count">
  เอกสาร: {application.document_count}/3
</div>

// frontend/src/app/admin/farmers/[id]/page.tsx
// Add documents tab to farmer detail view
<Tabs>
  <Tab label="เอกสาร">
    <DocumentList farmerId={farmerId} />
  </Tab>
</Tabs>
```

### 7. Conversation State Fix

**Decision**: Modify `handleDocuments()` in `src/line/flow.ts` to check actual document count before advancing to pending_review. Re-display LIFF upload action when plain text `อัปโหลด` is received.

**Rationale**:
- Fixes the P0 release blocker
- Prevents false completion signal
- Matches existing pattern in other state handlers
- Simple database query to check document count

**Alternatives Considered**:
- Remove text-based completion entirely: Rejected because it breaks existing flow
- Add explicit "complete" button: Rejected because it adds complexity
- Require all documents before showing upload link: Rejected because it prevents partial uploads

**Implementation Pattern**:
```typescript
async function handleDocuments(ctx: FlowContext): Promise<FlowResult> {
  const lower = ctx.text.toLowerCase().trim();
  
  // Check if user typed upload command
  if (lower.includes('อัปโหลด') || lower.includes('อัพโหลด')) {
    // Check actual document count
    const docs = await ctx.db.prepare(
      'SELECT COUNT(*) as count FROM application_documents WHERE farmer_id = ?'
    ).bind(ctx.farmerId).first();
    
    const requiredDocs = 2; // chanote + id_copy
    if (docs.count >= requiredDocs) {
      // All documents uploaded, advance to pending_review
      await safePush(ctx, [
        textMessage('✅ ได้รับเอกสารแล้วค่ะ'),
        textMessage('⏳ บัญชีอยู่ระหว่างรอการตรวจสอบจากเจ้าหน้าที่')
      ]);
      return { newState: 'pending_review' };
    } else {
      // Documents incomplete, re-display upload link
      const uploadUrl = `${ctx.appUrl}/liff/documents?farmer_id=${ctx.farmerId}`;
      await safePush(ctx, [
        textMessage('กรุณาอัปโหลดเอกสารให้ครบถ้วน'),
        buildDocumentUploadLinkBubble(uploadUrl)
      ]);
      return { newState: 'documents' };
    }
  }
  
  // Default: show upload link
  const uploadUrl = `${ctx.appUrl}/liff/documents?farmer_id=${ctx.farmerId}`;
  await safePush(ctx, [
    textMessage('กรุณาอัปโหลดเอกสารสิทธิ์'),
    buildDocumentUploadLinkBubble(uploadUrl)
  ]);
  return { newState: 'documents' };
}
```

## Summary

All research tasks complete. Key decisions:
- Multipart/form-data for file uploads
- Server-generated R2 object keys with farmer/doc_type/timestamp structure
- Server-rendered LIFF HTML form following existing camera page pattern
- File validation (size, MIME type) at upload boundary
- LIFF profile + line_links for identity resolution
- Extend existing admin UI for document display
- Check actual document count before advancing conversation state

No unresolved clarifications. Ready for Phase 1 design artifacts.
