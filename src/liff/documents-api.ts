/**
 * LIFF Document Upload API — handles 3 required documents per plot.
 *
 * Documents required:
 * - DOC-01: โฉนดที่ดิน (Land deed / Chanote)
 * - DOC-03: สำเนาบัตรประชาชน (ID card copy)
 * - DOC-06: หนังสือมอบอำนาจ (Power of attorney, if not owner)
 */

export interface RequiredDocument {
  type: string;
  code: string;
  name: string;
  nameEn: string;
  required: boolean;
}

export const REQUIRED_DOCUMENTS: RequiredDocument[] = [
  { type: "chanote", code: "DOC-01", name: "โฉนดที่ดิน", nameEn: "Land deed", required: true },
  {
    type: "id_copy",
    code: "DOC-03",
    name: "สำเนาบัตรประชาชน",
    nameEn: "ID card copy",
    required: true,
  },
  {
    type: "power_of_attorney",
    code: "DOC-06",
    name: "หนังสือมอบอำนาจ",
    nameEn: "Power of attorney",
    required: false,
  },
];

export interface DocumentPromptInput {
  plotCode: string;
  deedNo: string;
}

export interface DocumentSubmissionInput {
  plot_id: string;
  doc_type: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const VALID_DOC_TYPES = REQUIRED_DOCUMENTS.map((d) => d.type);

/**
 * Compose the document upload prompt message.
 * Matches the design system's document submission flow.
 */
export function composeDocumentPrompt(input: DocumentPromptInput): string {
  const lines: string[] = [];

  lines.push(`เอกสารสิทธิ์ของแปลง ${input.plotCode}`);
  lines.push(`โฉนดเลขที่ ${input.deedNo}`);
  lines.push("");
  lines.push("แปลงนี้ต้องแนบเอกสาร 3 รายการครับ");
  lines.push("ถ่ายจากของจริงได้เลย ให้เห็นครบทั้งใบนะครับ");
  lines.push("");

  for (const doc of REQUIRED_DOCUMENTS) {
    const req = doc.required ? "" : " (ถ้าไม่ใช่เจ้าของ)";
    lines.push(`${doc.code}`);
    lines.push(`${doc.name}${req}`);
  }

  return lines.join("\n");
}

/**
 * Validate a document submission.
 */
export function validateDocumentSubmission(input: DocumentSubmissionInput): ValidationResult {
  if (!input.doc_type?.trim()) {
    return { valid: false, error: "doc_type is required" };
  }
  if (!VALID_DOC_TYPES.includes(input.doc_type)) {
    return {
      valid: false,
      error: `doc_type must be one of: ${VALID_DOC_TYPES.join(", ")}`,
    };
  }
  return { valid: true };
}
