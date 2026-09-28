import { describe, it } from "bun:test";
import { runConversationScenario } from "../helpers/conversation-runner";
import { photoReporting } from "./photo-reporting";

describe("photo-reporting scenario", () => {
  it("completes photo reporting flow", async () => {
    await runConversationScenario(photoReporting);
  });
});
