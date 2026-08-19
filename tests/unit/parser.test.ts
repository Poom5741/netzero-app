import { describe, expect, it } from "vitest";
import { parseDraft } from "../../src/chat/parser";

describe("parseDraft", () => {
  it("parses fertilizer mention with formula and rate", () => {
    const result = parseDraft("ใส่ปุ๋ยสูตร 16-16-16 อัตรา 25 กก./ไร่");
    expect(result.type).toBe("fertilizer");
    expect(result.data).toBeDefined();
  });

  it("parses step (base/tillering/panicle) from Thai text", () => {
    const result = parseDraft("ใส่ปุ๋ยฐาน สูตร 46-0-0 อัตรา 15 กก");
    expect(result.type).toBe("fertilizer");
    if (result.type === "fertilizer") {
      expect(result.data.step).toBe("base");
    }
  });

  it("detects urea from 46-0-0 formula", () => {
    const result = parseDraft("ใส่ปุ๋ย 46-0-0 อัตรา 20 กก./ไร่ ขั้นหว่าน");
    expect(result.type).toBe("fertilizer");
    if (result.type === "fertilizer") {
      expect(result.data.is_urea).toBe(true);
    }
  });

  it("returns type 'unknown' for unrecognized text", () => {
    const result = parseDraft("สวัสดีครับ");
    expect(result.type).toBe("unknown");
  });

  it("parses photo request", () => {
    const result = parseDraft("ถ่ายรูปแปลง");
    expect(result.type).toBe("photo");
  });

  it("returns metadata with original text", () => {
    const result = parseDraft("ใส่ปุ๋ย 16-16-16 30 กก");
    expect(result.raw_text).toBe("ใส่ปุ๋ย 16-16-16 30 กก");
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });
});
