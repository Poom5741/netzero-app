/**
 * Farmer registration scenario test.
 *
 * Runs the complete farmer registration flow from welcome to pending_review.
 */

import { describe, expect, it } from "bun:test";
import { runConversationScenario } from "../helpers/conversation-runner";
import { farmerRegistration } from "./farmer-registration";

describe("farmer registration scenario", () => {
  it("completes full registration flow", async () => {
    const result = await runConversationScenario(farmerRegistration);
    expect(result.steps).toBe(7);
    expect(result.finalState).toBe("pending_review");
  });
});
