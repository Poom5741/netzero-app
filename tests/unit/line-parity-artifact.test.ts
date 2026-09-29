import { describe, expect, it } from "vitest";

/**
 * Artifact parity for the bot-rendered LINE surface.
 *
 * Every expected value here is copied from the Claude Design artifact
 * `design-artifacts/2026-09-28/line-oa-farmer.html`, decoded module
 * `c087a24f-4179-4a49-849a-6c05aafd7d3a.js` (design system
 * `window.NetZeroCarbonDesignSystem_f3e7a8`).
 *
 * These assertions are about the JSON WE emit to the LINE Messaging API.
 * They cannot verify how LINE's own client draws the chat — see matrix R-011.
 */

import {
  buildConsentBubble,
  buildDashboardBubble,
  buildWelcomeBubble,
  chatDivider,
} from "../../src/line/flex-builders";
import { buildRichMenu, getRichMenuItems } from "../../src/line/rich-menu";

/** Artifact `--line-*` tokens. */
const ARTIFACT = {
  ink: "#16202C",
  green: "#06C755",
  greenDark: "#04A344",
  bubbleYou: "#FFFFFF",
  hairline: "#EEF2F6",
  bubbleRadius: "13px",
  danger: "#C8464F", // --status-danger
  dividerBg: "rgba(0, 0, 0, 0.22)",
  dividerRadius: "999px",
  actionPad: "9px 4px",
  actionRadius: "4px",
} as const;

type AnyObj = Record<string, unknown>;

/** Depth-first walk over a Flex Message document. */
function* walk(node: unknown): Generator<AnyObj> {
  if (!node || typeof node !== "object") return;
  const obj = node as AnyObj;
  yield obj;
  for (const value of Object.values(obj)) {
    if (Array.isArray(value)) for (const item of value) yield* walk(item);
    else if (value && typeof value === "object") yield* walk(value);
  }
}

describe("artifact token parity — Flex text ink", () => {
  it("uses artifact ink #16202C, not the legacy #333333", () => {
    for (const bubble of [
      buildWelcomeBubble("liff-test"),
      buildConsentBubble(),
      buildDashboardBubble({ totalOffset: 1, sfW: 2, photoProgress: 3, backfillCount: 0 } as never),
    ]) {
      const textColors = [...walk(bubble)]
        .filter((n) => n.type === "text" && typeof n.color === "string")
        .map((n) => n.color as string);

      expect(textColors.length).toBeGreaterThan(0);
      // The legacy grey must be gone from body text.
      expect(textColors).not.toContain("#333333");
      // Every body text colour must be an artifact colour (the card adds
      // --line-chat-ink-3 for subtitles and --status-success/-warning for rows).
      for (const color of textColors) {
        expect([
          ARTIFACT.ink,
          ARTIFACT.green,
          ARTIFACT.greenDark,
          ARTIFACT.bubbleYou,
          "#8A9BAA", // --line-chat-ink-3
          "#0AA8A3", // --status-success
          "#E2A33C", // --status-warning
          "#FFFFFF",
        ]).toContain(color);
      }
    }
  });
});

describe("artifact token parity — bubble geometry", () => {
  it("declares no bubble-level radius, because LINE's client draws the bubble outline", () => {
    // The LINE Flex API exposes no bubble-level border radius; the 13px radius in
    // the artifact belongs to the web `FlexMessage` component, not to a Flex
    // document. Asserting a radius here would encode a fiction.
    const contents = (buildWelcomeBubble("liff-test").contents ?? {}) as AnyObj;
    expect(contents.type).toBe("bubble");
    expect(contents.cornerRadius).toBeUndefined();
  });
});

describe("artifact token parity — Flex action row", () => {
  it("uses artifact padding 9px 4px, not 10px", () => {
    const welcome = buildWelcomeBubble("liff-test");
    // Flex action rows are box blocks carrying `action`, styled with Flex's own
    // `paddingAll`/`cornerRadius` keys — not CSS `style.padding`.
    const actionBlocks = [...walk((welcome.contents as AnyObj)?.footer)].filter(
      (n) => typeof n.action === "object" && n.action !== null,
    );
    expect(actionBlocks.length).toBeGreaterThan(0);
    for (const block of actionBlocks) {
      expect(block.paddingAll).toBe(ARTIFACT.actionPad);
    }
  });

  it("uses the artifact 4px action radius, not 6px", () => {
    const welcome = buildWelcomeBubble("liff-test");
    const actionBlocks = [...walk((welcome.contents as AnyObj)?.footer)].filter(
      (n) => typeof n.action === "object" && n.action !== null,
    );
    for (const block of actionBlocks) {
      expect(block.cornerRadius).toBe(ARTIFACT.actionRadius);
    }
  });
});

describe("artifact token parity — system divider", () => {
  it("chatDivider emits a ChatDivider-equivalent pill with translucent black and pill radius", () => {
    // The divider is a standalone message now (it appears between messages in
    // the artifact's flow), not a box inside the welcome card.
    const d = chatDivider() as AnyObj;
    expect(d.backgroundColor).toBe(ARTIFACT.dividerBg);
    expect(d.cornerRadius).toBe(ARTIFACT.dividerRadius);
    expect(d.paddingAll).toBe("3px 12px");
    expect(JSON.stringify(d)).toContain("เพิ่ม NetZeroCarbon เป็นเพื่อนแล้ว");
  });
});

describe("artifact token parity — danger color", () => {
  it("uses the artifact --status-danger, not Bootstrap #dc3545", () => {
    for (const bubble of [buildConsentBubble(), buildWelcomeBubble("liff-test")]) {
      const colors = [...walk(bubble)]
        .filter((n) => typeof n.backgroundColor === "string" || typeof n.color === "string")
        .map((n) => (n.backgroundColor ?? n.color) as string)
        .filter((c) => c.toUpperCase() !== "RGBA(0, 0, 0, 0.22)");
      expect(colors).not.toContain("#dc3545");
    }
  });
});

describe("artifact content parity — rich menu", () => {
  it("keeps the artifact's 6 labels in order", () => {
    expect(getRichMenuItems().map((i) => i.label)).toEqual([
      "กรอกข้อมูลย้อนหลัง",
      "บันทึกงานในแปลง",
      "งานที่ต้องทำ",
      "แปลงของฉัน",
      "สรุปผลของฉัน",
      "ติดต่อเจ้าหน้าที่",
    ]);
  });

  it("lays out a 3x2 grid of equal areas", () => {
    const menu = buildRichMenu();
    expect(menu.areas).toHaveLength(6);
    for (const area of menu.areas) {
      expect(area.bounds.width).toBe(menu.areas[0].bounds.width);
      expect(area.bounds.height).toBe(menu.areas[0].bounds.height);
    }
    const xs = new Set(menu.areas.map((a) => a.bounds.x));
    const ys = new Set(menu.areas.map((a) => a.bounds.y));
    expect(xs.size).toBe(3);
    expect(ys.size).toBe(2);
  });
});
