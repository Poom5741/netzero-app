import type { ConversationScenario } from "../helpers/conversation-runner";

export const photoReporting: ConversationScenario = {
  name: "photo-reporting",
  description: "Photo reporting flow from calendar to photo_report",
  setup: {
    initialState: "calendar",
  },
  steps: [
    {
      user_sends: "ถ่ายรูป",
      expect_state: "photo_report",
      expect_reply_contains: "เปิดกล้องถ่ายรูป",
    },
    {
      user_sends: "ดูปฏิทิน",
      expect_state: "calendar",
      expect_reply_contains: "ปฏิทิน",
    },
  ],
};
