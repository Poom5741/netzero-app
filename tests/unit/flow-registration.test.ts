import { describe, expect, it } from "vitest";

/**
 * Tests for OB-01 to OB-11 registration chat flow.
 * Handles: friend addition → PDPA → phone match → identity → form → docs → activation
 */

describe("composeRegistrationWelcome", () => {
  it("composes welcome message", async () => {
    const { composeRegistrationWelcome } = await import("../../src/line/flow-registration");
    const msg = composeRegistrationWelcome();
    expect(msg).toContain("ยินดีต้อนรับ");
    expect(msg).toContain("NetZeroCarbon");
    expect(msg).toContain("โครงการทำนาลดโลกร้อน");
  });

  it("includes registration instructions", async () => {
    const { composeRegistrationWelcome } = await import("../../src/line/flow-registration");
    const msg = composeRegistrationWelcome();
    expect(msg).toContain("10 นาที");
    expect(msg).toContain("คาร์บอนเครดิต");
  });
});

describe("composePdpaConsent", () => {
  it("composes PDPA consent message", async () => {
    const { composePdpaConsent } = await import("../../src/line/flow-registration");
    const msg = composePdpaConsent();
    expect(msg).toContain("PDPA");
    expect(msg).toContain("ข้อมูลส่วนบุคคล");
  });

  it("lists what data is collected", async () => {
    const { composePdpaConsent } = await import("../../src/line/flow-registration");
    const msg = composePdpaConsent();
    expect(msg).toContain("ชื่อ");
    expect(msg).toContain("เบอร์โทร");
    expect(msg).toContain("เลขบัตร");
  });

  it("mentions withdrawal right", async () => {
    const { composePdpaConsent } = await import("../../src/line/flow-registration");
    const msg = composePdpaConsent();
    expect(msg).toContain("ถอนความยินยอม");
  });
});

describe("composeIdentityConfirmation", () => {
  it("composes identity confirmation with farmer name", async () => {
    const { composeIdentityConfirmation } = await import("../../src/line/flow-registration");
    const msg = composeIdentityConfirmation({
      farmerName: "สมชาย ใจดี",
      province: "สุพรรณบุรี",
      district: "สามชุก",
    });
    expect(msg).toContain("สมชาย ใจดี");
    expect(msg).toContain("สามชุก");
    expect(msg).toContain("สุพรรณบุรี");
  });

  it("asks for confirmation", async () => {
    const { composeIdentityConfirmation } = await import("../../src/line/flow-registration");
    const msg = composeIdentityConfirmation({
      farmerName: "สมชาย ใจดี",
      province: "สุพรรณบุรี",
      district: "สามชุก",
    });
    expect(msg).toContain("ใช่ท่าน");
  });
});

describe("composeActivationSuccess", () => {
  it("composes activation success with farmer code", async () => {
    const { composeActivationSuccess } = await import("../../src/line/flow-registration");
    const msg = composeActivationSuccess({
      farmerCode: "SPB-0142",
      plotName: "แปลงนาหลังบ้าน",
      areaRai: 14.0,
    });
    expect(msg).toContain("SPB-0142");
    expect(msg).toContain("แปลงนาหลังบ้าน");
    expect(msg).toContain("เปิดใช้งาน");
  });

  it("mentions next step", async () => {
    const { composeActivationSuccess } = await import("../../src/line/flow-registration");
    const msg = composeActivationSuccess({
      farmerCode: "SPB-0142",
      plotName: "แปลงทดสอบ",
      areaRai: 10.0,
    });
    expect(msg).toContain("ขั้นต่อไป");
    expect(msg).toContain("วันหว่าน");
  });
});

describe("REGISTRATION_STEPS", () => {
  it("defines 11 registration steps", async () => {
    const { REGISTRATION_STEPS } = await import("../../src/line/flow-registration");
    expect(REGISTRATION_STEPS).toHaveLength(11);
  });

  it("starts with welcome and ends with activation", async () => {
    const { REGISTRATION_STEPS } = await import("../../src/line/flow-registration");
    expect(REGISTRATION_STEPS[0].code).toBe("OB-01");
    expect(REGISTRATION_STEPS[10].code).toBe("OB-11");
  });
});
