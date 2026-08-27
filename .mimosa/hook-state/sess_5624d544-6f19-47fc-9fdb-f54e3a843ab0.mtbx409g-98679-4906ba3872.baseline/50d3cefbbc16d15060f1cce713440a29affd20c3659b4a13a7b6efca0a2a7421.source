/**
 * Issue #125 — Retake push notification composition.
 * Composes retake instruction messages for farmers.
 */

export interface RetakeMessage {
  message_type: "retake_notification";
  raw_text: string;
  locale: string;
}

/**
 * Compose a retake message based on rejection reason.
 */
export function composeRetakeMessage(reason: string, locale = "th"): RetakeMessage {
  const messages: Record<string, Record<string, string>> = {
    th: {
      low_confidence: "ภาพไม่ชัดเจน กรุณาถ่ายใหม่ให้เห็นท่อวัดน้ำชัดเจนขึ้น",
      temporal_mismatch: "ช่วงเวลาไม่ตรงกับที่บันทึก กรุณาถ่ายใหม่ในช่วงเวลาที่ถูกต้อง",
      invalid: "ไม่พบท่อวัดน้ำในภาพ กรุณาถ่ายให้เห็นท่อวัดน้ำ",
      default: "กรุณาถ่ายภาพใหม่ตามคำแนะนำ",
    },
    en: {
      low_confidence: "Photo unclear. Please retake showing the water pipe clearly.",
      temporal_mismatch: "Time mismatch. Please retake during the correct time period.",
      invalid: "No water pipe detected. Please retake showing the water pipe.",
      default: "Please retake the photo following the instructions.",
    },
  };

  // Determine message key from reason
  let key = "default";
  const reasonLower = reason.toLowerCase();
  if (reasonLower.includes("confidence") || reasonLower.includes("ไม่ชัดเจน") || reasonLower.includes("unclear")) {
    key = "low_confidence";
  } else if (reasonLower.includes("temporal") || reasonLower.includes("ช่วงเวลา") || reasonLower.includes("time")) {
    key = "temporal_mismatch";
  } else if (reasonLower.includes("invalid") || reasonLower.includes("ไม่พบท่อ") || reasonLower.includes("no water pipe") || reasonLower.includes("pipe")) {
    key = "invalid";
  }

  const text = messages[locale]?.[key] ?? messages.en[key] ?? messages.en.default;

  return {
    message_type: "retake_notification",
    raw_text: text,
    locale,
  };
}
