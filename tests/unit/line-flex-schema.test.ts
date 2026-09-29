import { describe, expect, it } from "vitest";

/**
 * LINE Flex Message schema guard (BUG-017-B1).
 *
 * LINE's Messaging API validates outgoing Flex payloads strictly and rejects
 * the WHOLE push with HTTP 400 on any unknown field (found live 2026-09-29:
 * /hero/color, /hero/minHeight, /hero/contents/0/minHeight — every redesigned
 * card failed to send; farmers saw silence).
 *
 * Whitelists below are copied from LINE's official OpenAPI schema
 * (github.com/line/line-openapi · messaging-api.yml · components/schemas/
 * FlexBox, FlexText, FlexButton, FlexSeparator, FlexImage, FlexIcon,
 * FlexSpan, FlexFiller, FlexVideo). Notably:
 *   - boxes have NO `color` (text-only field) and NO `minHeight`/`minWidth`
 *   - padding is paddingAll/Top/Bottom/Start/End — no CSS shorthand and no
 *     Horizontal/Vertical variants
 *   - colour strings must be hex (LINE rejects rgba() with spaces, live:
 *     "invalid property" /hero/contents/0/contents/0/backgroundColor)
 *   - the bubble HERO slot accepts a box but LINE still rejects styling props
 *     on it and its direct children, so styling must sit on an inner band box.
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

// --- LINE OpenAPI component whitelists (see file header) --------------------

const OFFSET = ["offsetTop", "offsetBottom", "offsetStart", "offsetEnd"];

const FLEX_KEYS: Record<string, Set<string>> = {
  box: new Set([
    "layout",
    "flex",
    "contents",
    "spacing",
    "margin",
    "position",
    ...OFFSET,
    "backgroundColor",
    "borderColor",
    "borderWidth",
    "cornerRadius",
    "width",
    "maxWidth",
    "height",
    "maxHeight",
    "paddingAll",
    "paddingTop",
    "paddingBottom",
    "paddingStart",
    "paddingEnd",
    "action",
    "justifyContent",
    "alignItems",
    "background",
  ]),
  text: new Set([
    "text",
    "action",
    "flex",
    "margin",
    "position",
    ...OFFSET,
    "gravity",
    "align",
    "adjustMode",
    "color",
    "contents",
    "decoration",
    "lineSpacing",
    "maxLines",
    "scaling",
    "size",
    "style",
    "weight",
    "wrap",
  ]),
  button: new Set([
    "action",
    "style",
    "color",
    "height",
    "flex",
    "margin",
    "position",
    ...OFFSET,
    "gravity",
    "adjustMode",
    "scaling",
  ]),
  separator: new Set(["margin", "color"]),
  image: new Set([
    "url",
    "action",
    "align",
    "animated",
    "aspectMode",
    "aspectRatio",
    "backgroundColor",
    "flex",
    "gravity",
    "margin",
    "position",
    ...OFFSET,
    "scaling",
    "size",
  ]),
  icon: new Set(["url", "aspectRatio", "margin", "position", ...OFFSET, "scaling", "size"]),
  span: new Set(["text", "color", "decoration", "size", "style", "weight"]),
  filler: new Set(["flex"]),
  video: new Set(["url", "previewUrl", "altContent", "aspectRatio", "action"]),
};

// Value props that must carry a SINGLE value (no CSS shorthand "9px 4px").
const SINGLE_VALUE_PROPS = new Set([
  "paddingAll",
  "paddingTop",
  "paddingBottom",
  "paddingStart",
  "paddingEnd",
  "margin",
  "spacing",
  "cornerRadius",
  "borderWidth",
  "width",
  "maxWidth",
  "height",
  "maxHeight",
  ...OFFSET,
]);

const COLOR_RE = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

// The bubble hero slot: LINE rejects styling properties here (live-verified).
const HERO_SLOT_ALLOWED = new Set([
  "type",
  "layout",
  "contents",
  "flex",
  "margin",
  "position",
  ...OFFSET,
]);

function walk(node: unknown, path: string, errs: string[]): void {
  if (node === null || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach((n, i) => {
      walk(n, `${path}[${i}]`, errs);
    });
    return;
  }
  const rec = node as AnyRec;
  const type = typeof rec.type === "string" ? rec.type : undefined;

  if (type && FLEX_KEYS[type]) {
    const allowed = FLEX_KEYS[type];
    const unknown = Object.keys(rec).filter((k) => k !== "type" && !allowed.has(k));
    if (unknown.length > 0) {
      errs.push(`${path} (${type}) unknown fields: ${unknown.join(", ")}`);
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
    }
  }
  for (const [k, v] of Object.entries(rec)) {
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

  it.each(built)("%s — hero slot carries no styling properties", (_node, msg) => {
    const bubble = (msg as AnyRec).contents as AnyRec;
    const hero = bubble.hero as AnyRec | undefined;
    if (!hero) return;
    const illegal = Object.keys(hero).filter((k) => !HERO_SLOT_ALLOWED.has(k));
    expect(illegal, `hero slot has non-whitelisted keys: ${illegal.join(", ")}`).toEqual([]);
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
