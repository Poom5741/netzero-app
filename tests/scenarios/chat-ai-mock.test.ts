import { describe, expect, it } from "bun:test";
import { type ConversationScenario, runConversationScenario } from "../helpers/conversation-runner";

describe("chat-ai-mock scenario", () => {
  it("handles AI conversation with mock", async () => {
    const scenario: ConversationScenario = {
      name: "chat-ai-mock",
      description: "Test AI conversation flow with mock",
      setup: {
        initialState: "chat",
      },
      steps: [
        {
          user_sends: "สวัสดี",
          expect_state: "chat",
          expect_reply_contains: "สวัสดี",
        },
      ],
      aiMock: async () => ({
        type: "reply",
        text: "สวัสดีครับ! ยินดีช่วยเหลือคุณ 🌱",
      }),
    };

    const result = await runConversationScenario(scenario);
    expect(result.steps).toBe(1);
    expect(result.finalState).toBe("chat");
  });

  it("handles draft creation with mock", async () => {
    const scenario: ConversationScenario = {
      name: "chat-draft-mock",
      description: "Test draft creation flow with mock",
      setup: {
        initialState: "chat",
      },
      steps: [
        {
          user_sends: "ใส่ปุ๋ย 46-0-0 อัตรา 12 กก./ไร่",
          expect_state: "confirm_draft",
          expect_reply_contains: "ยืนยัน",
        },
      ],
      aiMock: async () => ({
        type: "draft",
        category: "fertilizer",
        data: { formula: "46-0-0", rate_kg_per_rai: 12, is_urea: true },
        text: "พบข้อมูลปุ๋ย: สูตร 46-0-0 อัตรา 12 กก./ไร่",
      }),
    };

    const result = await runConversationScenario(scenario);
    expect(result.steps).toBe(1);
    expect(result.finalState).toBe("confirm_draft");
  });
});
