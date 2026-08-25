import { describe, expect, it } from "vitest";
import { buildConsentCard, type ConsentStatus, hasAllConsents } from "../../src/line/consent";

describe("buildConsentCard", () => {
  it("returns Flex Message with type flex", () => {
    const card = buildConsentCard();
    expect(card.type).toBe("flex");
  });

  it("contains 4 consent checkboxes", () => {
    const card = buildConsentCard();
    const text = JSON.stringify(card);
    expect(text).toContain("pdpa");
    expect(text).toContain("data_collection");
    expect(text).toContain("photo_sharing");
    expect(text).toContain("carbon_project");
  });

  it("has altText in Thai", () => {
    const card = buildConsentCard();
    expect(card.altText).toBeTruthy();
    expect(typeof card.altText).toBe("string");
  });
});

describe("hasAllConsents", () => {
  it("returns false when no consents given", () => {
    const status: ConsentStatus = {
      pdpa: false,
      data_collection: false,
      photo_sharing: false,
      carbon_project: false,
    };
    expect(hasAllConsents(status)).toBe(false);
  });

  it("returns false when only some consents given", () => {
    const status: ConsentStatus = {
      pdpa: true,
      data_collection: true,
      photo_sharing: false,
      carbon_project: false,
    };
    expect(hasAllConsents(status)).toBe(false);
  });

  it("returns true when all 4 consents given", () => {
    const status: ConsentStatus = {
      pdpa: true,
      data_collection: true,
      photo_sharing: true,
      carbon_project: true,
    };
    expect(hasAllConsents(status)).toBe(true);
  });

  it("tracks consent_ok flag correctly", () => {
    const allTrue: ConsentStatus = {
      pdpa: true,
      data_collection: true,
      photo_sharing: true,
      carbon_project: true,
    };
    expect(hasAllConsents(allTrue)).toBe(true);

    const oneFalse: ConsentStatus = {
      pdpa: true,
      data_collection: true,
      photo_sharing: true,
      carbon_project: false,
    };
    expect(hasAllConsents(oneFalse)).toBe(false);
  });
});
