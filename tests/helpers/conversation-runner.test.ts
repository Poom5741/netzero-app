/**
 * Conversation runner self-check.
 *
 * Verifies that runConversationScenario can chain multiple turns and assert
 * on state transitions and reply content.
 */

import { describe, expect, it } from "bun:test";
import { type ConversationScenario, runConversationScenario } from "./conversation-runner";

describe("conversation runner", () => {
  it("chains welcome -> consent -> phone", async () => {
    const scenario: ConversationScenario = {
      name: "smoke-welcome-consent-phone",
      steps: [
        { user_sends: "ลงทะเบียน", expect_state: "consent", expect_reply_contains: "ยินยอม" },
        { user_sends: "ยอมรับ", expect_state: "phone", expect_reply_contains: "เบอร์โทรศัพท์" },
        { user_sends: "0812345678", expect_state: "identity_confirm" },
      ],
    };

    const result = await runConversationScenario(scenario);
    expect(result.steps).toBe(3);
    expect(result.finalState).toBe("identity_confirm");
  });

  it("rejects when state does not match", async () => {
    const scenario: ConversationScenario = {
      name: "smoke-wrong-state",
      steps: [{ user_sends: "สวัสดี", expect_state: "phone" }],
    };

    await expect(runConversationScenario(scenario)).rejects.toThrow(/expected phone/);
  });
});
