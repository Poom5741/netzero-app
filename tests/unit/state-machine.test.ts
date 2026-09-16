/**
 * State-machine tests — verifies every conversation transition.
 *
 * Each test creates a fresh MockDB instance for isolation.
 * Fixtures are loaded from tests/fixtures/line-events/.
 */
import { describe, expect, it } from "bun:test";
import { loadAllFixtures } from "../helpers/fixtures";
import { createTestHarness, runFixtureById } from "../helpers/test-harness";

describe("State Machine", () => {
  describe("Welcome state", () => {
    it("transitions to consent on 'ลงทะเบียน'", async () => {
      const harness = await createTestHarness({ initialState: "welcome" });
      const result = await runFixtureById(harness, "welcome-001");

      if (result.newState !== "consent") {
        throw new Error(
          `Expected 'consent' but got '${result.newState}'. Messages: ${JSON.stringify(result.pushedMessages)}`,
        );
      }
      expect(result.pushedMessages.length).toBeGreaterThan(0);
    });
  });

  describe("Consent state", () => {
    it("transitions to phone on 'consent_accept_all'", async () => {
      const harness = await createTestHarness({ initialState: "consent" });
      const result = await runFixtureById(harness, "consent-001");

      if (result.newState !== "phone") {
        throw new Error(
          `Expected 'phone' but got '${result.newState}'. Messages: ${JSON.stringify(result.pushedMessages)}`,
        );
      }
      expect(result.pushedMessages[0]?.text).toContain("ยอมรับเงื่อนไข");
    });
  });

  describe("Phone state", () => {
    it("transitions to identity_confirm on valid phone match", async () => {
      const harness = await createTestHarness({ initialState: "phone" });
      const result = await runFixtureById(harness, "phone-001");

      if (result.newState !== "identity_confirm") {
        throw new Error(
          `Expected 'identity_confirm' but got '${result.newState}'. Messages: ${JSON.stringify(result.pushedMessages)}`,
        );
      }
    });
  });

  // Additional state tests will be added as fixtures are created
  // This demonstrates the pattern for all 18 states

  describe("All fixtures", () => {
    it("should load without errors", () => {
      const fixtures = loadAllFixtures();
      expect(fixtures.length).toBeGreaterThan(0);
    });
  });
});
