import { describe, expect, it } from "vitest";

/**
 * Task 04: Registration form validation + document submission.
 *
 * Tests:
 * 1. Registration form validation (R-01..R-14 fields)
 * 2. Document submission validation (3-document checklist)
 * 3. Submit gate: blocked until all required docs attached
 */

import {
  validateRegistrationForm,
  type RegistrationFormData,
} from "../../src/liff/registration-api";
import {
  validateDocumentSubmission,
  REQUIRED_DOCUMENTS,
  type DocumentSubmissionInput,
} from "../../src/liff/documents-api";

// ---------------------------------------------------------------------------
// Registration form validation
// ---------------------------------------------------------------------------

describe("validateRegistrationForm", () => {
  const validForm: RegistrationFormData = {
    full_name: "สมชาย ใจดี",
    gender: "male",
    phone: "0812345678",
    national_id: "1234567890123",
    addr_province: "สุพรรณบุรี",
    addr_district: "เมือง",
    addr_subdistrict: "ท่าพี่เลี้ยง",
    addr_village: "หมู่ 1",
    deed_no: "12345",
    deed_type: "chanote",
    holding_status: "owner",
    area_rai: 15.5,
    centroid_lat: 14.5,
    centroid_lng: 100.0,
  };

  it("accepts a valid form", () => {
    const result = validateRegistrationForm(validForm);
    expect(result.valid).toBe(true);
  });

  it("rejects missing full_name", () => {
    const form = { ...validForm, full_name: "" };
    const result = validateRegistrationForm(form);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("full_name");
  });

  it("rejects missing phone", () => {
    const form = { ...validForm, phone: "" };
    const result = validateRegistrationForm(form);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("phone");
  });

  it("rejects invalid phone format", () => {
    const form = { ...validForm, phone: "12345" };
    const result = validateRegistrationForm(form);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("phone");
  });

  it("rejects missing national_id", () => {
    const form = { ...validForm, national_id: "" };
    const result = validateRegistrationForm(form);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("national_id");
  });

  it("rejects missing addr_province", () => {
    const form = { ...validForm, addr_province: "" };
    const result = validateRegistrationForm(form);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("province");
  });

  it("rejects missing deed_no", () => {
    const form = { ...validForm, deed_no: "" };
    const result = validateRegistrationForm(form);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("deed");
  });

  it("rejects invalid deed_type", () => {
    const form = { ...validForm, deed_type: "invalid" };
    const result = validateRegistrationForm(form);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("deed_type");
  });

  it("rejects invalid holding_status", () => {
    const form = { ...validForm, holding_status: "invalid" };
    const result = validateRegistrationForm(form);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("holding_status");
  });

  it("rejects zero or negative area_rai", () => {
    const form = { ...validForm, area_rai: 0 };
    const result = validateRegistrationForm(form);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("area_rai");
  });

  it("accepts deed_type = ns3k", () => {
    const form = { ...validForm, deed_type: "ns3k" };
    const result = validateRegistrationForm(form);
    expect(result.valid).toBe(true);
  });

  it("accepts deed_type = spk", () => {
    const form = { ...validForm, deed_type: "spk" };
    const result = validateRegistrationForm(form);
    expect(result.valid).toBe(true);
  });

  it("accepts deed_type = rental", () => {
    const form = { ...validForm, deed_type: "rental" };
    const result = validateRegistrationForm(form);
    expect(result.valid).toBe(true);
  });

  it("accepts holding_status = tenant", () => {
    const form = { ...validForm, holding_status: "tenant" };
    const result = validateRegistrationForm(form);
    expect(result.valid).toBe(true);
  });

  it("accepts holding_status = proxy", () => {
    const form = { ...validForm, holding_status: "proxy" };
    const result = validateRegistrationForm(form);
    expect(result.valid).toBe(true);
  });

  it("accepts holding_status = renter", () => {
    const form = { ...validForm, holding_status: "renter" };
    const result = validateRegistrationForm(form);
    expect(result.valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Document submission gate
// ---------------------------------------------------------------------------

describe("document submission gate", () => {
  it("REQUIRED_DOCUMENTS defines 3 required documents", () => {
    expect(REQUIRED_DOCUMENTS).toHaveLength(3);
  });

  it("DOC-01 (chanote) is required", () => {
    const doc = REQUIRED_DOCUMENTS.find((d) => d.code === "DOC-01");
    expect(doc).toBeDefined();
    expect(doc!.required).toBe(true);
  });

  it("DOC-03 (id_copy) is required", () => {
    const doc = REQUIRED_DOCUMENTS.find((d) => d.code === "DOC-03");
    expect(doc).toBeDefined();
    expect(doc!.required).toBe(true);
  });

  it("DOC-06 (power_of_attorney) is optional", () => {
    const doc = REQUIRED_DOCUMENTS.find((d) => d.code === "DOC-06");
    expect(doc).toBeDefined();
    expect(doc!.required).toBe(false);
  });

  it("allDocsAttached returns false when no docs", () => {
    const submitted: string[] = [];
    const required = REQUIRED_DOCUMENTS.filter((d) => d.required);
    const attached = required.every((d) => submitted.includes(d.code));
    expect(attached).toBe(false);
  });

  it("allDocsAttached returns true when all required docs submitted", () => {
    const submitted = ["DOC-01", "DOC-03"];
    const required = REQUIRED_DOCUMENTS.filter((d) => d.required);
    const attached = required.every((d) => submitted.includes(d.code));
    expect(attached).toBe(true);
  });

  it("allDocsAttached returns false when only one required doc submitted", () => {
    const submitted = ["DOC-01"];
    const required = REQUIRED_DOCUMENTS.filter((d) => d.required);
    const attached = required.every((d) => submitted.includes(d.code));
    expect(attached).toBe(false);
  });
});
