import { describe, it } from "bun:test";
import { runConversationScenario } from "../helpers/conversation-runner";
import { seasonSetup } from "./season-setup";

describe("season-setup scenario", () => {
  it("completes season setup flow", async () => {
    await runConversationScenario(seasonSetup);
  });
});
