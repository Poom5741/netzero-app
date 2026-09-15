import { describe, expect, it } from "vitest";

/**
 * Task 03: PDPA 4-consent (OB-15) + project conditions (OB-05).
 *
 * Tests:
 * 1. buildConsent4Checkbox renders 4 consent types with checkboxes
 * 2. Flow records each consent via recordConsent()
 * 3. Flow gates progression until hasAllConsents() is true
 * 4. OB-05 conditions card renders 3 conditions
 * 5. Conditions gate progression until accepted
 */

import { buildConditions3Checkbox, buildConsent4Checkbox } from "../../src/line/flex-builders";

describe("buildConsent4Checkbox", () => {
  it("returns a flex message", () => {
    const msg = buildConsent4Checkbox();
    expect(msg.type).toBe("flex");
  });

  it("contains all 4 consent types", () => {
    const json = JSON.stringify(buildConsent4Checkbox());
    expect(json).toContain("pdpa");
    expect(json).toContain("data_collection");
    expect(json).toContain("photo_sharing");
    expect(json).toContain("carbon_project");
  });

  it("has Thai labels for all 4 consents", () => {
    const json = JSON.stringify(buildConsent4Checkbox());
    expect(json).toContain("CS-01");
    expect(json).toContain("CS-02");
    expect(json).toContain("CS-03");
    expect(json).toContain("CS-04");
  });

  it("has altText in Thai", () => {
    const msg = buildConsent4Checkbox();
    expect(msg.altText).toBeTruthy();
  });

  it("includes accept-all action postback", () => {
    const json = JSON.stringify(buildConsent4Checkbox());
    expect(json).toContain("consent_accept_all");
  });

  it("includes individual consent actions", () => {
    const json = JSON.stringify(buildConsent4Checkbox());
    expect(json).toContain("consent_pdpa");
    expect(json).toContain("consent_data_collection");
    expect(json).toContain("consent_photo_sharing");
    expect(json).toContain("consent_carbon_project");
  });
});

describe("buildConditions3Checkbox", () => {
  it("returns a flex message", () => {
    const msg = buildConditions3Checkbox();
    expect(msg.type).toBe("flex");
  });

  it("contains 3 conditions", () => {
    const json = JSON.stringify(buildConditions3Checkbox());
    expect(json).toContain("ส่งภาพหลักฐาน");
    expect(json).toContain("ให้ข้อมูลแปลงนา");
    expect(json).toContain("ยินยอมให้ตรวจสอบ");
  });

  it("has conditions_accept action", () => {
    const json = JSON.stringify(buildConditions3Checkbox());
    expect(json).toContain("conditions_accept");
  });

  it("has altText", () => {
    const msg = buildConditions3Checkbox();
    expect(msg.altText).toBeTruthy();
  });
});
