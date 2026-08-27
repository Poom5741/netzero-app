import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildWelcomeFlex, createWelcomeHandler } from "../../src/line/welcome";

describe("buildWelcomeFlex", () => {
  it("returns Flex Message JSON with correct structure", () => {
    const msg = buildWelcomeFlex();
    expect(msg.type).toBe("flex");
    expect(msg.altText).toBeTruthy();
    expect(msg.contents).toBeDefined();
  });

  it("includes project name in header", () => {
    const msg = buildWelcomeFlex();
    const header = msg.contents?.contents?.[0];
    expect(header).toBeDefined();
    expect(JSON.stringify(header)).toContain("NetZeroCarbon");
  });

  it("includes PDPA consent note", () => {
    const msg = buildWelcomeFlex();
    const fullText = JSON.stringify(msg);
    expect(fullText).toContain("PDPA");
  });
});

describe("createWelcomeHandler", () => {
  let sentMessages: Array<{ token: string; msg: unknown }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let replyFn: (token: string, msg: Record<string, unknown>) => Promise<{ status: number }>;

  beforeEach(() => {
    sentMessages = [];
    replyFn = vi.fn(async (token: string, msg: Record<string, unknown>) => {
      sentMessages.push({ token, msg });
      return { status: 200 };
    });
  });

  it("sends welcome Flex Message on follow event", async () => {
    const handler = createWelcomeHandler(replyFn);
    await handler({
      type: "follow",
      replyToken: "reply-token-1",
      source: { userId: "U456", type: "user" },
      timestamp: Date.now(),
      mode: "active",
    });

    expect(replyFn).toHaveBeenCalledTimes(1);
    expect(replyFn).toHaveBeenCalledWith("reply-token-1", expect.any(Object));
    const sentMsg = sentMessages[0]?.msg as { type: string };
    expect(sentMsg.type).toBe("flex");
  });

  it("does not reply to non-follow events", async () => {
    const handler = createWelcomeHandler(replyFn);
    await handler({
      type: "message",
      replyToken: "reply-token-2",
      source: { userId: "U456", type: "user" },
      timestamp: Date.now(),
      mode: "active",
    });

    expect(replyFn).not.toHaveBeenCalled();
  });
});
