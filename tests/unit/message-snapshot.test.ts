/**
 * Message snapshot tests — verifies Flex Message builders produce deterministic JSON.
 *
 * Each builder is called with fixture data and compared against golden JSON snapshots.
 * Snapshots capture labels, actions, postbacks, URLs, alt text, and structure.
 */
import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildCalendarBubble,
  buildConditions3Checkbox,
  buildConditionsBubble,
  buildConsent4Checkbox,
  buildConsentBubble,
  buildDashboardBubble,
  buildIdentityConfirmBubble,
  buildRegistrationLinkBubble,
  buildWelcomeBubble,
} from "../../src/line/flex-builders";
import { buildRichMenu } from "../../src/line/rich-menu";

const SNAPSHOTS_DIR = join(process.cwd(), "tests", "fixtures", "message-snapshots");
const UPDATE_SNAPSHOTS = process.argv.includes("--update") || process.env.UPDATE_SNAPSHOTS === "1";

/**
 * Compare a message to its golden snapshot, or update if --update flag is passed.
 */
function assertSnapshot(name: string, actual: unknown): void {
  const filePath = join(SNAPSHOTS_DIR, `${name}.json`);

  if (UPDATE_SNAPSHOTS) {
    writeFileSync(filePath, JSON.stringify(actual, null, 2), "utf-8");
    return;
  }

  if (!existsSync(filePath)) {
    throw new Error(`Snapshot ${name}.json not found. Run with --update to generate.`);
  }

  const expected = JSON.parse(readFileSync(filePath, "utf-8"));
  expect(actual).toEqual(expected);
}

describe("Message Snapshots", () => {
  describe("Flex Message builders", () => {
    it("buildWelcomeBubble matches snapshot", () => {
      const msg = buildWelcomeBubble("test-liff-id-123");
      assertSnapshot("welcome-bubble", msg);
    });

    it("buildConsentBubble matches snapshot", () => {
      const msg = buildConsentBubble();
      assertSnapshot("consent-bubble", msg);
    });

    it("buildIdentityConfirmBubble matches snapshot", () => {
      const msg = buildIdentityConfirmBubble("สมชาย ใจดี", "เมือง", "เชียงใหม่");
      assertSnapshot("identity-confirm-bubble", msg);
    });

    it("buildConditionsBubble matches snapshot", () => {
      const msg = buildConditionsBubble();
      assertSnapshot("conditions-bubble", msg);
    });

    it("buildRegistrationLinkBubble matches snapshot", () => {
      const msg = buildRegistrationLinkBubble("https://liff.line.me/test-liff-id");
      assertSnapshot("registration-link-bubble", msg);
    });

    it("buildCalendarBubble matches snapshot", () => {
      const steps = [
        {
          stepCode: "SG-01",
          stepName: "เตรียมแปลง",
          dueDay: 0,
          status: "completed",
          requiresPhoto: false,
        },
        {
          stepCode: "SG-02",
          stepName: "หว่านข้าว",
          dueDay: 0,
          status: "completed",
          requiresPhoto: false,
        },
        {
          stepCode: "SG-03",
          stepName: "ใส่ปุ๋ยครั้งที่ 1",
          dueDay: 14,
          status: "pending",
          requiresPhoto: false,
        },
        {
          stepCode: "SG-04",
          stepName: "WET-1",
          dueDay: 30,
          status: "pending",
          requiresPhoto: true,
        },
      ];
      const msg = buildCalendarBubble(steps, "test-liff-id", "plot-001", "season-001");
      assertSnapshot("calendar-bubble", msg);
    });

    it("buildConsent4Checkbox matches snapshot", () => {
      const msg = buildConsent4Checkbox();
      assertSnapshot("consent-4-checkbox", msg);
    });

    it("buildConditions3Checkbox matches snapshot", () => {
      const msg = buildConditions3Checkbox();
      assertSnapshot("conditions-3-checkbox", msg);
    });

    it("buildDashboardBubble matches snapshot", () => {
      const msg = buildDashboardBubble({
        farmerName: "สมชาย ใจดี",
        plotName: "แปลงนา A",
        totalOffset: 9.42,
        sfW: 0.55,
        approvedPhotos: 3,
        totalPhotos: 4,
        pendingTasks: 2,
      });
      assertSnapshot("dashboard-bubble", msg);
    });
  });

  describe("Rich Menu configuration", () => {
    it("buildRichMenu matches snapshot", () => {
      const menu = buildRichMenu();
      assertSnapshot("rich-menu", menu);
    });
  });
});
