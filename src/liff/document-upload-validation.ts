/**
 * Document Upload Validation
 *
 * Validates file uploads for farmer documents (land deed, ID copy, power of attorney).
 * Enforces size limits, MIME type restrictions, and file presence checks.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

/**
 * Validate a file upload for document submission.
 *
 * Checks:
 * - File presence (must exist and have size > 0)
 * - File size (must be <= 10MB)
 * - MIME type (must be PDF, JPEG, or PNG)
 *
 * @param file - The file to validate (from FormData)
 * @returns ValidationResult with valid flag and optional error message in Thai
 */
export function validateDocumentUpload(file: File | null | undefined): ValidationResult {
  // Check file presence
  if (!file) {
    return {
      valid: false,
      error: "กรุณาเลือกไฟล์",
    };
  }

  // Check file size > 0
  if (file.size === 0) {
    return {
      valid: false,
      error: "ไฟล์ว่างเปล่า กรุณาเลือกไฟล์ใหม่",
    };
  }

  // Check file size limit
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "ไฟล์มีขนาดใหญ่เกิน 10MB",
    };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
    return {
      valid: false,
      error: "รองรับเฉพาะไฟล์ PDF, JPEG, PNG",
    };
  }

  return { valid: true };
}

/**
 * Validate document type string.
 *
 * @param docType - Document type from form (chanote, id_copy, power_of_attorney)
 * @returns ValidationResult with valid flag and optional error message in Thai
 */
export function validateDocumentType(docType: string | null | undefined): ValidationResult {
  if (!docType) {
    return {
      valid: false,
      error: "กรุณาระบุประเภทเอกสาร",
    };
  }

  const validTypes = ["chanote", "id_copy", "power_of_attorney"];
  if (!validTypes.includes(docType)) {
    return {
      valid: false,
      error: "ประเภทเอกสารไม่ถูกต้อง",
    };
  }

  return { valid: true };
}
