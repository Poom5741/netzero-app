/**
 * LINE Flex Message bubble builders for the NetZeroCarbon chatbot.
 *
 * Each builder returns a `LineMessage` object compatible with the
 * type defined in `src/line/reply.ts`.
 *
 * Colors and geometry are ported from the Claude Design artifact
 * `design-artifacts/2026-09-28/line-oa-farmer.html` (artifact 19c446b9,
 * decoded module c087a24f-4179-4a49-849a-6c05aafd7d3a.js). The artifact is
 * the visual source of truth; do not substitute ad-hoc values.
 *
 * Note: the chat bubbles, header bar, and quick-reply chips are drawn by LINE's
 * own client. Only the documents emitted here are under our control.
 */

type LineMessage = {
  type: string;
  text?: string;
  altText?: string;
  contents?: unknown;
  quickReply?: unknown;
};

// ---------------------------------------------------------------------------
// Artifact tokens and geometry
// ---------------------------------------------------------------------------

const COLOR_PRIMARY = "#06C755"; // --line-green
const COLOR_PRIMARY_DARK = "#04A344"; // --line-green-dark
const COLOR_TEXT = "#16202C"; // --line-chat-ink
const COLOR_SUBTLE = "#888888";
const COLOR_ERROR = "#C8464F"; // --status-danger (replaces Bootstrap #dc3545)
const COLOR_BG = "#FFFFFF"; // --line-bubble-you

// Action rows only. The bubble's own 13px radius is drawn by LINE's client — the
// Flex API has no bubble-level radius, so it is deliberately not declared here.
const RADIUS_ACTION = "4px";
const PADDING_ACTION_V = "9px"; // action row: vertical padding
const PADDING_ACTION_H = "4px"; // action row: horizontal padding (Start/End)

// ---------------------------------------------------------------------------
// Artifact card (specs/016-flow-parity/node-design-spec.md §1)
// ---------------------------------------------------------------------------

/** Hero tones from the artifact. LINE Flex has no gradients, so each tone uses
 *  its gradient's midpoint — the closest expressible solid colour. */
export type HeroTone = "teal" | "navy" | "green" | "amber" | "grey";

const HERO_SOLID: Record<HeroTone, string> = {
  teal: "#028D8A", // 120deg #027276 -> #02A99E
  navy: "#11337D", // 120deg #061E5C -> #1C489F
  green: "#05B54C", // 120deg #04A344 -> #06C755
  amber: "#B17E15", // 120deg #8A5A10 -> #D9A21B
  grey: "#53616F", // 120deg #3B4753 -> #6B7B8C
};

const COLOR_INK_SUBTLE = "#8A9BAA"; // --line-chat-ink-3 approximation
const COLOR_BADGE_BG = "#00000057"; // rgba(0,0,0,.34) as hex8 — LINE rejects rgba() strings with spaces

export interface ArtifactAction {
  label: string;
  /** The primary action is solid LINE green; the rest are white with green text. */
  primary?: boolean;
  postback?: { type: string; data: string };
  uri?: string;
}

export interface ArtifactRow {
  label: string;
  value: string;
  tone?: "good" | "warn" | "neutral";
}

export interface ArtifactCard {
  tone: HeroTone;
  badge?: string;
  hero: string;
  title: string;
  subtitle?: string;
  body?: string;
  rows?: ArtifactRow[];
  actions?: ArtifactAction[];
}

/**
 * One artifact `FlexMessage` card: hero band with a status badge, title,
 * optional subtitle/rows/body, and an equal-width action row.
 *
 * Geometry and colours come from `components/line/FlexMessage.jsx` in the
 * artifact's design system (module c087a24f). Every node builder should go
 * through this so the cards cannot drift apart again.
 */
export function buildArtifactCard(card: ArtifactCard): LineMessage {
  // The bubble HERO slot accepts a RESTRICTED box — LINE rejects the whole push
  // on styling properties there (BUG-017-B1: /hero/color, /hero/minHeight).
  // The slot carries only the tone; all styling lives on this inner band box.
  // LINE Flex has no minHeight — the artifact's 56px hero band is approximated
  // with generous vertical padding (documented in BUG-017-B1).
  const heroBand: Record<string, unknown> = {
    type: "box",
    layout: "vertical",
    backgroundColor: HERO_SOLID[card.tone],
    paddingTop: "16px",
    paddingBottom: "16px",
    paddingStart: "12px",
    paddingEnd: "12px",
    justifyContent: "flex-end",
    contents: [
      {
        type: "text",
        text: card.hero,
        size: "xs",
        weight: "bold",
        color: COLOR_BG,
        wrap: true,
      },
    ],
  };
  if (card.badge) {
    // Wrap in a horizontal box: children of a vertical box stretch full width,
    // which made the badge a wide bar instead of the artifact's compact pill.
    heroBand.contents = [
      {
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            backgroundColor: COLOR_BADGE_BG,
            cornerRadius: "999px",
            paddingAll: "2px",
            paddingStart: "8px",
            paddingEnd: "8px",
            contents: [
              { type: "text", text: card.badge, size: "xs", weight: "bold", color: COLOR_BG },
            ],
          } as never,
        ],
      } as never,
      ...(heroBand.contents as unknown[]),
    ];
  }
  const hero: Record<string, unknown> = {
    type: "box",
    layout: "vertical",
    contents: [heroBand],
  };

  const bodyContents: unknown[] = [
    {
      type: "text",
      text: card.title,
      weight: "bold",
      size: "sm",
      color: COLOR_TEXT,
      wrap: true,
    },
  ];
  if (card.subtitle) {
    bodyContents.push({
      type: "text",
      text: card.subtitle,
      size: "xs",
      color: COLOR_INK_SUBTLE,
      wrap: true,
      margin: "sm",
    });
  }
  for (const row of card.rows ?? []) {
    const valueColor =
      row.tone === "good" ? "#0AA8A3" : row.tone === "warn" ? "#E2A33C" : COLOR_TEXT;
    bodyContents.push({
      type: "box",
      layout: "baseline",
      margin: "sm",
      contents: [
        { type: "text", text: row.label, size: "xs", color: COLOR_INK_SUBTLE, flex: 0 },
        {
          type: "text",
          text: row.value,
          size: "xs",
          weight: "bold",
          color: valueColor,
          align: "end",
        },
      ],
    });
  }
  if (card.body) {
    bodyContents.push({
      type: "text",
      text: card.body,
      size: "xs",
      color: COLOR_TEXT,
      wrap: true,
      margin: "md",
    });
  }

  const bubble: Record<string, unknown> = {
    type: "bubble",
    hero: hero as unknown,
    body: {
      type: "box",
      layout: "vertical",
      paddingAll: "11px",
      paddingStart: "12px",
      paddingEnd: "12px",
      contents: bodyContents,
    },
  };
  if (card.actions?.length) {
    bubble.footer = {
      type: "box",
      layout: "vertical",
      contents: card.actions.map((a) => ({
        type: "box",
        layout: "horizontal",
        paddingAll: PADDING_ACTION_V,
        paddingStart: PADDING_ACTION_H,
        paddingEnd: PADDING_ACTION_H,
        backgroundColor: a.primary ? COLOR_PRIMARY : COLOR_BG,
        cornerRadius: RADIUS_ACTION,
        contents: [
          {
            type: "text",
            text: a.label,
            size: "xs",
            weight: "bold",
            color: a.primary ? COLOR_BG : COLOR_PRIMARY_DARK,
            align: "center",
            gravity: "center",
          },
        ],
        action: a.uri
          ? { type: "uri", label: a.label, uri: a.uri }
          : { type: "postback", label: a.label, data: a.postback?.data ?? `action=${a.label}` },
      })),
    };
  }

  return {
    type: "flex",
    altText: card.title,
    contents: bubble,
  };
}

/**
 * System divider — artifact `ChatDivider`: a centred translucent-black pill
 * carrying the "added as friend" label.
 */
export function chatDivider(text = "เพิ่ม NetZeroCarbon เป็นเพื่อนแล้ว") {
  return {
    type: "box",
    layout: "vertical",
    paddingAll: "3px",
    paddingStart: "12px",
    paddingEnd: "12px",
    backgroundColor: "#00000038", // rgba(0,0,0,.22) as hex8
    cornerRadius: "999px",
    contents: [
      { type: "text", text, size: "xs", color: COLOR_BG, align: "center", weight: "regular" },
    ],
  } as const;
}

// ---------------------------------------------------------------------------
// 1. buildWelcomeBubble
// ---------------------------------------------------------------------------

/**
 * Build the welcome Flex Message bubble sent after a user adds the bot as a friend.
 * Includes a deep-link button to start the registration flow via LIFF.
 *
 * @param liffId - The LIFF app ID used to construct the registration deep-link.
 * @returns A `LineMessage` with type "flex".
 */
export function buildWelcomeBubble(liffId: string): LineMessage {
  // OB-01 — artifact card: teal hero, welcome badge, single primary action.
  return buildArtifactCard({
    tone: "teal",
    badge: "ยินดีต้อนรับ",
    hero: "โครงการทำนาลดโลกร้อน (เปียกสลับแห้ง)",
    title: "สวัสดีครับ 🌾 นี่คือ LINE ของ NetZeroCarbon",
    body: "ใช้ส่งภาพและกรอกข้อมูลแปลงนา เพื่อคิดคาร์บอนเครดิตให้พี่น้องเกษตรกรครับ\nใช้เวลาตอนสมัครประมาณ 10 นาที หลังจากนั้นเดือนละไม่กี่ครั้ง",
    actions: [
      {
        label: "ผูกบัญชีของฉัน",
        primary: true,
        postback: {
          type: "postback",
          data: `action=start_registration&liffId=${liffId}`.slice(0, 300),
        },
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// 2. buildConsentBubble
// ---------------------------------------------------------------------------

/**
 * Build the PDPA consent Flex Message bubble.
 * Shows data collection details, purpose, and right to withdraw.
 * Provides accept / reject buttons via postback actions.
 *
 * @returns A `LineMessage` with type "flex".
 */
export function buildConsentBubble(): LineMessage {
  // OB-15 — artifact card: navy hero, PDPA badge, read + consent actions.
  return buildArtifactCard({
    tone: "navy",
    badge: "CS-01 · PDPA",
    hero: "ความยินยอมเก็บและใช้ข้อมูลส่วนบุคคล",
    title: "ก่อนจะถามอะไรต่อ ขออนุญาตเรื่องข้อมูลส่วนตัวก่อนนะครับ",
    actions: [
      { label: "อ่านข้อความเต็ม" },
      {
        label: "ยินยอม",
        primary: true,
        postback: { type: "postback", data: "action=consent_accept_all" },
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// 3. buildIdentityConfirmBubble
// ---------------------------------------------------------------------------

/**
 * Build the identity-match confirmation Flex Message bubble.
 * Shows the matched farmer name and location, asks user to confirm.
 *
 * @param farmerName - Full name of the matched farmer.
 * @param district   - District name (amphoe).
 * @param province   - Province name (changwat).
 * @returns A `LineMessage` with type "flex".
 */
export function buildIdentityConfirmBubble(
  farmerName: string,
  district: string,
  province: string,
): LineMessage {
  // OB-03 — artifact card: teal hero, identity badge, name + location rows.
  return buildArtifactCard({
    tone: "teal",
    badge: "ยืนยันตัวตน",
    hero: "พบเบอร์นี้ในทะเบียนแล้ว",
    title: farmerName,
    subtitle: [district, province].filter(Boolean).join(" "),
    body: "ใช่ท่านหรือไม่ครับ",
    actions: [
      { label: "ไม่ใช่", postback: { type: "postback", data: "action=identity_reject" } },
      {
        label: "ใช่ ผมเอง",
        primary: true,
        postback: { type: "postback", data: "action=identity_confirm" },
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// 4. buildConditionsBubble
// ---------------------------------------------------------------------------

/**
 * Build the OB-05 project conditions Flex Message bubble.
 * Lists the 3 conditions and provides accept / reject buttons.
 *
 * @returns A `LineMessage` with type "flex".
 */
export function buildConditionsBubble(): LineMessage {
  return {
    type: "flex",
    altText: "เงื่อนไขโครงการ",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: "เงื่อนไขโครงการ", weight: "bold", size: "lg", color: COLOR_TEXT },
          { type: "separator", margin: "md" },
          {
            type: "text",
            text: [
              "1. ส่งภาพหลักฐานตามปฏิทิน 4 รอบต่อครอป",
              "2. ให้ข้อมูลแปลงนาตามจริง",
              "3. ยินยอมให้ตรวจสอบแปลง",
            ].join("\n"),
            size: "sm",
            color: COLOR_TEXT,
            wrap: true,
            margin: "md",
          },
        ],
      },
      footer: {
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "✅ ยอมรับ",
                size: "sm",
                color: COLOR_BG,
                align: "center",
                weight: "bold",
              },
            ],
            paddingAll: PADDING_ACTION_V,
            paddingStart: PADDING_ACTION_H,
            paddingEnd: PADDING_ACTION_H,
            backgroundColor: COLOR_PRIMARY,
            cornerRadius: RADIUS_ACTION,
            flex: 1,
            margin: "md",
            action: {
              type: "postback",
              label: "✅ ยอมรับ",
              data: "action=conditions_accept",
            },
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "❌ ไม่ยอมรับ",
                size: "sm",
                color: COLOR_BG,
                align: "center",
                weight: "bold",
              },
            ],
            paddingAll: PADDING_ACTION_V,
            paddingStart: PADDING_ACTION_H,
            paddingEnd: PADDING_ACTION_H,
            backgroundColor: COLOR_ERROR,
            cornerRadius: RADIUS_ACTION,
            flex: 1,
            margin: "md",
            action: {
              type: "postback",
              label: "❌ ไม่ยอมรับ",
              data: "action=conditions_reject",
            },
          },
        ],
      },
    },
  };
}

// ---------------------------------------------------------------------------
// 5. buildRegistrationLinkBubble
// ---------------------------------------------------------------------------

/**
 * Build the LIFF deep-link registration form Flex Message bubble.
 * Opens the LIFF registration page in LINE's in-app browser.
 *
 * @param liffUrl - Base LIFF URL (e.g. "https://liff.line.me/{liffId}").
 * @returns A `LineMessage` with type "flex".
 */
export function buildRegistrationLinkBubble(liffUrl: string): LineMessage {
  // LF-01 — artifact card: teal hero, step badge, opens the registration form.
  return buildArtifactCard({
    tone: "teal",
    badge: "1 จาก 2",
    hero: "ข้อมูลของท่านและทะเบียนโฉนด",
    title: "ฟอร์มสมัครเข้าร่วมโครงการ",
    subtitle: "ใช้เวลาประมาณ 5 นาทีต่อโฉนด 1 ใบ",
    actions: [{ label: "กรอกข้อมูล", primary: true, uri: liffUrl }],
  });
}

// ---------------------------------------------------------------------------
// 6. buildCalendarBubble
// ---------------------------------------------------------------------------

/**
 * Build the 9-step calendar Flex Message bubble.
 * Renders each step as a compact row with code, name, due day, and status.
 * Pending photo-requiring steps include a camera URI button.
 *
 * @param steps     - Array of calendar step data.
 * @param liffId    - LIFF app ID for constructing camera page URIs.
 * @param plotId    - Current plot ID for photo submission context.
 * @param seasonId  - Current season ID for photo submission context.
 * @returns A `LineMessage` with type "flex" or "text" (error).
 */
export function buildCalendarBubble(
  steps: Array<{
    stepCode: string;
    stepName: string;
    dueDay: number;
    status: string;
    requiresPhoto: boolean;
  }>,
  appUrl: string,
  plotId?: string,
  seasonId?: string,
  liffId?: string,
): LineMessage {
  // Guard: without an app URL there is nowhere to deep-link the camera, so a
  // flex card would render a button that goes nowhere.
  if (!appUrl) {
    return {
      type: "text",
      text: " กล้องถ่ายรูปยังไม่พร้อมใช้งาน กรุณาติดต่อเจ้าหน้าที่",
    };
  }

  // PJ-13 — artifact card: teal hero, SG-01..SG-09 badge, 9-step calendar.
  // Each photo step keeps its own camera deep link; the step, plot and season
  // travel in the URL so the camera page knows what it is shooting.
  const cameraBase = liffId
    ? `https://liff.line.me/${liffId}/liff/camera`
    : `${appUrl}/liff/camera`;

  const card = buildArtifactCard({
    tone: "teal",
    badge: "SG-01 ถึง SG-09",
    hero: "ปฏิทินฤดูนี้ 9 ขั้นตอน",
    title: "ฤดูนี้มี 9 ขั้นตอนที่ต้องบันทึกครับ",
    subtitle: "ขั้นที่ยังไม่ถึงกำหนดจะกดบันทึกไม่ได้",
    rows: steps.map((st) => ({
      label: st.stepCode,
      value: st.stepName,
      tone: st.status === "done" ? ("good" as const) : ("neutral" as const),
    })),
    actions: [
      ...steps
        .filter((st) => st.requiresPhoto)
        .map((st) => {
          const cameraUrl = new URL(cameraBase);
          cameraUrl.searchParams.set("step", st.stepCode);
          if (plotId) cameraUrl.searchParams.set("plot_id", plotId);
          if (seasonId) cameraUrl.searchParams.set("season_id", seasonId);
          return {
            label: `📸 ถ่ายรูป ${st.stepCode}`,
            primary: false,
            uri: cameraUrl.toString(),
          };
        }),
      { label: "ดูทั้งปฏิทิน", primary: true, uri: appUrl },
    ],
  });
  return card;
}

// ---------------------------------------------------------------------------
// 6b. buildConsent4Checkbox  (OB-15)
// ---------------------------------------------------------------------------

/**
 * Build the OB-15 4-type PDPA consent Flex Message card (CS-01..CS-04).
 * Shows 4 checkboxes with individual accept toggles and an accept-all button.
 *
 * @returns A `LineMessage` with type "flex".
 */
export function buildConsent4Checkbox(): LineMessage {
  const consentItems: Array<{ key: string; code: string; label: string }> = [
    { key: "pdpa", code: "CS-01", label: "同意 PDPA คุ้มครองข้อมูลส่วนบุคคล" },
    { key: "data_collection", code: "CS-02", label: "ยอมรับการเก็บข้อมูลการเกษตร" },
    { key: "photo_sharing", code: "CS-03", label: "ยอมรับการแชร์รูปถ่ายหลักฐาน" },
    { key: "carbon_project", code: "CS-04", label: "เข้าร่วมโครงการคาร์บอนเครดิต" },
  ];

  const checkboxes = consentItems.map((item) => ({
    type: "box" as const,
    layout: "horizontal" as const,
    contents: [
      {
        type: "text" as const,
        text: `[ ] ${item.code} · ${item.label}`,
        size: "sm" as const,
        wrap: true,
        color: COLOR_TEXT,
        flex: 1,
      },
    ],
    action: {
      type: "postback" as const,
      label: item.label,
      data: `action=consent_${item.key}`,
    },
  }));

  return {
    type: "flex",
    altText: "กรุณาตอบรับเงื่อนไข 4 ข้อ",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: "เงื่อนไขการใช้งาน", weight: "bold", size: "lg", color: COLOR_TEXT },
          { type: "separator", margin: "sm" },
          ...checkboxes,
          { type: "separator", margin: "md" },
          {
            type: "text",
            text: "ยอมรับทั้ง 4 ข้อเพื่อดำเนินการต่อ",
            size: "xs",
            color: COLOR_SUBTLE,
            wrap: true,
            margin: "md",
          },
        ],
      },
      footer: {
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "✅ ยอมรับทั้งหมด",
                size: "sm",
                color: COLOR_BG,
                align: "center",
                weight: "bold",
              },
            ],
            paddingAll: PADDING_ACTION_V,
            paddingStart: PADDING_ACTION_H,
            paddingEnd: PADDING_ACTION_H,
            backgroundColor: COLOR_PRIMARY,
            cornerRadius: RADIUS_ACTION,
            flex: 1,
            margin: "md",
            action: {
              type: "postback",
              label: "✅ ยอมรับทั้งหมด",
              data: "action=consent_accept_all",
            },
          },
        ],
      },
    },
  };
}

// ---------------------------------------------------------------------------
// 6c. buildConditions3Checkbox  (OB-05 — tick-accept)
// ---------------------------------------------------------------------------

/**
 * Build the OB-05 project conditions Flex Message card with 3 checkboxes.
 * Lists the 3 conditions and provides accept / reject buttons.
 *
 * @returns A `LineMessage` with type "flex".
 */
export function buildConditions3Checkbox(): LineMessage {
  // OB-05 — artifact card: navy hero, 3-item badge, tick-to-continue.
  return buildArtifactCard({
    tone: "navy",
    badge: "3 ข้อ",
    hero: "เงื่อนไขการเข้าร่วมโครงการ",
    title: "ต้องติ๊กครบทุกข้อจึงจะไปต่อได้",
    subtitle: "ระบบเก็บวันเวลาและเวอร์ชันของข้อความไว้เป็นหลักฐาน",
    body: "1. ส่งภาพหลักฐานตามปฏิทิน 4 รอบต่อครอป\n2. ให้ข้อมูลแปลงนาตามจริง\n3. ยินยอมให้ตรวจสอบแปลง",
    actions: [
      { label: "อ่านข้อความเต็ม" },
      {
        label: "ยอมรับทั้ง 3 ข้อ",
        primary: true,
        postback: { type: "postback", data: "action=conditions_accept" },
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// 7. buildDashboardBubble
// ---------------------------------------------------------------------------

/**
 * Build the carbon credit dashboard Flex Message bubble.
 * Shows farmer info, carbon estimate, SF_w factor, photo progress, and
 * pending tasks with quick-action buttons.
 *
 * @param data - Dashboard data including farmer details and metrics.
 * @returns A `LineMessage` with type "flex".
 */
export function buildDashboardBubble(data: {
  farmerName: string;
  plotName: string;
  totalOffset: number;
  sfW: number;
  approvedPhotos: number;
  totalPhotos: number;
  pendingTasks: number;
  appUrl?: string;
}): LineMessage {
  // RP-03 — artifact card: teal hero, season badge, results + history actions.
  return buildArtifactCard({
    tone: "teal",
    badge: "นาปี 2569",
    hero: "สรุปผลของฉัน",
    title: `${data.plotName}`,
    subtitle: data.farmerName,
    rows: [
      { label: "คาร์บอนลดได้", value: `${data.totalOffset} tCO₂e`, tone: "good" },
      { label: "SF-W", value: `${data.sfW}` },
      { label: "ภาพ", value: `${data.approvedPhotos}/${data.totalPhotos}` },
      {
        label: "งานค้าง",
        value: `${data.pendingTasks}`,
        tone: data.pendingTasks ? "warn" : "neutral",
      },
    ],
    actions: [
      { label: "ดูประวัติการส่ง", uri: data.appUrl },
      { label: "เปิดแดชบอร์ดของฉัน", primary: true, uri: data.appUrl },
    ],
  });
}

// ---------------------------------------------------------------------------
// 8. buildQuickReplies
// ---------------------------------------------------------------------------

/**
 * Build quick reply items for attaching to a text message.
 *
 * @param items - Array of quick reply options with label and trigger text.
 * @returns An object suitable for the `quickReply` field of a LINE text message.
 */
export function buildQuickReplies(items: Array<{ label: string; text: string }>): {
  quickReply: {
    items: Array<{ type: string; action: { type: string; text: string }; label: string }>;
  };
} {
  return {
    quickReply: {
      items: items.map((item) => ({
        type: "action",
        action: { type: "message", text: item.text },
        label: item.label,
      })),
    },
  };
}

// ---------------------------------------------------------------------------
// Helper: textMessage
// ---------------------------------------------------------------------------

/**
 * Build a LINE text message with optional quick replies.
 *
 * @param text         - The message body text.
 * @param quickReplies - Optional quick reply items (output of {@link buildQuickReplies}).
 * @returns A `LineMessage` with type "text".
 */
export function textMessage(
  text: string,
  quickReplies?: Array<{ label: string; text: string }>,
): LineMessage {
  const msg: LineMessage = { type: "text", text };
  if (quickReplies && quickReplies.length > 0) {
    msg.quickReply = buildQuickReplies(quickReplies).quickReply;
  }
  return msg;
}

// ---------------------------------------------------------------------------
// 13. Nodes with no builder before this spec (node-design-spec.md §6)
//     Each is data-only; the card layout is buildArtifactCard's.
// ---------------------------------------------------------------------------

/** OB-13 — documents the plot must attach (amber, step 2 of 2). */
export function buildDocumentsPromptBubble(liffUrl: string): LineMessage {
  return buildArtifactCard({
    tone: "amber",
    badge: "2 จาก 2",
    hero: "เอกสารสิทธิ์ของแปลง 12345-01",
    title: "แปลงนี้ต้องแนบเอกสาร 3 รายการครับ",
    subtitle: "ถ่ายจากของจริงได้เลย ให้เห็นครบทั้งใบนะครับ",
    actions: [{ label: "ดาวน์โหลดแบบฟอร์ม" }, { label: "ถ่ายเอกสาร", primary: true, uri: liffUrl }],
  });
}

/** OB-10 — application received, review pending (grey). Backfill is the only
 *  activity allowed until review completes. */
export function buildPendingReviewBubble(backfillUrl?: string): LineMessage {
  return buildArtifactCard({
    tone: "grey",
    badge: "pending_review",
    hero: "รอเจ้าหน้าที่ตรวจเอกสาร",
    title: "รับใบสมัครแล้วครับ ✅",
    subtitle: "สมชาย ใจดี · แปลงนาหลังบ้าน · 14.0 ไร่",
    body: "ระหว่างนี้ยังส่งภาพกิจกรรมไม่ได้ แต่กรอกข้อมูลย้อนหลังไว้ก่อนได้เลยครับ",
    actions: [
      { label: "แก้ไขใบสมัคร" },
      ...(backfillUrl
        ? [{ label: "กรอกข้อมูลย้อนหลัง", primary: true, uri: backfillUrl } as ArtifactAction]
        : [{ label: "กรอกข้อมูลย้อนหลัง", primary: true } as ArtifactAction]),
    ],
  });
}

/** OB-11 — account activated, carrying the farmer's registration code (teal). */
export function buildActivationBubble(farmerCode: string): LineMessage {
  return buildArtifactCard({
    tone: "teal",
    badge: "active",
    hero: "บัญชีของคุณเปิดใช้งานแล้ว 🎉",
    title: `รหัสเกษตรกร ${farmerCode}`,
    subtitle: "ผู้ประสานงานยืนยันตัวตนเรียบร้อย",
    actions: [
      {
        label: "เริ่มใช้งาน",
        primary: true,
        postback: { type: "postback", data: "action=activation" },
      },
    ],
  });
}

/** PJ-02 — a photo round is due. Wet rounds get a navy hero, dry rounds amber,
 *  matching the artifact's two variants. */
export function buildPhotoReminderBubble(input: {
  roundLabel: string;
  stepCode: string;
  /** 1-based round number; the artifact hero reads "รอบที่ 1 · ช่วงเปียก". */
  roundNumber: number;
  isWet: boolean;
  plotName: string;
  dayAfterSow: number;
  cameraUrl: string;
}): LineMessage {
  return buildArtifactCard({
    tone: input.isWet ? "navy" : "amber",
    badge: `${input.roundLabel} · ${input.stepCode}`,
    hero: `รอบที่ ${input.roundNumber} · ช่วง${input.isWet ? "เปียก" : "แห้ง"}`,
    title: input.isWet ? "ถึงเวลารายงานแล้วครับ 🌾" : "ปล่อยน้ำแห้งรอบแรกได้แล้วครับ",
    subtitle: `${input.plotName} · วันที่ ${input.dayAfterSow} หลังหว่าน`,
    actions: [
      { label: input.isWet ? "ยังไม่ได้ทำ" : "ขอดูวิธีถ่าย" },
      { label: "ถ่ายภาพส่งเลย", primary: true, uri: input.cameraUrl },
    ],
  });
}

/** PJ-06 — confirm before sending (grey, "before send"). */
export function buildConfirmBeforeSendBubble(input: {
  plotName: string;
  roundLabel: string;
  stepCode: string;
  cameraUrl: string;
}): LineMessage {
  return buildArtifactCard({
    tone: "grey",
    badge: "ก่อนส่ง",
    hero: "ตรวจดูอีกครั้งนะครับ",
    title: `${input.plotName} · ${input.roundLabel} (${input.stepCode})`,
    actions: [
      { label: "ถ่ายภาพใหม่", uri: input.cameraUrl },
      { label: "ส่งข้อมูล", primary: true },
    ],
  });
}

/** PJ-08 — a photo passed review, with crop progress (teal). */
export function buildPhotoAcceptedBubble(input: {
  roundLabel: string;
  approved: number;
  total: number;
  summaryUrl?: string;
}): LineMessage {
  return buildArtifactCard({
    tone: "teal",
    badge: input.roundLabel,
    hero: "ภาพผ่านการตรวจแล้ว ✅",
    title: `ครอปนี้ส่งแล้ว ${input.approved} จาก ${input.total} ภาพ`,
    actions: [
      ...(input.summaryUrl
        ? [{ label: "ดูสรุปแปลง", primary: true, uri: input.summaryUrl } as ArtifactAction]
        : [{ label: "ดูสรุปแปลง", primary: true } as ArtifactAction]),
    ],
  });
}

/** RP-01 — outstanding tasks (navy, TODO). */
export function buildTodoBubble(input: { remaining: number; backfillUrl?: string }): LineMessage {
  return buildArtifactCard({
    tone: "navy",
    badge: "TODO",
    hero: "งานค้างของคุณ",
    title: `เหลือ ${input.remaining} เรื่องที่ต้องทำครับ`,
    actions: [
      { label: "กรอกย้อนหลัง", ...(input.backfillUrl ? { uri: input.backfillUrl } : {}) },
      { label: "บันทึกกิจกรรม", primary: true },
    ],
  });
}
