import { describe, expect, it } from "vitest";
import { handleFaq } from "../../src/chat/faq";

describe("handleFaq", () => {
  it("responds to greeting in Thai", async () => {
    const result = await handleFaq("สวัสดี");
    expect(result.reply).toBeDefined();
    expect(result.reply.length).toBeGreaterThan(0);
    expect(result.wroteToDb).toBe(false);
  });

  it("responds to price question", async () => {
    const result = await handleFaq("ข้าวราคาเท่าไหร่");
    expect(result.reply).toBeDefined();
    expect(result.wroteToDb).toBe(false);
  });

  it("responds to weather question", async () => {
    const result = await handleFaq("วันนี้ฝนตกไหม");
    expect(result.reply).toBeDefined();
    expect(result.wroteToDb).toBe(false);
  });

  it("returns default response for unknown topics", async () => {
    const result = await handleFaq("abcxyz123");
    expect(result.reply).toBeDefined();
    expect(result.wroteToDb).toBe(false);
  });

  it("never writes to database", async () => {
    const queries = ["help", "ราคา", "ฝน", "สวัสดีครับ"];
    for (const q of queries) {
      const result = await handleFaq(q);
      expect(result.wroteToDb).toBe(false);
    }
  });
});
