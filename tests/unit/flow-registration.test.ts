import { describe, expect, it } from "vitest";
import {
  composePdpaConsent,
  composeRegistrationWelcome,
  REGISTRATION_STEPS,
} from "../../src/line/flow-registration";

/**
 * Tests for the registration chat flow (OB-01…OB-13, LF-01 in artifact numbering).
 * Handles: friend addition → PDPA → phone match → identity → form → docs → activation
 */

describe("composeRegistrationWelcome", () => {
  it("composes welcome message", () => {
    const msg = composeRegistrationWelcome();
    expect(msg).toContain("ยินดีต้อนรับ");
    expect(msg).toContain("NetZeroCarbon");
    expect(msg).toContain("โครงการทำนาลดโลกร้อน");
  });

  it("includes registration instructions", async () => {
    const msg = composeRegistrationWelcome();
    expect(msg).toContain("10 นาที");
    expect(msg).toContain("คาร์บอนเครดิต");
  });
});

describe("composePdpaConsent", () => {
  it("composes PDPA consent message", () => {
    const msg = composePdpaConsent();
    expect(msg).toContain("PDPA");
    expect(msg).toContain("ข้อมูลส่วนบุคคล");
  });

  it("lists what data is collected", () => {
    const msg = composePdpaConsent();
    expect(msg).toContain("ชื่อ");
    expect(msg).toContain("เบอร์โทร");
    expect(msg).toContain("เลขบัตร");
  });

  it("mentions withdrawal right", () => {
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
  it("defines 10 registration steps", () => {
    expect(REGISTRATION_STEPS).toHaveLength(10);
  });

  it("starts with welcome and ends with activation", () => {
    // Artifact script numbering (specs/016-flow-parity/node-design-spec.md §3).
    expect(REGISTRATION_STEPS[0].code).toBe("OB-01");
    expect(REGISTRATION_STEPS.at(-1)?.code).toBe("OB-11");
  });

  it("carries the legacy code for every step whose identifier changed", () => {
    const renamed = REGISTRATION_STEPS.filter((s) => s.legacyCode);
    expect(renamed.length).toBeGreaterThan(0);
    // The schemes collide on OB-10/OB-11: legacy OB-08 (pending review) is
    // artifact OB-10, and legacy OB-09 (activation) is artifact OB-11. The
    // legacy code is what disambiguates old logs.
    const pending = renamed.find((s) => s.code === "OB-10");
    expect(pending?.legacyCode).toBe("OB-08");
    const activation = renamed.find((s) => s.code === "OB-11");
    expect(activation?.legacyCode).toBe("OB-09");
  });
});
