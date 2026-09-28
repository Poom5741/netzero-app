import type { ConversationScenario } from "../helpers/conversation-runner";

export const seasonSetup: ConversationScenario = {
  name: "season-setup",
  description: "Season setup flow from activation to calendar",
  setup: {
    initialState: "activation",
  },
  steps: [
    {
      user_sends: "any", // activation state ignores input and sends activation message
      expect_state: "season_setup",
      expect_reply_contains: "วันหว่าน",
    },
    {
      user_sends: "15/06/2026",
      expect_state: "calendar",
      expect_reply_contains: "บันทึกวันหว่าน",
    },
  ],
};
