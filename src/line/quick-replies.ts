/**
 * LINE Quick Reply buttons — contextual navigation for each conversation state.
 *
 * Quick Replies appear above the keyboard as tappable buttons. They use
 * `message` type actions so the text flows through the same state machine
 * handlers that already accept typed input.
 */

import type { ConversationState } from "./flow";

type QuickReplyAction =
  | { type: "message"; label: string; text: string }
  | { type: "postback"; label: string; data: string };

type QuickReplyItem = {
  action: QuickReplyAction;
};

export type QuickReply = {
  items: QuickReplyItem[];
};

/**
 * Get the Quick Reply buttons for a given conversation state.
 * Returns null for states where quick replies aren't needed (e.g. chat, phone).
 */
export function getQuickReplyForState(
  state: ConversationState,
  liffId?: string,
  _appUrl?: string,
): QuickReply | null {
  switch (state) {
    case "welcome":
      return {
        items: [
          { action: { type: "message", label: "📝 เริ่มลงทะเบียน", text: "start_registration" } },
          { action: { type: "message", label: "❓ วิธีใช้งาน", text: "help" } },
        ],
      };

    case "consent":
      return {
        items: [
          { action: { type: "message", label: "✅ ยอมรับทั้งหมด", text: "ยอมรับ" } },
          { action: { type: "message", label: "❌ ไม่ยินยอม", text: "ไม่ยินยอม" } },
        ],
      };

    // phone state: no quick replies — user must type a phone number

    case "identity_confirm":
      return {
        items: [
          { action: { type: "message", label: "✅ ใช่", text: "ใช่" } },
          { action: { type: "message", label: "❌ ไม่ใช่", text: "ไม่ใช่" } },
        ],
      };

    case "conditions":
      return {
        items: [{ action: { type: "message", label: "✅ ยอมรับเงื่อนไข", text: "ยอมรับ" } }],
      };

    case "registration": {
      const liffUrl = liffId ? `https://liff.line.me/${liffId}` : "";
      const items: QuickReplyItem[] = [];
      if (liffUrl) {
        items.push({
          action: {
            type: "postback",
            label: "📝 เปิดฟอร์มลงทะเบียน",
            data: `action=open_liff&url=${encodeURIComponent(liffUrl)}`,
          },
        });
      }
      items.push({
        action: { type: "message", label: "✅ กรอกเสร็จแล้ว", text: "registration_complete" },
      });
      return { items };
    }

    case "documents":
      return {
        items: [
          { action: { type: "message", label: "📤 อัปโหลดเอกสาร", text: "อัปโหลด" } },
          { action: { type: "message", label: "✅ อัปโหลดเสร็จแล้ว", text: "documents_complete" } },
        ],
      };

    case "pending_review":
      return {
        items: [{ action: { type: "message", label: "📞 ติดต่อเจ้าหน้าที่", text: "ติดต่อ" } }],
      };

    case "activation":
      return {
        items: [{ action: { type: "message", label: "▶️ เริ่มใช้งาน", text: "start" } }],
      };

    case "season_setup":
      return {
        items: [{ action: { type: "message", label: "⏭ ข้าม", text: "ข้าม" } }],
      };

    case "calendar":
      return {
        items: [
          { action: { type: "message", label: "📸 ถ่ายรูป", text: "ถ่ายรูป" } },
          { action: { type: "message", label: "📊 ดูผล", text: "ดูผล" } },
          { action: { type: "message", label: "📋 งานค้าง", text: "งานค้าง" } },
          { action: { type: "message", label: "🌾 แปลงนา", text: "แปลงนา" } },
          { action: { type: "message", label: "📞 ติดต่อ", text: "ติดต่อ" } },
        ],
      };

    default:
      return null;
  }
}

/**
 * Attach Quick Reply buttons to the last text message in a message array.
 * LINE API only allows quickReply on the last message.
 *
 * Usage: wrap messages before safePush:
 *   await safePush(ctx, withQuickReply(ctx.state, messages, ctx.liffId, ctx.appUrl));
 */
export function withQuickReply(
  state: ConversationState,
  messages: Array<{
    type: string;
    text?: string;
    altText?: string;
    contents?: unknown;
    quickReply?: unknown;
  }>,
  liffId?: string,
  appUrl?: string,
): typeof messages {
  const qr = getQuickReplyForState(state, liffId, appUrl);
  if (!qr || qr.items.length === 0 || messages.length === 0) return messages;

  // Clone messages array and attach quickReply to the last item
  const result = [...messages];
  const lastIdx = result.length - 1;
  result[lastIdx] = {
    ...result[lastIdx],
    quickReply: qr,
  };
  return result;
}
