import { describe, expect, it } from "vitest";

/**
 * Tests for LIFF document upload API.
 * Handles 3 required documents: deed, ID copy, power of attorney.
 */

describe("composeDocumentPrompt", () => {
  it("composes document upload prompt with 3 required items", async () => {
    const { composeDocumentPrompt } = await import("../../src/liff/documents-api");
    const msg = composeDocumentPrompt({
      plotCode: "SPB-0142",
      deedNo: "12345",
    });
    expect(msg).toContain("SPB-0142");
    expect(msg).toContain("12345");
    expect(msg).toContain("โฉนดที่ดิน");
    expect(msg).toContain("สำเนาบัตรประชาชน");
    expect(msg).toContain("หนังสือมอบอำนาจ");
  });

  it("includes instruction to photograph clearly", async () => {
    const { composeDocumentPrompt } = await import("../../src/liff/documents-api");
    const msg = composeDocumentPrompt({
      plotCode: "SPB-0142",
      deedNo: "12345",
    });
    expect(msg).toContain("ครบทั้งใบ");
  });
});

describe("validateDocumentSubmission", () => {
  it("rejects when doc_type is missing", async () => {
    const { validateDocumentSubmission } = await import("../../src/liff/documents-api");
    const result = validateDocumentSubmission({
      plot_id: "plot_1",
      doc_type: "",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("doc_type");
  });

  it("rejects invalid doc_type", async () => {
    const { validateDocumentSubmission } = await import("../../src/liff/documents-api");
    const result = validateDocumentSubmission({
      plot_id: "plot_1",
      doc_type: "invalid",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("doc_type");
  });

  it("accepts valid doc_type: chanote", async () => {
    const { validateDocumentSubmission } = await import("../../src/liff/documents-api");
    const result = validateDocumentSubmission({
      plot_id: "plot_1",
      doc_type: "chanote",
    });
    expect(result.valid).toBe(true);
  });

  it("accepts valid doc_type: id_copy", async () => {
    const { validateDocumentSubmission } = await import("../../src/liff/documents-api");
    const result = validateDocumentSubmission({
      plot_id: "plot_1",
      doc_type: "id_copy",
    });
    expect(result.valid).toBe(true);
  });

  it("accepts valid doc_type: power_of_attorney", async () => {
    const { validateDocumentSubmission } = await import("../../src/liff/documents-api");
    const result = validateDocumentSubmission({
      plot_id: "plot_1",
      doc_type: "power_of_attorney",
    });
    expect(result.valid).toBe(true);
  });
});

describe("REQUIRED_DOCUMENTS", () => {
  it("defines 3 required document types", async () => {
    const { REQUIRED_DOCUMENTS } = await import("../../src/liff/documents-api");
    expect(REQUIRED_DOCUMENTS).toHaveLength(3);
  });

  it("includes chanote, id_copy, power_of_attorney", async () => {
    const { REQUIRED_DOCUMENTS } = await import("../../src/liff/documents-api");
    const types = REQUIRED_DOCUMENTS.map((d: { type: string }) => d.type);
    expect(types).toContain("chanote");
    expect(types).toContain("id_copy");
    expect(types).toContain("power_of_attorney");
  });
});
