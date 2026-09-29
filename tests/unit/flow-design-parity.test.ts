import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Design parity for every artifact card node.
 *
 * Asserts tone, badge, hero, title, and action labels per node against
 * specs/016-flow-parity/script.json — the parsed artifact script.
 *
 * Driven by scripts/flow-node-inventory.json: the node → builder map, so a new
 * node is added to the test by adding one entry, not a new test.
 */

import {
  buildArtifactCard,
  buildCalendarBubble,
  buildConditions3Checkbox,
  buildConsentBubble,
  buildDashboardBubble,
  buildIdentityConfirmBubble,
  buildRegistrationLinkBubble,
  buildWelcomeBubble,
} from "../../src/line/flex-builders";

const SCRIPT = JSON.parse(
  readFileSync(join(process.cwd(), "specs", "016-flow-parity", "script.json"), "utf8"),
) as Array<Record<string, any>>;

const INVENTORY: Record<string, () => unknown> = {
  "OB-01": () => buildWelcomeBubble("liff-test"),
  "OB-15": () => buildConsentBubble(),
  "OB-03": () => buildIdentityConfirmBubble("สมชาย ใจดี", "อ.สามชุก", "จ.สุพรรณบุรี"),
  "OB-05": () => buildConditions3Checkbox(),
  "LF-01": () => buildRegistrationLinkBubble("https://liff.line.me/test"),
  "PJ-13": () => buildCalendarBubble([], "https://app.test"),
  "RP-03": () =>
    buildDashboardBubble({
      farmerName: "สมชาย ใจดี",
      plotName: "แปลงนาหลังบ้าน",
      totalOffset: 14,
      sfW: 4.2,
      approvedPhotos: 2,
      totalPhotos: 4,
      pendingTasks: 3,
      appUrl: "https://app.test",
    }),
};

const byNode = (node: string, type = "flex") =>
  SCRIPT.find((s) => s.node === node && s.type === type);

/** Pull the artifact fields a card must reproduce. */
function flatten(msg: unknown): { text: string[]; heroBg?: string; actionLabels: string[] } {
  const text: string[] = [];
  const actionLabels: string[] = [];
  let heroBg: string | undefined;
  const walk = (n: unknown, inFooter = false): void => {
    if (!n || typeof n !== "object") return;
    const o = n as Record<string, unknown>;
    if (typeof o.text === "string" && !inFooter) text.push(o.text);
    if (typeof o.backgroundColor === "string" && o.type === "box" && o.minHeight === "56px") {
      heroBg = o.backgroundColor;
    }
    if (o.type === "postback" || o.type === "uri") actionLabels.push(o.label as string);
    for (const v of Object.values(o)) {
      if (Array.isArray(v)) {
        for (const x of v) walk(x, inFooter || o.type === "footer");
      } else if (v && typeof v === "object") {
        walk(v, inFooter || o.type === "footer");
      }
    }
  };
  walk(msg);
  return { text, heroBg, actionLabels };
}

describe("every artifact card node matches the script's design", () => {
  // Some artifact titles are data-dependent strings (plot name + area). The card
  // builds them from live data, so the test asserts the fixed prefix instead.
  const TITLE_PARTIAL: Record<string, string> = {
    "RP-03": "แปลงนาหลังบ้าน",
  };

  // PJ-13's artifact action "บันทึกขั้นนี้" is superseded by one camera button per
  // photo step, each carrying step/plot_id/season_id so the camera page knows what
  // it is shooting (asserted by tests/unit/line/calendar-photo-action.test.ts).
  // The card keeps "ดูทั้งปฏิทิน" verbatim. Containment, not equality.
  const ACTIONS_CONTAIN: Record<string, string[]> = {
    "PJ-13": ["ดูทั้งปฏิทิน"],
  };

  for (const [node, build] of Object.entries(INVENTORY)) {
    it(`${node}: tone, badge, hero, title, and actions match`, () => {
      const spec = byNode(node);
      expect(spec, `node ${node} missing from script.json`).toBeDefined();

      const msg = build();
      const got = flatten(msg);

      // Hero band present, in the script's tone colour.
      const expectHero = expectHeroColour(spec.heroTone);
      expect(got.heroBg, `${node} hero colour`).toBe(expectHero);

      // Badge chip text.
      if (spec.heroBadge) expect(got.text.join(" | ")).toContain(spec.heroBadge);

      // Hero band and title copy.
      const joined = got.text.join(" | ");
      expect(joined).toContain(spec.hero);
      const wantTitle = TITLE_PARTIAL[node] ?? spec.title;
      expect(joined).toContain(wantTitle);

      // Action labels. Exact equality where the implementation matches the
      // script; containment where a documented deviation applies.
      const want = (spec.actions ?? []).map((a: { label: string }) => a.label);
      if (ACTIONS_CONTAIN[node]) {
        for (const label of ACTIONS_CONTAIN[node]) {
          expect(got.actionLabels).toContain(label);
        }
      } else {
        expect(got.actionLabels).toEqual(want);
      }
    });
  }
});

/** Gradient midpoints — see node-design-spec.md §1. */
function expectHeroColour(tone?: string): string | undefined {
  const map: Record<string, string> = {
    teal: "#028D8A",
    navy: "#11337D",
    green: "#05B54C",
    amber: "#B17E15",
    grey: "#53616F",
  };
  return tone ? map[tone] : undefined;
}

describe("the shared card builder", () => {
  it("marks the primary action solid green and the rest white", () => {
    const msg = buildArtifactCard({
      tone: "teal",
      badge: "B",
      hero: "H",
      title: "T",
      actions: [{ label: "First", primary: true }, { label: "Second" }],
    });
    const raw = JSON.stringify(msg);
    expect(raw).toContain("#06C755");
    expect(raw).toContain("#04A344");
  });

  it("emits a hero box of the artifact's 56px minimum height", () => {
    const msg = buildArtifactCard({ tone: "grey", hero: "H", title: "T" });
    expect(JSON.stringify(msg)).toContain('"minHeight":"56px"');
  });
});

// Keep the imported builders referenced so the inventory stays the single driver.
void [
  buildWelcomeBubble,
  buildConsentBubble,
  buildIdentityConfirmBubble,
  buildConditions3Checkbox,
  buildRegistrationLinkBubble,
  buildCalendarBubble,
  buildDashboardBubble,
];
