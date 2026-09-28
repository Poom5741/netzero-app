import { describe, expect, test } from "bun:test";
import { getQuickReplyForState, withQuickReply } from "../../src/line/quick-replies";

describe("getQuickReplyForState", () => {
  test("returns buttons for welcome state", () => {
    const qr = getQuickReplyForState("welcome");
    expect(qr).not.toBeNull();
    expect(qr!.items.length).toBeGreaterThan(0);
    expect(qr!.items[0]!.action.type).toBe("message");
  });

  test("returns accept/reject buttons for consent state", () => {
    const qr = getQuickReplyForState("consent");
    expect(qr).not.toBeNull();
    const labels = qr!.items.map((i) => i.action.label);
    expect(labels).toContain("✅ ยอมรับทั้งหมด");
    expect(labels).toContain("❌ ไม่ยินยอม");
  });

  test("returns yes/no buttons for identity_confirm state", () => {
    const qr = getQuickReplyForState("identity_confirm");
    expect(qr).not.toBeNull();
    const labels = qr!.items.map((i) => i.action.label);
    expect(labels).toContain("✅ ใช่");
    expect(labels).toContain("❌ ไม่ใช่");
  });

  test("returns upload button for documents state", () => {
    const qr = getQuickReplyForState("documents");
    expect(qr).not.toBeNull();
    const labels = qr!.items.map((i) => i.action.label);
    expect(labels.some((l) => l.includes("อัปโหลด"))).toBe(true);
  });

  test("returns navigation buttons for calendar state", () => {
    const qr = getQuickReplyForState("calendar");
    expect(qr).not.toBeNull();
    expect(qr!.items.length).toBeGreaterThanOrEqual(3);
    const labels = qr!.items.map((i) => i.action.label);
    expect(labels.some((l) => l.includes("ถ่ายรูป"))).toBe(true);
    expect(labels.some((l) => l.includes("ดูผล"))).toBe(true);
  });

  test("returns null for phone state (user must type)", () => {
    const qr = getQuickReplyForState("phone");
    expect(qr).toBeNull();
  });

  test("includes LIFF button for registration state when liffId provided", () => {
    const qr = getQuickReplyForState("registration", "test-liff-id");
    expect(qr).not.toBeNull();
    const hasLiffButton = qr!.items.some(
      (i) => i.action.type === "postback" && i.action.label.includes("ฟอร์ม"),
    );
    expect(hasLiffButton).toBe(true);
  });
});

describe("withQuickReply", () => {
  test("attaches quickReply to last message", () => {
    const messages = [
      { type: "text", text: "First" },
      { type: "text", text: "Last" },
    ];
    const result = withQuickReply("consent", messages);
    expect(result.length).toBe(2);
    expect(result[0]!.quickReply).toBeUndefined();
    expect(result[1]!.quickReply).toBeDefined();
    expect((result[1]!.quickReply as any).items.length).toBeGreaterThan(0);
  });

  test("returns unchanged messages when no quick replies for state", () => {
    const messages = [{ type: "text", text: "Hello" }];
    const result = withQuickReply("phone", messages);
    expect(result).toEqual(messages);
  });

  test("returns unchanged messages when array is empty", () => {
    const result = withQuickReply("consent", []);
    expect(result).toEqual([]);
  });
});
