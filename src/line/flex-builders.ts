/**
 * LINE Flex Message bubble builders for the NetZeroCarbon chatbot.
 *
 * Each builder returns a `LineMessage` object compatible with the
 * type defined in `src/line/reply.ts`. Color scheme follows LINE
 * guidelines: primary green #06c755, white background, dark text.
 */

type LineMessage = {
  type: string;
  text?: string;
  altText?: string;
  contents?: unknown;
  quickReply?: unknown;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COLOR_PRIMARY = "#06c755";
const COLOR_TEXT = "#333333";
const COLOR_SUBTLE = "#888888";
const COLOR_ERROR = "#dc3545";
const COLOR_BG = "#FFFFFF";

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
  return {
    type: "flex",
    altText: "ยินดีต้อนรับสู่ NetZeroCarbon",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: "🌱 NetZeroCarbon", weight: "bold", size: "xl", color: COLOR_TEXT },
          { type: "separator", margin: "lg" },
          {
            type: "text",
            text: "โครงการทำนาลดโลกร้อน (เปียกสลับแห้ง)\n\nสวัสดีครับ 🌾 นี่คือ LINE ของ NetZeroCarbon\nใช้ส่งภาพและกรอกข้อมูลแปลงนา เพื่อคิดคาร์บอนเครดิตให้พี่น้องเกษตรกรครับ",
            size: "sm",
            color: COLOR_TEXT,
            wrap: true,
            margin: "lg",
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "🔗 เริ่มผูกบัญชี",
                size: "sm",
                color: COLOR_BG,
                align: "center",
                weight: "bold",
                flex: 0,
              },
            ],
            paddingAll: "10px",
            backgroundColor: COLOR_PRIMARY,
            cornerRadius: "6px",
            action: {
              type: "postback",
              label: "🔗 เริ่มผูกบัญชี",
              data: `action=start_registration&liffId=${liffId}`.slice(0, 300),
            },
          },
        ],
      },
    },
  };
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
  return {
    type: "flex",
    altText: "CS-01 · PDPA — ความยินยอมเก็บและใช้ข้อมูลส่วนบุคคล",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: "CS-01 · PDPA", weight: "bold", size: "lg", color: COLOR_TEXT },
          { type: "separator", margin: "md" },
          {
            type: "text",
            text: "ความยินยอมเก็บและใช้ข้อมูลส่วนบุคคล",
            size: "sm",
            color: COLOR_TEXT,
            wrap: true,
            margin: "md",
          },
          {
            type: "text",
            text: "เก็บอะไร\nชื่อ · เพศ · เบอร์โทร · ที่อยู่ · เลขบัตร ปชช.\n\nใช้ทำอะไร\nขึ้นทะเบียนโครงการคาร์บอนเครดิต\n\nถอนความยินยอม\nทำได้ทุกเมื่อ แจ้งผู้ประสานงาน",
            size: "xs",
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
                text: "✅ ยินยอม",
                size: "sm",
                color: COLOR_BG,
                align: "center",
                weight: "bold",
              },
            ],
            paddingAll: "10px",
            backgroundColor: COLOR_PRIMARY,
            cornerRadius: "6px",
            flex: 1,
            margin: "md",
            action: {
              type: "postback",
              label: "✅ ยินยอม",
              data: "action=consent_accept",
            },
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "❌ ไม่ยินยอม",
                size: "sm",
                color: COLOR_BG,
                align: "center",
                weight: "bold",
              },
            ],
            paddingAll: "10px",
            backgroundColor: COLOR_ERROR,
            cornerRadius: "6px",
            flex: 1,
            margin: "md",
            action: {
              type: "postback",
              label: "❌ ไม่ยินยอม",
              data: "action=consent_reject",
            },
          },
        ],
      },
    },
  };
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
  return {
    type: "flex",
    altText: "ยืนยันตัวตน",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: "ยืนยันตัวตน", weight: "bold", size: "lg", color: COLOR_TEXT },
          { type: "separator", margin: "md" },
          {
            type: "text",
            text: "พบเบอร์นี้ในทะเบียนแล้ว",
            size: "sm",
            color: COLOR_TEXT,
            wrap: true,
            margin: "md",
          },
          {
            type: "text",
            text: `${farmerName}\nอ.${district} จ.${province}`,
            size: "md",
            color: COLOR_TEXT,
            wrap: true,
            weight: "bold",
            margin: "md",
          },
          {
            type: "text",
            text: "ใช่ท่านหรือไม่ครับ",
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
                text: "✅ ใช่",
                size: "sm",
                color: COLOR_BG,
                align: "center",
                weight: "bold",
              },
            ],
            paddingAll: "10px",
            backgroundColor: COLOR_PRIMARY,
            cornerRadius: "6px",
            flex: 1,
            margin: "md",
            action: {
              type: "postback",
              label: "✅ ใช่",
              data: "action=identity_confirm",
            },
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "❌ ไม่ใช่",
                size: "sm",
                color: COLOR_BG,
                align: "center",
                weight: "bold",
              },
            ],
            paddingAll: "10px",
            backgroundColor: COLOR_ERROR,
            cornerRadius: "6px",
            flex: 1,
            margin: "md",
            action: {
              type: "postback",
              label: "❌ ไม่ใช่",
              data: "action=identity_reject",
            },
          },
        ],
      },
    },
  };
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
            paddingAll: "10px",
            backgroundColor: COLOR_PRIMARY,
            cornerRadius: "6px",
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
            paddingAll: "10px",
            backgroundColor: COLOR_ERROR,
            cornerRadius: "6px",
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
  return {
    type: "flex",
    altText: "ฟอร์มสมัคร (LF-01)",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: "ฟอร์มสมัคร (LF-01)", weight: "bold", size: "lg", color: COLOR_TEXT },
          { type: "separator", margin: "md" },
          {
            type: "text",
            text: "กรอกข้อมูลส่วนตัว ข้อมูลแปลงนา และเอกสารสิทธิ์ในฟอร์มนี้",
            size: "sm",
            color: COLOR_TEXT,
            wrap: true,
            margin: "md",
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "📝 เปิดฟอร์มสมัคร",
                size: "sm",
                color: COLOR_BG,
                align: "center",
                weight: "bold",
              },
            ],
            paddingAll: "10px",
            backgroundColor: COLOR_PRIMARY,
            cornerRadius: "6px",
            action: {
              type: "uri",
              label: "📝 เปิดฟอร์มสมัคร",
              uri: `${liffUrl}/register`,
            },
          },
        ],
      },
    },
  };
}

// ---------------------------------------------------------------------------
// 6. buildCalendarBubble
// ---------------------------------------------------------------------------

/**
 * Status icon for a calendar step.
 */
function stepStatusIcon(status: string): string {
  if (status === "completed") return "✅";
  if (status === "overdue") return "❌";
  return "⏳";
}

/**
 * Build the 9-step calendar Flex Message bubble.
 * Renders each step as a compact row with code, name, due day, and status.
 * Pending photo-requiring steps include a camera URI button.
 *
 * @param steps  - Array of calendar step data.
 * @param liffId - LIFF app ID for constructing camera page URIs.
 * @returns A `LineMessage` with type "flex".
 */
export function buildCalendarBubble(
  steps: Array<{
    stepCode: string;
    stepName: string;
    dueDay: number;
    status: string;
    requiresPhoto: boolean;
  }>,
  liffId: string,
): LineMessage {
  const stepRows: Array<Record<string, unknown>> = [];

  for (const step of steps) {
    const icon = stepStatusIcon(step.status);

    // Main row: code, name, due day
    stepRows.push({
      type: "box",
      layout: "horizontal",
      contents: [
        {
          type: "text",
          text: `${icon} ${step.stepCode}`,
          size: "xs",
          color: COLOR_TEXT,
          weight: "bold",
          flex: 2,
        },
        { type: "text", text: step.stepName, size: "xs", color: COLOR_TEXT, wrap: false, flex: 3 },
        {
          type: "text",
          text: `วันที่ ${step.dueDay}`,
          size: "xs",
          color: COLOR_SUBTLE,
          flex: 1,
          align: "end",
        },
      ],
      spacing: "sm",
      margin: stepRows.length > 0 ? "xs" : "none",
    });

    // Photo button row for pending steps that require a photo
    if (step.requiresPhoto && step.status === "pending") {
      stepRows.push({
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "📸 ถ่ายรูป",
                size: "xs",
                color: COLOR_BG,
                align: "center",
                weight: "bold",
                flex: 0,
              },
            ],
            paddingAll: "6px",
            backgroundColor: COLOR_PRIMARY,
            cornerRadius: "4px",
            margin: "md",
            action: {
              type: "uri",
              label: `📸 ถ่ายรูป ${step.stepCode}`,
              uri: `https://liff.line.me/${liffId}/camera?step=${step.stepCode}`,
            },
          },
        ],
        margin: "xs",
      });
    }
  }

  return {
    type: "flex",
    altText: "ปฏิทิน 9 ขั้น",
    contents: {
      type: "bubble",
      size: "mega",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: "ปฏิทิน 9 ขั้น", weight: "bold", size: "lg", color: COLOR_TEXT },
          { type: "separator", margin: "md" },
          ...stepRows,
        ],
      },
    },
  };
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
            paddingAll: "10px",
            backgroundColor: COLOR_PRIMARY,
            cornerRadius: "6px",
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
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "[ ] 1. ส่งภาพหลักฐานตามปฏิทิน 4 รอบต่อครอป",
                size: "sm",
                wrap: true,
                color: COLOR_TEXT,
                flex: 1,
              },
            ],
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "[ ] 2. ให้ข้อมูลแปลงนาตามจริง",
                size: "sm",
                wrap: true,
                color: COLOR_TEXT,
                flex: 1,
              },
            ],
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "[ ] 3. ยินยอมให้ตรวจสอบแปลง",
                size: "sm",
                wrap: true,
                color: COLOR_TEXT,
                flex: 1,
              },
            ],
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
            paddingAll: "10px",
            backgroundColor: COLOR_PRIMARY,
            cornerRadius: "6px",
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
            paddingAll: "10px",
            backgroundColor: COLOR_ERROR,
            cornerRadius: "6px",
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
}): LineMessage {
  return {
    type: "flex",
    altText: "แดชบอร์ดของฉัน",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: "แดชบอร์ดของฉัน", weight: "bold", size: "lg", color: COLOR_TEXT },
          { type: "separator", margin: "md" },
          {
            type: "text",
            text: `${data.farmerName} · ${data.plotName}`,
            size: "sm",
            color: COLOR_TEXT,
            weight: "bold",
            wrap: true,
            margin: "md",
          },
          {
            type: "text",
            text: [
              `คาร์บอนเครดิต: ${data.totalOffset.toFixed(2)} tCO₂eq`,
              `SF_w: ${data.sfW.toFixed(2)}`,
              `ภาพถ่าย: ${data.approvedPhotos}/${data.totalPhotos}`,
              `งานค้าง: ${data.pendingTasks}`,
            ].join("\n"),
            size: "xs",
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
                text: "📊 ดูปฏิทิน",
                size: "xs",
                color: COLOR_BG,
                align: "center",
                weight: "bold",
              },
            ],
            paddingAll: "10px",
            backgroundColor: COLOR_PRIMARY,
            cornerRadius: "6px",
            flex: 1,
            margin: "md",
            action: {
              type: "postback",
              label: "📊 ดูปฏิทิน",
              data: "action=show_calendar",
            },
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "📷 ส่งภาพ",
                size: "xs",
                color: COLOR_BG,
                align: "center",
                weight: "bold",
              },
            ],
            paddingAll: "10px",
            backgroundColor: COLOR_PRIMARY,
            cornerRadius: "6px",
            flex: 1,
            margin: "md",
            action: {
              type: "uri",
              label: "📷 ส่งภาพ",
              uri: "https://liff.line.me/camera",
            },
          },
        ],
      },
    },
  };
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
