import { describe, expect, it } from "vitest";

/**
 * LINE Flex Message schema guard (hotfix 017).
 *
 * LINE's Messaging API validates outgoing Flex payloads strictly and rejects
 * the WHOLE push with HTTP 400 on any unknown field or malformed value
 * (found live 2026-09-29: `/hero/color` → every redesigned card failed to
 * send, the farmer saw silence).
 *
 * These assertions encode the LINE Flex field rules the builders must obey:
 *   1. `color` is a TEXT-component field — boxes carry `backgroundColor`.
 *   2. Padding/margin/size props take ONE value (no CSS shorthand "9px 4px").
 *   3. Colours are `#RGB/#RGBA/#RRGGBB/#RRGGBBAA` or `rgba(r,g,b,a)`.
 *   4. Every flex message carries a non-empty `altText`.
 *
 * Driven by the same node inventory as flow-design-parity.test.ts so every
 * card the bot can emit is covered by adding it to INVENTORY.
 */

import {
  buildActivationBubble,
  buildCalendarBubble,
  buildConditions3Checkbox,
  buildConfirmBeforeSendBubble,
  buildConsentBubble,
  buildDashboardBubble,
  buildDocumentsPromptBubble,
  buildIdentityConfirmBubble,
  buildPendingReviewBubble,
  buildPhotoAcceptedBubble,
  buildPhotoReminderBubble,
  buildRegistrationLinkBubble,
  buildTodoBubble,
  buildWelcomeBubble,
} from "../../src/line/flex-builders";

type AnyRec = Record<string, unknown>;

const INVENTORY: Array<[string, () => unknown]> = [
  ["OB-01", () => buildWelcomeBubble("https://liff.line.me/test")],
  ["OB-15", () => buildConsentBubble()],
  ["OB-03", () => buildIdentityConfirmBubble("สมชาย ใจดี", "อ.สามชุก", "จ.สุพรรณบุรี")],
  ["OB-05", () => buildConditions3Checkbox()],
  ["LF-01", () => buildRegistrationLinkBubble("https://liff.line.me/test")],
  ["PJ-13", () => buildCalendarBubble([], "https://app.test")],
  [
    "RP-03",
    () =>
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
  ],
  ["OB-13", () => buildDocumentsPromptBubble("https://liff.line.me/test")],
  ["OB-10", () => buildPendingReviewBubble("https://app.test")],
  ["OB-11", () => buildActivationBubble("SPB-0142")],
  [
    "PJ-02",
    () =>
      buildPhotoReminderBubble({
        round: 1,
        photoType: "WET-1",
        stepCode: "SG-04",
        plotName: "แปลงนาหลังบ้าน",
        dueDate: "28 ก.ค. 2569",
        cameraUrl: "https://liff.line.me/test",
      }),
  ],
  [
    "PJ-06",
    () =>
      buildConfirmBeforeSendBubble({
        plotName: "แปลงนาหลังบ้าน",
        photoType: "DRY-1",
        stepCode: "SG-05",
        waterDepthCm: 10,
        retakeUrl: "https://liff.line.me/test",
      }),
  ],
  [
    "PJ-08",
    () =>
      buildPhotoAcceptedBubble({
        photoType: "DRY-1",
        round: 1,
        acceptedCount: 2,
        summaryUrl: "https://liff.line.me/test",
      }),
  ],
  [
    "RP-01",
    () =>
      buildTodoBubble({
        pendingPhotos: 3,
        retakePhotos: 0,
        backfillSeasons: 0,
        backfillUrl: "https://liff.line.me/test",
      }),
  ],
];

const SINGLE_VALUE_PROPS = [
  "paddingAll",
  "paddingTop",
  "paddingBottom",
  "paddingLeft",
  "paddingRight",
  "paddingStart",
  "paddingEnd",
  "paddingHorizontal",
  "paddingVertical",
  "margin",
  "spacing",
  "cornerRadius",
  "borderWidth",
  "width",
  "maxWidth",
  "height",
  "minHeight",
  "maxHeight",
  "offsetTop",
  "offsetBottom",
  "offsetLeft",
  "offsetRight",
  "offsetStart",
  "offsetEnd",
];

const COLOR_RE =
  /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$|^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(?:,\s*(?:0|1|0?\.\d+)\s*)?\)$/i;

function walk(node: unknown, path: string, errs: string[]): void {
  if (node === null || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach((n, i) => {
      walk(n, `${path}[${i}]`, errs);
    });
    return;
  }
  const rec = node as AnyRec;

  if (rec.type === "box" && "color" in rec) {
    errs.push(`${path}.color — box has no "color" field (use backgroundColor)`);
  }
  for (const prop of SINGLE_VALUE_PROPS) {
    const v = rec[prop];
    if (typeof v === "string" && v.trim().length > 0 && /\s/.test(v.trim())) {
      errs.push(`${path}.${prop}="${v}" — CSS shorthand not allowed (single value only)`);
    }
  }
  for (const [k, v] of Object.entries(rec)) {
    if (/color$/i.test(k) && typeof v === "string" && !COLOR_RE.test(v.trim())) {
      errs.push(`${path}.${k}="${v}" — not a LINE colour format`);
    }
    walk(v, `${path}.${k}`, errs);
  }
}

describe("LINE Flex schema guard — every emittable card must be LINE-valid", () => {
  const built = INVENTORY.map(([node, build]) => {
    let msg: unknown;
    try {
      msg = build();
    } catch (err) {
      throw new Error(`builder for ${node} threw: ${(err as Error).message}`);
    }
    return [node, msg] as const;
  });

  it.each(built)("%s — passes the LINE Flex field rules", (_node, msg) => {
    const errs: string[] = [];
    const m = msg as AnyRec;
    if (m.type === "flex") {
      if (typeof m.altText !== "string" || m.altText.length === 0) {
        errs.push("altText missing/empty — LINE requires it");
      }
      walk(m.contents, "contents", errs);
    } else {
      errs.push(`unexpected top-level type "${String(m.type)}"`);
    }
    expect(errs, errs.join("\n")).toEqual([]);
  });
});
